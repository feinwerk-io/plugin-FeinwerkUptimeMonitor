<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration;

use Piwik\Db;
use Piwik\Option;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\FeinwerkUptimeMonitor;
use Piwik\Plugins\FeinwerkUptimeMonitor\Report\UptimeReport;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\RollupStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Schema;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Tests\Framework\Fixture;
use Piwik\Tests\Framework\Mock\FakeAccess;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;

/**
 * L8 review of 5.4.0, BLOCKER 1: the strip of a week, a month or a range up to 31 days has one cell per local day from
 * local midnight to the next local midnight, also after a daylight saving change, so each day counts all its hours.
 * Every hour of the period is seeded up, one hour at local noon on a day after the change down; the clock is fixed after
 * the period, so no cell is "future" whatever the date of the run.
 *
 * @group FeinwerkUptimeMonitor
 */
class TimelineDstTest extends IntegrationTestCase
{
    /** after every period below: nothing is "future" */
    private const NOW = '2027-01-15 00:00:00';

    public function provideContainerConfig()
    {
        return ['Piwik\\Access' => new FakeAccess()];
    }

    public function setUp(): void
    {
        parent::setUp();
        FakeAccess::clearAccess(true);
        (new FeinwerkUptimeMonitor())->install();
        foreach (Schema::tables() as $table) {
            Db::query('TRUNCATE TABLE ' . Schema::table($table));
        }
        Option::deleteLike('fw_uptimemonitor_%');
    }

    /**
     * @return array<string, array{string, string, string, string, array<string, int>}> zone, period, date, the day with
     *         the hour down at local noon, the days whose length is not 86400
     */
    public static function periods(): array
    {
        return [
            'New York, November 2026' => ['America/New_York', 'month', '2026-11-15', '2026-11-12', ['2026-11-01' => 90000]],
            'Berlin, October 2026' => ['Europe/Berlin', 'month', '2026-10-15', '2026-10-28', ['2026-10-25' => 90000]],
            'Berlin, March 2026' => ['Europe/Berlin', 'month', '2026-03-15', '2026-03-31', ['2026-03-29' => 82800]],
            'Adelaide, April 2026' => ['Australia/Adelaide', 'month', '2026-04-15', '2026-04-20', ['2026-04-05' => 90000]],
            'Berlin, 7 days across 25 October' => ['Europe/Berlin', 'range', '2026-10-22,2026-10-28', '2026-10-27', ['2026-10-25' => 90000]],
            'Jerusalem, Mon to Sun week across Friday 27 March' => ['Asia/Jerusalem', 'week', '2026-03-25', '2026-03-28', ['2026-03-27' => 82800]],
            // review of the 5.4.0 fixes, SHOULD 1: in Europe, the US and Australia the change falls on a Sunday, the last
            // cell of Matomo's week, whose end only the answer's end gives
            'Berlin, week ending Sunday 29 March' => ['Europe/Berlin', 'week', '2026-03-25', '2026-03-24', ['2026-03-29' => 82800]],
            'Berlin, week ending Sunday 25 October' => ['Europe/Berlin', 'week', '2026-10-21', '2026-10-22', ['2026-10-25' => 90000]],
            'Kolkata, March 2026' => ['Asia/Kolkata', 'month', '2026-03-15', '2026-03-20', []],
            'Kathmandu, March 2026' => ['Asia/Kathmandu', 'month', '2026-03-15', '2026-03-20', []],
        ];
    }

    /** @dataProvider periods */
    public function test_localDays_countEveryHour_afterAClockChange(string $zone, string $period, string $date, string $downDay, array $notWhole): void
    {
        $idSite = Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Zone ' . $zone, 'https://zone.example/', 1, null, null, $zone);
        (new TargetStore())->setUrl($idSite, 'web:zone', Kind::WEB, 'https://zone.example/', TargetStore::SOURCE_MANUAL);
        $id = (new TargetStore())->get($idSite, 'web:zone')->id;
        $now = (int) strtotime(self::NOW . ' UTC');
        $report = new UptimeReport(static fn(): int => $now);
        $range = $report->range($idSite, $period, $date, 0, false);

        $local = new \DateTimeZone($zone);
        $first = (new \DateTimeImmutable('@' . $range['from']))->setTimezone($local);
        $this->assertSame('00:00', $first->format('H:i'), 'the period starts at local midnight');
        // every UTC hour that overlaps the period up, the one at local noon of $downDay down
        $down = (new \DateTimeImmutable($downDay . ' 12:00:00', $local))->getTimestamp();
        $down -= $down % 3600;
        $rows = [];
        for ($hour = intdiv($range['from'], 3600) * 3600; $hour < $range['to']; $hour += 3600) {
            $isDown = $hour === $down;
            $rows[] = ['idtarget' => $id, 'hour' => gmdate('Y-m-d H:i:s', $hour), 'source' => StateStore::LOCAL, 'samples' => 60,
                'up_samples' => $isDown ? 0 : 60, 'measured_seconds' => 3600, 'up_seconds' => $isDown ? 0 : 3600, 'ms_p50' => 80,
                'ms_p95' => 90, 'ms_max' => 100, 'cert_not_after' => null];
        }
        (new RollupStore())->upsertHours($rows);

        $timeline = $report->timeline($idSite, $range, 'all', $zone, $period);
        $this->assertSame(['day', 'local'], [$timeline['grain'], $timeline['days']]);
        $this->assertSame(gmdate('Y-m-d\TH:i:s\Z', $range['to']), $timeline['end'], 'the end of the last cell: the period\'s end');
        $span = $range['to'] - $range['from'];
        $days = [];
        foreach ($timeline['cells'] as $i => $cell) {
            $start = (new \DateTimeImmutable($cell['time']))->setTimezone($local);
            $this->assertSame('00:00', $start->format('H:i'), "cell $i starts at local midnight: " . $cell['time']);
            $day = $start->format('Y-m-d');
            // as the uptime page reads a cell's length (timeline.ts elapsedSeconds): up to the next cell, the last one up
            // to the answer's end
            $length = (int) strtotime($timeline['cells'][$i + 1]['time'] ?? $timeline['end']) - $start->getTimestamp();
            $this->assertSame($notWhole[$day] ?? 86400, $length, "$day: the cell's window");
            $this->assertSame($length, $cell['measuredSeconds'], "$day: every hour of the local day is measured");
            $this->assertSame($day === $downDay ? $length - 3600 : $length, $cell['upSeconds'], $day);
            $this->assertSame($day === $downDay ? 'partial' : 'up', $cell['state'], $day);
            $days[] = $day;
        }
        $this->assertSame((int) round($span / 86400), count($days), 'one cell per local day');
        $this->assertSame($span, array_sum(array_column($timeline['cells'], 'measuredSeconds')), 'the cells hold the whole period');

        // the figures: uptime over the measured time, coverage over the period (the uptime page computes the same from
        // the cells, timeline.ts stripTotals)
        $uptime = array_column($report->uptime($idSite, $report->range($idSite, $period, $date), 'all'), null, 'targetKey')['web:zone'];
        $this->assertSame([round(100 * ($span - 3600) / $span, 3), 100.0], [$uptime['uptimePercent'], $uptime['coveragePercent']]);
        $this->assertSame($span - 3600, array_sum(array_column($timeline['cells'], 'upSeconds')));
    }
}
