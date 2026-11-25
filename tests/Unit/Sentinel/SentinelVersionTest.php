<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Sentinel;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel\SentinelVersion;
use Piwik\Plugins\FeinwerkUptimeMonitor\Widgets\ScreenProps;

/**
 * The checks U01 to U04 implement Sentinel 5.0.0's interface: an older Sentinel gets none of them, and the admin page
 * names it as too old instead of promising alerts (review item L4).
 */
class SentinelVersionTest extends TestCase
{
    public function test_supports_fromTheFirstVersionWithThisInterface(): void
    {
        $this->assertTrue(SentinelVersion::supports('5.0.0'));
        $this->assertTrue(SentinelVersion::supports('5.3.1'));
        $this->assertTrue(SentinelVersion::supports('6.0.0'));
    }

    public function test_supports_notTheOldSentinel(): void
    {
        $this->assertFalse(SentinelVersion::supports('0.3.0'));
        $this->assertFalse(SentinelVersion::supports('4.9.9'));
        $this->assertFalse(SentinelVersion::supports('5.0.0-b1'), 'a pre-release before 5.0.0');
    }

    public function test_supports_anUnknownVersion(): void
    {
        $this->assertTrue(SentinelVersion::supports(null), 'no version known: as before, the interface check decides');
    }

    public function test_sentinelState_namesAnOldSentinel(): void
    {
        $this->assertSame('active', ScreenProps::sentinelState(true, true, '5.3.1'));
        $this->assertSame('active', ScreenProps::sentinelState(true, true, null));
        $this->assertSame('old', ScreenProps::sentinelState(true, true, '0.3.0'));
    }

    public function test_sentinelState_deactivatedOrMissing(): void
    {
        $this->assertSame('inactive', ScreenProps::sentinelState(false, true, '5.3.1'));
        $this->assertSame('inactive', ScreenProps::sentinelState(false, true, '0.3.0'), 'deactivated comes first');
        $this->assertSame('absent', ScreenProps::sentinelState(false, false, null));
    }
}
