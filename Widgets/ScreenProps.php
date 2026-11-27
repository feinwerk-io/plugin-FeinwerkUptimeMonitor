<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Widgets;

use Piwik\Common;
use Piwik\Container\StaticContainer;
use Piwik\Piwik;
use Piwik\Plugin\Manager;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\External\ExternalResults;
use Piwik\Plugins\FeinwerkUptimeMonitor\Feedback\PluginFeedback;
use Piwik\Plugins\FeinwerkUptimeMonitor\Promo\PromoLine;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\CheckRunner;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\Freshness;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\InternetAccess;
use Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel\SentinelVersion;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\SystemSettings;
use Piwik\Translation\Translator;

/**
 * What the Vue screens get from the server (spec 10): the website, the user's rights, the page language, whether
 * QueuedTracking and Feinwerk Sentinel are active, and whether results checked from outside come in. Data comes from the
 * plugin's API.
 */
final class ScreenProps
{
    /**
     * @param string $variant page|matomo|site|admin
     */
    public static function for(int $idSite, string $variant): array
    {
        $embedded = Piwik::getModule() === 'Widgetize' || Common::getRequestVar('disableLink', 0, 'int') === 1;
        // the uptime page itself can be put on a dashboard too: there it is a widget (card, no feedback row)
        $onDashboard = Common::getRequestVar('widget', 0, 'int') === 1;
        $ownPage = $variant === 'page' && !$embedded && !$onDashboard;

        return [
            'idSite' => $idSite,
            'siteName' => self::siteName($idSite),
            // times on the screens follow the website's timezone (Peter's 6a); Matomo's names, also "UTC+2"
            'timezone' => self::timezone($idSite),
            // the admin page's status rows (Peter's 3a): whether a system cron runs the checks, and how often
            'cron' => $variant === 'admin' ? self::cron() : null,
            // the admin page: the PHP functions the latest check run missed, the reason for its "not checkable"
            'disabledPhpFunctions' => $variant === 'admin' ? self::disabledPhpFunctions() : null,
            // the admin page: those functions are missing because PHP's curl extension is not installed (UI review L7)
            'curlMissing' => $variant === 'admin' ? self::curlMissing() : null,
            // the admin page: how the checks are sent (robustness part 2), a neutral line unless curl_multi
            'transport' => $variant === 'admin' ? self::transport() : null,
            // Matomo's internet features are off without the opt-in (Peter's 2a): no check goes out, every screen says why
            'internetOff' => self::internetOff(),
            // the admin page: Matomo's own addresses answer only after the redirect to https (audit D2)
            'httpsRedirect' => $variant === 'admin' ? self::httpsRedirect() : null,
            'variant' => $variant,
            // the page as a dashboard widget or an embed: Matomo's widget frame has no padding of its own
            'inWidget' => $variant === 'page' && ($onDashboard || $embedded),
            'isSuperUser' => Piwik::hasUserSuperUserAccess(),
            'isAdmin' => $idSite > 0 && Piwik::isUserHasAdminAccess($idSite),
            // anonymous visitors of a public dashboard see the website only, not Matomo's own health
            'isAnonymous' => Piwik::isUserIsAnonymous(),
            'language' => self::language(),
            'queuedTracking' => self::active('QueuedTracking'),
            // private addresses already allowed: no link "Allow private addresses", no sentence about it
            'allowPrivate' => !Piwik::isUserIsAnonymous() && self::allowPrivate(),
            // active, old (active but too old for these checks), inactive (files there, deactivated) or absent
            'sentinel' => self::sentinelState(
                self::active('FeinwerkSentinel'),
                self::installed('FeinwerkSentinel'),
                SentinelVersion::loaded()
            ),
            // named in the "too old" row of the admin page
            'sentinelVersion' => $variant === 'admin' ? SentinelVersion::loaded() : null,
            // the admin page (super users): where Sentinel's recipients for the whole instance are set
            'sentinelSettings' => $variant === 'admin'
                ? 'index.php?' . SentinelVersion::instanceSettingsQuery(SentinelVersion::loaded(), self::anySite()) : null,
            'embedded' => $embedded,
            // results checked from outside (another plugin, through ExternalResults): null without such a plugin
            'external' => self::external($idSite, $variant),
            // the feedback row: under the uptime page only, never in dashboard widgets or Widgetize embeds
            'feedback' => $ownPage ? self::feedback() : null,
            // the kit's tip line below it, same place (docs/promotions.md, footer variant A)
            'promo' => $ownPage ? self::promo($idSite) : null,
            // the kit's card in every widget on a dashboard (Peter, 2026-11-24, 7b); never in Widgetize embeds
            'promoCard' => !$embedded && ($onDashboard || $variant !== 'page') && $variant !== 'admin'
                ? self::promoCard($idSite) : null,
        ];
    }

