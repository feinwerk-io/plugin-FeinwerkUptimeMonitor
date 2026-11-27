<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Runner;

use Piwik\Config;
use Piwik\SettingsPiwik;

/**
 * Whether the checks may send requests (Peter, 2026-11-26, "2a"): Matomo's [General] enable_internet_features is
 * honoured. While it is 0, no check goes out (no DNS lookup, no HTTP request, no TLS handshake), each result is not
 * checkable with the note internet_off, and the screens name the setting. A server administrator who wants the checks
 * anyway sets [FeinwerkUptimeMonitor] checkWithInternetFeaturesOff = 1 in config/config.ini.php (config file only).
 *
 * Read from Matomo's config at use time: web requests, the hourly task and the console command read the same file.
 */
final class InternetAccess
{
    /** the opt-in in [FeinwerkUptimeMonitor], camelCase like allowPrivate and allowLoopbackForWebsites */
    public const OPT_IN = 'checkWithInternetFeaturesOff';

    /** Whether the checks may send requests now: internet features on, or the opt-in set. */
    public static function checksAllowed(): bool
    {
        try {
            $internet = SettingsPiwik::isInternetEnabled();
        } catch (\Throwable $e) {
            $internet = true; // Matomo's own default
        }

        return self::decide($internet, Config::getInstance()->FeinwerkUptimeMonitor);
    }

    /**
     * @param bool $internetEnabled Matomo's [General] enable_internet_features
     * @param mixed $section the [FeinwerkUptimeMonitor] config section (array, or null when there is none)
     */
    public static function decide(bool $internetEnabled, $section): bool
    {
        return $internetEnabled || (is_array($section) && !empty($section[self::OPT_IN]));
    }
}
