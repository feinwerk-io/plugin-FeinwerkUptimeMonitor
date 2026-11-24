<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Math;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Math\UptimeMath;

/**
 * @group FeinwerkUptimeMonitor
 */
class UptimeMathTest extends TestCase
{
    private const H = 3600;
    private const DAY0 = 1773446400; // 2026-03-14 00:00:00 UTC

    private static function hourly(array $ups): array
    {
        $samples = [];
        foreach ($ups as $i => $up) {
            $samples[] = [self::DAY0 + $i * self::H, $up];
        }
        return $samples;
    }

    public function test_hourlySamplesAllUp_full(): void
    {
        $c = UptimeMath::coverage(self::hourly(array_fill(0, 24, true)), self::H, self::DAY0, self::DAY0 + 24 * self::H);
        $this->assertSame(24 * self::H, $c['measured']);
        $this->assertSame(24 * self::H, $c['up']);
        $this->assertSame([], $c['gaps']);
        $this->assertSame(100.0, UptimeMath::uptimePercent($c['up'], $c['measured']));
    }

    public function test_oneDownSample_coversItsHour(): void
    {
        $ups = array_fill(0, 24, true);
        $ups[5] = false;
        $c = UptimeMath::coverage(self::hourly($ups), self::H, self::DAY0, self::DAY0 + 24 * self::H);
        $this->assertSame(24 * self::H, $c['measured']);
        $this->assertSame(23 * self::H, $c['up']);
    }

    public function test_lateNextCheck_stillCoveredUpToTwoIntervals(): void
    {
        // the next check comes 90 minutes later: no gap
        $samples = [[self::DAY0, true], [self::DAY0 + 5400, true]];
        $c = UptimeMath::coverage($samples, self::H, self::DAY0, self::DAY0 + 5400 + self::H);
        $this->assertSame(5400 + self::H, $c['measured']);
        $this->assertSame([], $c['gaps']);
    }

    public function test_gapLongerThanTwoIntervals_isNotMeasured(): void
    {
        // checks at 00:00, then nothing until 05:00 (Matomo or its cron was down)
        $samples = [[self::DAY0, true], [self::DAY0 + 5 * self::H, true]];
        $c = UptimeMath::coverage($samples, self::H, self::DAY0, self::DAY0 + 6 * self::H);
        $this->assertSame(2 * self::H + self::H, $c['measured'], '00:00 to 02:00 and 05:00 to 06:00');
        $this->assertSame($c['measured'], $c['up'], 'the gap never counts as up');
    }

    public function test_gapLongerThanTwoIntervals_isListedAsGap(): void
    {
        $samples = [[self::DAY0, true], [self::DAY0 + 5 * self::H, true]];
        $c = UptimeMath::coverage($samples, self::H, self::DAY0, self::DAY0 + 6 * self::H);
        $this->assertSame([['from' => self::DAY0 + 2 * self::H, 'to' => self::DAY0 + 5 * self::H]], $c['gaps']);
    }

    public function test_sampleBeforeTheWindow_reachesIntoIt(): void
    {
        $samples = [[self::DAY0 - 1800, false], [self::DAY0 + 1800, true]];
        $c = UptimeMath::coverage($samples, self::H, self::DAY0, self::DAY0 + self::H);
        $this->assertSame(self::H, $c['measured']);
        $this->assertSame(1800, $c['up']);
    }

    public function test_noSamples_measuredZero_uptimeNull(): void
    {
        $c = UptimeMath::coverage([], self::H, self::DAY0, self::DAY0 + self::H);
        $this->assertSame(0, $c['measured']);
        $this->assertSame([['from' => self::DAY0, 'to' => self::DAY0 + self::H]], $c['gaps']);
        $this->assertNull(UptimeMath::uptimePercent(0, 0));
    }

    public function test_minuteInterval_fromTheCommand(): void
    {
        $samples = [];
        for ($i = 0; $i < 60; $i++) {
            $samples[] = [self::DAY0 + $i * 60, $i !== 10];
        }
        $c = UptimeMath::coverage($samples, 60, self::DAY0, self::DAY0 + self::H);
        $this->assertSame(self::H, $c['measured']);
        $this->assertSame(self::H - 60, $c['up']);
    }

    public function test_percentile_nearestRank(): void
    {
        $values = range(1, 100);
        shuffle($values);
        $this->assertSame(50, UptimeMath::percentile($values, 50));
        $this->assertSame(95, UptimeMath::percentile($values, 95));
        $this->assertSame(100, UptimeMath::percentile($values, 100));
        $this->assertSame(7, UptimeMath::percentile([7], 50));
        $this->assertNull(UptimeMath::percentile([], 50));
    }

    public function test_uptimePercent_keepsPrecision(): void
    {
        $this->assertEqualsWithDelta(99.8611, UptimeMath::uptimePercent(86280, 86400), 0.0001);
    }
}
