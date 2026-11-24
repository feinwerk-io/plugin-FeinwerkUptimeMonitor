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
use Piwik\Plugins\FeinwerkUptimeMonitor\Feedback\PluginFeedback;
use Piwik\Plugins\FeinwerkUptimeMonitor\Promo\PromoLine;
use Piwik\Translation\Translator;

/**
 * What the Vue screens get from the server (spec 10): the website, the user's rights, the page language, whether
 * QueuedTracking and Feinwerk Sentinel are active. Data comes from the plugin's API.
 */
final class ScreenProps
{
    /**
     * @param string $variant page|matomo|site|admin
     */
    public static function for(int $idSite, string $variant): array
    {
        $embedded = Piwik::getModule() === 'Widgetize' || Common::getRequestVar('disableLink', 0, 'int') === 1;

        return [
            'idSite' => $idSite,
            'siteName' => self::siteName($idSite),
            'variant' => $variant,
            'isSuperUser' => Piwik::hasUserSuperUserAccess(),
            'isAdmin' => $idSite > 0 && Piwik::isUserHasAdminAccess($idSite),
            // anonymous visitors of a public dashboard see the website only, not Matomo's own health
            'isAnonymous' => Piwik::isUserIsAnonymous(),
            'language' => self::language(),
            'queuedTracking' => self::active('QueuedTracking'),
            'sentinel' => self::active('FeinwerkSentinel') ? 'active' : 'absent',
            'embedded' => $embedded,
            // the feedback row: under the uptime page only, never in dashboard widgets or Widgetize embeds
            'feedback' => $variant === 'page' && !$embedded ? self::feedback() : null,
            // the kit's tip line below it, same place (docs/promotions.md, footer variant A)
            'promo' => $variant === 'page' && !$embedded ? self::promo($idSite) : null,
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

    private static function active(string $plugin): bool
    {
        try {
            return Manager::getInstance()->isPluginActivated($plugin);
        } catch (\Throwable $e) {
            return false;
        }
    }
}
