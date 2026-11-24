<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Sentinel;

use PHPUnit\Framework\TestCase;

/**
 * The Sentinel checks work with Sentinel 5.0.0: they call only the CheckContext methods it has, and only the
 * CheckResult factories it has. Reads the sources as text.
 *
 * @group FeinwerkUptimeMonitor
 */
class UsesOnlySentinel500ApiTest extends TestCase
{
    public function test_onlyMethodsOfSentinel500(): void
    {
        $allowedContext = ['idSite', 'isInstance', 'now', 'param'];
        $allowedResult = ['firing', 'normal', 'unknown'];
        foreach (glob(dirname(__DIR__, 3) . '/Sentinel/*.php') as $file) {
            $code = (string) file_get_contents($file);
            preg_match_all('/\$context->(\w+)\(/', $code, $calls);
            foreach (array_unique($calls[1]) as $method) {
                $this->assertContains($method, $allowedContext, basename($file) . ": CheckContext::$method is newer than Sentinel 5.0.0");
            }
            preg_match_all('/CheckResult::(\w+)\(/', $code, $factories);
            foreach (array_unique($factories[1]) as $method) {
                $this->assertContains($method, $allowedResult, basename($file) . ": CheckResult::$method");
            }
        }
    }
}
