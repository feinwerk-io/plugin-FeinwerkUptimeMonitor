<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Targets;

use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\SitesManager\Model as SitesModel;
use Piwik\SettingsPiwik;

/**
 * The default targets (spec 5.1, 5.2): Matomo's interface, tracker endpoint and JavaScript tracker (idSite 0), each
 * website's main URL and its live Tag Manager containers. Two queries for all websites (sites, containers).
 */
final class DefaultTargets
{
    /** Website types that have a URL to check (mobile apps have none). */
    private const SITE_TYPES = ['website', 'intranet'];

    public function __construct(
        private string $trackerBaseUrl = '',
        private string $loginHost = '',
        private ?ContainerSource $containers = null,
        private ?\Closure $piwikUrl = null,
        private ?\Closure $sites = null,
        private ?\Closure $loginPlugin = null
    ) {
    }

    /** The container source of these defaults (live revisions are read from it on every run). */
    public function containers(): ContainerSource
    {
        return $this->containers ??= new ContainerSource();
    }

    /**
     * The interface address: Matomo's login page, which shows its form to everyone who is not logged in, also where
     * anonymous users may view websites (index.php then forwards to a dashboard). With a single sign-on plugin in place
     * of Matomo's Login, index.php, which hands over to that plugin.
     */
    private function interfacePath(): string
    {
        try {
            $plugin = $this->loginPlugin !== null ? ($this->loginPlugin)() : \Piwik\Piwik::getLoginPluginName();
        } catch (\Throwable $e) {
            $plugin = '';
        }

        return $plugin === 'Login' ? 'index.php?module=Login' : 'index.php';
    }

    /**
     * @return list<array{idSite: int, key: string, kind: string, url: string, extra: array}>
     */
    public function specs(): array
    {
        $matomo = $this->matomoUrl();
        $matomoHost = strtolower((string) parse_url($matomo, PHP_URL_HOST));
        $trackerBase = trim($this->trackerBaseUrl) !== '' ? rtrim(trim($this->trackerBaseUrl), '/') . '/' : $matomo;
        $base = ['matomoHost' => $matomoHost];
        if (trim($this->loginHost) !== '') {
            $base['loginHost'] = strtolower(trim($this->loginHost));
        }

        $specs = [
            ['idSite' => 0, 'key' => Kind::UI, 'kind' => Kind::UI, 'url' => $matomo . $this->interfacePath(), 'extra' => $base],
            ['idSite' => 0, 'key' => Kind::TRACKER, 'kind' => Kind::TRACKER, 'url' => $trackerBase . 'matomo.php', 'extra' => $base],
            ['idSite' => 0, 'key' => Kind::JS, 'kind' => Kind::JS, 'url' => $trackerBase . 'matomo.js', 'extra' => $base],
        ];

        $siteIds = [];
        foreach ($this->sites() as $site) {
            $type = (string) ($site['type'] ?? 'website');
            $url = trim((string) ($site['main_url'] ?? ''));
            if (!in_array($type, self::SITE_TYPES, true) || !preg_match('~^https?://~i', $url)) {
                continue;
            }
            $idSite = (int) $site['idsite'];
            $siteIds[$idSite] = true;
            $specs[] = ['idSite' => $idSite, 'key' => self::webKey($url), 'kind' => Kind::WEB, 'url' => $url, 'extra' => $base];
        }

        $containers = $this->containers();
        foreach ($containers->liveContainers() as $container) {
            if (!isset($siteIds[$container['idsite']])) {
                continue;
            }
            $specs[] = [
                'idSite' => $container['idsite'],
                'key' => 'ctr:' . $container['idcontainer'],
                'kind' => Kind::CONTAINER,
                'url' => $matomo . $containers->path($container['idcontainer']),
                'extra' => $base + ['idContainer' => $container['idcontainer'], 'revision' => $container['revision']],
            ];
        }

        return $specs;
    }

    /**
     * Target key of a website URL: short, stable, never the URL itself (Sentinel subjects are 64 characters at most).
     */
    public static function webKey(string $url): string
    {
        // a trailing slash or upper case letters in the main URL must not make a new target with an empty history
        return 'web:' . substr(sha1(rtrim(strtolower(trim($url)), '/')), 0, 8);
    }

    private function matomoUrl(): string
    {
        $url = $this->piwikUrl !== null ? ($this->piwikUrl)() : SettingsPiwik::getPiwikUrl();

        return rtrim((string) $url, '/') . '/';
    }

    private function sites(): array
    {
        return $this->sites !== null ? ($this->sites)() : (new SitesModel())->getAllSites();
    }
}
