<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Sentinel;

/**
 * Loads the stand-ins of Sentinel's check interface (v5.0.0) when the real plugin is not loaded: in this plugin's own
 * unit run and in Matomo's test run in CI, where Sentinel is not installed.
 */
final class SentinelStubs
{
    public static function load(): void
    {
        if (interface_exists('Piwik\Plugins\FeinwerkSentinel\Check\Check')) {
            return;
        }
        foreach (['Severity', 'Check', 'CheckResult', 'CheckContext'] as $file) {
            require_once dirname(__DIR__, 2) . '/Stubs/FeinwerkSentinel/Check/' . $file . '.php';
        }
    }
}
