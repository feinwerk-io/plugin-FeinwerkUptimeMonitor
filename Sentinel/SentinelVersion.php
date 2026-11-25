<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel;

use Piwik\Plugin\Manager;

/**
 * Which Feinwerk Sentinel runs this plugin's checks U01 to U04: they are built against Sentinel 5.0.0's check interface
 * (tests/Unit/Sentinel/UsesOnlySentinel500ApiTest.php); an older Sentinel (0.x) gets no checks, and the admin page
 * asks for its update.
 */
final class SentinelVersion
{
    public const MIN = '5.0.0';

    /** the loaded Feinwerk Sentinel's version, or null when it is not loaded or has none */
    public static function loaded(): ?string
    {
        try {
            $manager = Manager::getInstance();
            if (!$manager->isPluginLoaded('FeinwerkSentinel')) {
                return null;
            }
            $version = (string) $manager->getLoadedPlugin('FeinwerkSentinel')->getVersion();

            return $version === '' ? null : $version;
        } catch (\Throwable $e) {
            return null;
        }
    }

    /** whether a Sentinel of this version runs the checks; an unknown version (null) counts as able */
    public static function supports(?string $version): bool
    {
        return $version === null || version_compare($version, self::MIN, '>=');
    }
}
