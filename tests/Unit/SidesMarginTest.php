<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\CheckRunner;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\Freshness;

/**
 * Review of the 5.3.0 fixes, SHOULD 2: one margin for both sides' times on the server (Freshness::sidesMargin()) and on
 * the screens (vue/src/sides.ts). The screens get the server's value (ScreenProps external.sidesMargin); their named
 * default for a page without it is the server's default, the default run budget plus one probe minute.
 *
 * @group FeinwerkUptimeMonitor
 */
class SidesMarginTest extends TestCase
{
    public function test_theScreensDefaultIsTheServersDefault(): void
    {
        $sides = (string) file_get_contents(dirname(__DIR__, 2) . '/vue/src/sides.ts');

        $this->assertSame(1, preg_match('/export const SIDES_MARGIN_SECONDS = (\d+);/', $sides, $m), 'sides.ts names its default');
        $this->assertSame(CheckRunner::DEFAULT_BUDGET + Freshness::PROBE_SECONDS, (int) $m[1]);
        $this->assertSame(120, (int) $m[1]);
    }
}
