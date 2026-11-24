<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor;

use Piwik\Common;
use Piwik\Config;
use Piwik\Option;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Schema;
use Piwik\Plugins\FeinwerkUptimeMonitor\Tracker\TimingSampler;
use Piwik\Tracker;

class FeinwerkUptimeMonitor extends \Piwik\Plugin
{
    public const OPTION_PREFIX = 'fw_uptimemonitor_';

    public function registerEvents()
    {
        return [
            'Db.getTablesInstalled' => 'getTablesInstalled',
            'AssetManager.getStylesheetFiles' => 'getStylesheetFiles',
            'AssetManager.getJavaScriptFiles' => 'getJavaScriptFiles',
            'UsersManager.deleteUser' => 'deleteUserFeedback',
            'SitesManager.deleteSite.end' => 'onSiteDeleted',
            'Translate.getClientSideTranslationKeys' => 'getClientSideTranslationKeys',
            // also makes Matomo load the plugin in tracker mode (Plugin\Manager::isTrackerPlugin, prefix "Tracker.")
            'Tracker.end' => 'onTrackerEnd',
            // Feinwerk Sentinel's add-on checks and hints (shared interface; nothing happens without Sentinel)
            'FeinwerkSentinel.registerChecks' => 'registerSentinelChecks',
            'FeinwerkSentinel.incidentOpened' => 'onSentinelIncidentOpened',
        ];
    }

    public function install()
    {
        Schema::create();
    }

    public function uninstall()
    {
        Schema::drop();
        Option::deleteLike(self::OPTION_PREFIX . '%');
        Option::deleteLike(Feedback\PluginFeedback::THROTTLE_OPTION_PREFIX . '%');
    }

    /**
     * Samples the processing time of real tracking requests (spec 6.6). Cheap on a miss: one config lookup in memory
     * and one random number.
     */
    public function onTrackerEnd(): void
    {
        $section = Config::getInstance()->FeinwerkUptimeMonitor;
        $rate = is_array($section) && isset($section['tracker_timing_sample']) ? (int) $section['tracker_timing_sample'] : 100;

        (new TimingSampler($rate, static function (string $at, int $ms, bool $isBulk): void {
            $db = self::connectedTrackerDb();
            if ($db === null) {
                return; // no database in this request (e.g. a queue in front of it): no sample rather than a connection
            }
            // Matomo ran its scheduled tasks inside this tracking request (browser-triggered archiving): its time is
            // no tracking time
            $started = (float) ($_SERVER['REQUEST_TIME_FLOAT'] ?? 0);
            if ((int) Option::get('lastTrackerCronRun') >= (int) floor($started)) {
                return;
            }
            $db->query(
                'INSERT INTO ' . Common::prefixTable(Schema::SAMPLE) . ' (sampled_at, ms, is_bulk) VALUES (?, ?, ?)',
                [$at, $ms, $isBulk ? 1 : 0]
            );
        }))->onTrackerEnd($_SERVER, $_GET, $_POST, static fn(): string => (string) file_get_contents('php://input'));
    }

    /**
     * The tracker's database connection if this request already opened one, else null (Matomo 5.0 to 6 keep it in the
     * private static Tracker::$db; Tracker::isDatabaseConnected() needs a Tracker instance).
     */
    private static function connectedTrackerDb()
    {
        try {
            // readable without setAccessible() since PHP 8.1 (deprecated in 8.5)
            $db = (new \ReflectionProperty(Tracker::class, 'db'))->getValue();
        } catch (\Throwable $e) {
            return null;
        }

        return is_object($db) ? $db : null;
    }

    /**
     * Alerts through Feinwerk Sentinel when it is installed (Peter, 2026-11-24, "B"): U01 to U04.
     */
    public function registerSentinelChecks(&$checks): void
    {
        if (!interface_exists('Piwik\\Plugins\\FeinwerkSentinel\\Check\\Check')) {
            return;
        }
        $checks[] = new Sentinel\MatomoUnreachable();
        $checks[] = new Sentinel\SiteUnreachable();
        $checks[] = new Sentinel\CertificateExpiry();
        $checks[] = new Sentinel\SlowTracker();
    }

    public function onSentinelIncidentOpened($incident): void
    {
        if (is_array($incident)) {
            (new Sentinel\Hints())->addTo($incident);
        }
    }

    public function getStylesheetFiles(&$files): void
    {
        $files[] = 'plugins/FeinwerkUptimeMonitor/stylesheets/uptime.less';
        $files[] = 'plugins/FeinwerkUptimeMonitor/stylesheets/feedback.less';
        // the Feinwerk promotion kit: tip line, its logo and the connector installer page (copies of PageFilterReport 0338553)
        $files[] = 'plugins/FeinwerkUptimeMonitor/stylesheets/promo.css';
        $files[] = 'plugins/FeinwerkUptimeMonitor/stylesheets/feinwerklogo.css';
        $files[] = 'plugins/FeinwerkUptimeMonitor/stylesheets/connectorinstaller.css';
    }

    /** The kit's scripts: the tip line's hiding and one-per-page rule, the installer button's busy state. */
    public function getJavaScriptFiles(&$files): void
    {
        $files[] = 'plugins/FeinwerkUptimeMonitor/javascripts/promo.js';
        $files[] = 'plugins/FeinwerkUptimeMonitor/javascripts/connectorinstaller.js';
    }

    /** A deleted website's check targets go with it (no more requests to its addresses). */
    public function onSiteDeleted($idSite): void
    {
        try {
            (new Store\TargetStore())->deleteSite((int) $idSite);
        } catch (\Throwable $e) {
            // never block Matomo's own deletion; due() skips targets of websites that no longer exist
        }
    }

    /** A deleted user's feedback throttles go with them. */
    public function deleteUserFeedback($login): void
    {
        Option::deleteLike(Feedback\PluginFeedback::userOptionPattern((string) $login));
    }

    /**
     * The texts of the Vue screens: every key starting with "Ui", "Cause_", "Feedback" or "Support" of lang/en.json,
     * the menu title and the tip line's hide label.
     */
    public function getClientSideTranslationKeys(&$keys): void
    {
        $file = __DIR__ . '/lang/en.json';
        $data = json_decode((string) @file_get_contents($file), true);
        foreach (array_keys($data['FeinwerkUptimeMonitor'] ?? []) as $key) {
            if (strpos($key, 'Ui') === 0 || strpos($key, 'Cause_') === 0 || strpos($key, 'Feedback') === 0
                || strpos($key, 'Support') === 0 || $key === 'MenuTitle' || $key === 'PromoDismiss'
            ) {
                $keys[] = 'FeinwerkUptimeMonitor_' . $key;
            }
        }
    }

    public function getTablesInstalled(&$allTablesInstalled): void
    {
        foreach (Schema::tables() as $table) {
            $allTablesInstalled[] = Schema::table($table);
        }
    }
}