    /**
     * The tip line of the Feinwerk promotion kit (PromoLine, copy of PageFilterReport 0338553): null for users without
     * admin access, in embeds and when promotions are switched off. A failing promotion never breaks the page.
     *
     * @return array<string, mixed>|null {id, placement, title, text, link, url, external, note, dismissDays, demo}
     */
    private static function promo(int $idSite): ?array
    {
        try {
            if ($idSite <= 0 || PromoLine::isEmbedded(Piwik::getModule(), Common::getRequestVar('disableLink', 0, 'int'))) {
                return null;
            }

            return PromoLine::current($idSite);
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * The plugin that adds results checked from outside, as the screens show it: active (delivering: licensed and it
     * reached its service within two hours, ExternalResults::isActive) for everyone who sees the page; registered but
     * not active (not set up yet, or stopped) only for admins of the website and super users, who get the link to its
     * settings. Null without such a plugin: the screens as before. The first active source wins, else the first one.
     * alerts: the active source sends alerts for outages itself (the admin page's alert row names it; false on the other
     * screens, which never read it). resultsAt: when its latest results arrived (null: none yet, or it does not say;
     * the admin page only, like alerts). sidesMargin: how much newer (seconds) one side's result must be than the start
     * of the other side's failure to count (Freshness::sidesMargin(), the same as getSitesOverview; vue/src/sides.ts).
     *
     * @param string $variant page|matomo|site|admin
     * @return array{active: bool, name: string, reachedAt: ?string, settingsUrl: ?string, alerts: bool, resultsAt: ?string, sidesMargin: int}|null
     */
    private static function external(int $idSite, string $variant): ?array
    {
        try {
            $sources = ExternalResults::sources();
            if ($sources === []) {
                return null;
            }
            // the seam's one rule, on the sources read once
            $active = ExternalResults::activeOf($sources, time());
            $admin = Piwik::hasUserSuperUserAccess() || ($idSite > 0 && Piwik::isUserHasAdminAccess($idSite));
            if ($active === null && !$admin) {
                return null;
            }
            $source = $active ?? $sources[0];

            return [
                'active' => $active !== null,
                'name' => $source['name'],
                'reachedAt' => $source['reachedAt'],
                'settingsUrl' => $admin ? $source['settingsUrl'] : null,
                'alerts' => $variant === 'admin' && $active !== null && $active['alerts'],
                'resultsAt' => $variant === 'admin' ? ($source['resultsAt'] ?? null) : null,
                'sidesMargin' => Freshness::sidesMargin(),
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Whether the latest check of one of Matomo's own addresses (idSite 0, and the Tag Manager containers, whose file the
     * Matomo server serves) answered only after the redirect to the same address with https (note https_redirect):
     * Matomo is stored with http behind a proxy that handles https. False when it cannot be read.
     */
    private static function httpsRedirect(): bool
    {
        try {
            return (new StateStore())->instanceAddressHasNote(Outcome::HTTPS_REDIRECT);
        } catch (\Throwable $e) {
            return false;
        }
    }

    /** whether the checks send nothing because Matomo's internet features are off (InternetAccess); false when unknown */
    private static function internetOff(): bool
    {
        try {
            return !InternetAccess::checksAllowed();
        } catch (\Throwable $e) {
            return false;
        }
    }

    /** whether PHP's curl extension is not installed (Capabilities::curlMissing()); false when unknown */
    private static function curlMissing(): bool
    {
        try {
            return CheckRunner::capabilities()->curlMissing();
        } catch (\Throwable $e) {
            return false;
        }
    }

    /** Capabilities::transportName() of the checks, null when it cannot be read */
    private static function transport(): ?string
    {
        try {
            return CheckRunner::capabilities()->transportName();
        } catch (\Throwable $e) {
            return null;
        }
    }

    /** @return string[] CheckRunner::disabledPhpFunctions(), empty when it cannot be read */
    private static function disabledPhpFunctions(): array
    {
        try {
            return CheckRunner::disabledPhpFunctions();
        } catch (\Throwable $e) {
            return [];
        }
    }

    private static function timezone(int $idSite): string
    {
        try {
            return $idSite > 0 ? (string) \Piwik\Site::getTimezoneFor($idSite) : 'UTC';
        } catch (\Throwable $e) {
            return 'UTC';
        }
    }

    /**
     * @return array{active: bool, intervalSeconds: int|null}
     */
    private static function cron(): array
    {
        $tracker = new \Piwik\Plugins\FeinwerkUptimeMonitor\Runner\IntervalTracker();
        $now = time();
        $active = $tracker->cronActive($now);

        return ['active' => $active, 'intervalSeconds' => $active ? $tracker->interval($now) : null];
    }

    /**
     * The card of the promotion kit for a widget: the tip line's message of the day as a card (PromoCard); the caller
     * asks only for widgets (the two uptime widgets, and the uptime page on a dashboard, widget=1). Null for users
     * without admin access and when promotions are off.
     *
     * @return array<string, mixed>|null
     */
    private static function promoCard(int $idSite): ?array
    {
        try {
            $place = \Piwik\Plugins\FeinwerkUptimeMonitor\Promo\PromoCard::placeFor(
                false,
                PromoLine::isEmbedded(Piwik::getModule(), Common::getRequestVar('disableLink', 0, 'int')),
                Common::getRequestVar('widget', 0, 'int') === 1
            );
            if ($idSite <= 0 || $place !== \Piwik\Plugins\FeinwerkUptimeMonitor\Promo\PromoCard::CARD) {
                return null;
            }

            return \Piwik\Plugins\FeinwerkUptimeMonitor\Promo\PromoCard::fromLine(
                PromoLine::current($idSite),
                Piwik::translate('FeinwerkUptimeMonitor_PromoCardMore')
            );
        } catch (\Throwable $e) {
            return null;
        }
    }

    /** The website's name for headings such as the panel title (idSite 0: Matomo). */
    private static function siteName(int $idSite): string
    {
        if ($idSite <= 0) {
            return 'Matomo';
        }
        try {
            return \Piwik\Common::unsanitizeInputValue((string) \Piwik\Site::getNameFor($idSite));
        } catch (\Throwable $e) {
            return '';
        }
    }

    /** The language Matomo renders this request in, e.g. "de"; admin pages leave piwik.language unset. */
    public static function language(): string
    {
        try {
            return (string) StaticContainer::get(Translator::class)->getCurrentLanguage();
        } catch (\Throwable $e) {
            return '';
        }
    }

    /**
     * @return array{enabled: bool, supportUrl: string, version: string}|null
     */
    private static function feedback(): ?array
    {
        try {
            return [
                'enabled' => PluginFeedback::enabled(),
                'supportUrl' => PluginFeedback::supportUrl(self::language()),
                'version' => (string) Manager::getInstance()->getLoadedPlugin(PluginFeedback::PLUGIN)->getVersion(),
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Feinwerk Sentinel as the admin page names it: "active", "old" (active, but too old to run this plugin's checks
     * U01 to U04, so no alerts), "inactive" (files there, deactivated) or "absent".
     */
    public static function sentinelState(bool $active, bool $installed, ?string $version): string
    {
        if ($active) {
            return SentinelVersion::supports($version) ? 'active' : 'old';
        }

        return $installed ? 'inactive' : 'absent';
    }

    /** the website of the request, else the first one the user can see (0 without any) */
    private static function anySite(): int
    {
        try {
            $idSite = Common::getRequestVar('idSite', 0, 'int');
            if ($idSite > 0) {
                return $idSite;
            }
            $ids = \Piwik\Plugins\SitesManager\API::getInstance()->getSitesIdWithAtLeastViewAccess();

            return (int) (reset($ids) ?: 0);
        } catch (\Throwable $e) {
            return 0;
        }
    }

    private static function allowPrivate(): bool
    {
        try {
            return (bool) (new SystemSettings())->allowPrivate->getValue();
        } catch (\Throwable $e) {
            return false;
        }
    }

    private static function installed(string $plugin): bool
    {
        try {
            return Manager::getInstance()->isPluginInFilesystem($plugin);
        } catch (\Throwable $e) {
            return false;
        }
    }

    private static function active(string $plugin): bool
    {
        try {
            return Manager::getInstance()->isPluginActivated($plugin);
        } catch (\Throwable $e) {
            return false;
        }
    }
}
