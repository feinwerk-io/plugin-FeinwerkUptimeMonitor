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

    /** Sentinel 5.4.0 moved its instance settings to its own page, tab "Whole instance" (Sentinel session, 2026-11-25). */
    public function test_instanceSettings_onSentinelsTabFrom540_elseGeneralSettings(): void
    {
        $this->assertSame('module=FeinwerkSentinel&action=index&tab=instance', SentinelVersion::instanceSettingsQuery('5.4.0'));
        // L8: without a website Sentinel redirects to its first one and drops the tab
        $this->assertSame('module=FeinwerkSentinel&action=index&idSite=3&period=day&date=yesterday&tab=instance',
            SentinelVersion::instanceSettingsQuery('6.0.1', 3));
        $this->assertSame('module=CoreAdminHome&action=generalSettings#/FeinwerkSentinel', SentinelVersion::instanceSettingsQuery('5.3.1'));
        $this->assertSame('module=CoreAdminHome&action=generalSettings#/FeinwerkSentinel', SentinelVersion::instanceSettingsQuery(null));
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
