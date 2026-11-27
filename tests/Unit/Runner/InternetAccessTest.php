<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Runner;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\InternetAccess;

/**
 * Peter's 2a: Matomo's [General] enable_internet_features is honoured; [FeinwerkUptimeMonitor]
 * checkWithInternetFeaturesOff = 1 lets the checks run anyway.
 *
 * @group FeinwerkUptimeMonitor
 */
class InternetAccessTest extends TestCase
{
    public function test_internetFeaturesOn_checksRun(): void
    {
        $this->assertTrue(InternetAccess::decide(true, null));
        $this->assertTrue(InternetAccess::decide(true, ['checkWithInternetFeaturesOff' => 0]));
    }

    public function test_internetFeaturesOff_noChecks_unlessTheOptIn(): void
    {
        $this->assertFalse(InternetAccess::decide(false, null), 'no section');
        $this->assertFalse(InternetAccess::decide(false, []));
        $this->assertFalse(InternetAccess::decide(false, ['checkWithInternetFeaturesOff' => '0']));
        $this->assertFalse(InternetAccess::decide(false, ['allowPrivate' => 1]), 'another key is no opt-in');
        $this->assertTrue(InternetAccess::decide(false, ['checkWithInternetFeaturesOff' => 1]));
        $this->assertTrue(InternetAccess::decide(false, ['checkWithInternetFeaturesOff' => '1']), 'as config.ini.php gives it');
    }

    public function test_theOptInKey_isCamelCaseLikeTheOtherSwitches(): void
    {
        $this->assertSame('checkWithInternetFeaturesOff', InternetAccess::OPT_IN);
    }
}
