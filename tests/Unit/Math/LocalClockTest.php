<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Math;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Math\LocalClock;

/**
 * The cells of the hour strip (L8 review of 5.4.0, BLOCKER 1): a local day starts at the website's local midnight, also
 * after a daylight saving change (23 or 25 hours, 23.5 or 24.5 on Lord Howe Island), never 86400 seconds after the
 * day before; an hour starts on the local whole hour.
 *
 * @group FeinwerkUptimeMonitor
 */
class LocalClockTest extends TestCase
{
    /** the local midnight of a calendar day, as a UTC instant */
    private static function midnight(string $day, string $zone): int
    {
        return (new \DateTimeImmutable($day . ' 00:00:00', new \DateTimeZone($zone)))->getTimestamp();
    }

    /** @return array<string, int> local day => its length in seconds, from the starts and the end */
    private static function lengths(array $starts, int $to, string $zone): array
    {
        $out = [];
        foreach ($starts as $i => $start) {
            $day = (new \DateTimeImmutable('@' . $start))->setTimezone(new \DateTimeZone($zone))->format('Y-m-d');
            $out[$day] = ($starts[$i + 1] ?? $to) - $start;
        }

        return $out;
    }

    /**
     * Periods across a clock change, as Matomo builds them (a month, a 7-day range, a Mon to Sun week), and zones with
     * half and quarter hours.
     *
     * @return array<string, array{string, string, string, array<string, int>}> zone, first day, last day, the days whose
     *         length is not 86400
     */
    public static function periods(): array
    {
        return [
            'New York, November 2026 (the current month)' => ['America/New_York', '2026-11-01', '2026-11-30', ['2026-11-01' => 90000]],
            'Berlin, October 2026' => ['Europe/Berlin', '2026-10-01', '2026-10-31', ['2026-10-25' => 90000]],
            'Berlin, March 2026' => ['Europe/Berlin', '2026-03-01', '2026-03-31', ['2026-03-29' => 82800]],
            'Adelaide, April 2026 (half hours)' => ['Australia/Adelaide', '2026-04-01', '2026-04-30', ['2026-04-05' => 90000]],
            'Berlin, 7 days across 25 October' => ['Europe/Berlin', '2026-10-22', '2026-10-28', ['2026-10-25' => 90000]],
            // the EU and US changes fall on a Sunday, the last day of Matomo's week; Israel's spring change on a Friday
            'Jerusalem, the week Mon 23 to Sun 29 March 2026' => ['Asia/Jerusalem', '2026-03-23', '2026-03-29', ['2026-03-27' => 82800]],
            'Kolkata, March 2026 (half hours, no change)' => ['Asia/Kolkata', '2026-03-01', '2026-03-31', []],
            'Kathmandu, March 2026 (quarter hours, no change)' => ['Asia/Kathmandu', '2026-03-01', '2026-03-31', []],
        ];
    }

    /** @dataProvider periods */
    public function test_dayStarts_areLocalMidnights(string $zone, string $first, string $last, array $notWhole): void
    {
        $from = self::midnight($first, $zone);
        $to = self::midnight(gmdate('Y-m-d', (int) strtotime($last . ' UTC') + 86400), $zone);
        $starts = LocalClock::dayStarts($from, $to, $zone);

        $expected = [];
        for ($day = $first; $day <= $last; $day = gmdate('Y-m-d', (int) strtotime($day . ' UTC') + 86400)) {
            $expected[] = self::midnight($day, $zone);
        }
        $this->assertSame(array_map([self::class, 'iso'], $expected), array_map([self::class, 'iso'], $starts), 'each local midnight');
        $lengths = self::lengths($starts, $to, $zone);
        foreach ($lengths as $day => $length) {
            $this->assertSame($notWhole[$day] ?? 86400, $length, $day);
        }
        $this->assertSame($to - $from, array_sum($lengths));
    }

    /** Matomo's fixed offsets ("UTC+5.5") have no clock change: a day is 86400 seconds; an unknown name counts as UTC. */
    public function test_dayStarts_fixedOffsets_andUnknownNames(): void
    {
        $from = (int) strtotime('2026-03-31 18:30:00 UTC'); // 1 April 00:00 in UTC+5.5
        $this->assertSame([$from, $from + 86400, $from + 2 * 86400], LocalClock::dayStarts($from, $from + 3 * 86400, 'UTC+5.5'));
        $utc = (int) strtotime('2026-10-24 00:00:00 UTC');
        $this->assertSame([$utc, $utc + 86400], LocalClock::dayStarts($utc, $utc + 2 * 86400, 'Mars/Olympus_Mons'));
        $this->assertSame([], LocalClock::dayStarts($utc, $utc, 'UTC'), 'an empty period');
    }

    /** Whole-hour zones: the hours of a clock change day on the UTC hour, 23 or 25 of them. */
    public function test_hourStarts_wholeHourZones(): void
    {
        foreach (['2026-03-29' => 23, '2026-10-25' => 25, '2026-10-24' => 24] as $day => $count) {
            $from = self::midnight($day, 'Europe/Berlin');
            $to = self::midnight(gmdate('Y-m-d', (int) strtotime($day . ' UTC') + 86400), 'Europe/Berlin');
            $starts = LocalClock::hourStarts($from, $to, 'Europe/Berlin');
            $this->assertCount($count, $starts, $day);
            $this->assertSame(range($from, $to - 3600, 3600), $starts, "$day: every UTC hour");
        }
        $from = (int) strtotime('2026-03-13 18:30:00 UTC');
        $this->assertSame(range($from, $from + 23 * 3600, 3600), LocalClock::hourStarts($from, $from + 86400, 'Asia/Kolkata'));
        $this->assertSame(range($from, $from + 23 * 3600, 3600), LocalClock::hourStarts($from, $from + 86400, 'UTC+5.5'));
    }

    /**
     * Lord Howe Island moves its clocks by 30 minutes: after the change the cells start on the local whole hour again,
     * not at half past (the L8 review's optional point).
     */
    public function test_hourStarts_halfHourChange_followsTheLocalClock(): void
    {
        $zone = 'Australia/Lord_Howe';
        // 5 April 2026: 02:00 (+11) becomes 01:30 (+10:30) at 15:00 UTC
        $starts = LocalClock::hourStarts(self::midnight('2026-04-05', $zone), self::midnight('2026-04-06', $zone), $zone);
        $local = array_map(static fn(int $t): string => (new \DateTimeImmutable('@' . $t))->setTimezone(new \DateTimeZone($zone))->format('H:i'), $starts);
        $this->assertSame(['00:00', '01:00', '01:30', '02:00', '03:00'], array_slice($local, 0, 5));
        $this->assertSame('23:00', end($local));
        $this->assertCount(25, $starts);
        $this->assertSame('2026-04-04T15:00:00Z', self::iso($starts[2]), 'the change itself');
        // 4 October 2026: 02:00 (+10:30) becomes 02:30 (+11) at 15:30 UTC
        $starts = LocalClock::hourStarts(self::midnight('2026-10-04', $zone), self::midnight('2026-10-05', $zone), $zone);
        $local = array_map(static fn(int $t): string => (new \DateTimeImmutable('@' . $t))->setTimezone(new \DateTimeZone($zone))->format('H:i'), $starts);
        $this->assertSame(['00:00', '01:00', '02:30', '03:00', '04:00'], array_slice($local, 0, 5));
        $this->assertSame('23:00', end($local));
        $this->assertCount(24, $starts);
    }

    private static function iso(int $t): string
    {
        return gmdate('Y-m-d\TH:i:s\Z', $t);
    }
}
