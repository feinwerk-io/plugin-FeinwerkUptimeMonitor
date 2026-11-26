<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Math;

/**
 * Coverage, uptime and percentiles (spec 6.4). Time that no check covers is "not measured", never "up": a Matomo
 * that is completely down runs no checks.
 */
final class UptimeMath
{
    /**
     * Each check covers the time until the next check, at most two check intervals; the last one covers one interval.
     * Pass the last check before $from too, so that its coverage reaches into the window.
     *
     * @param array<int, array{0: int, 1: bool}> $samples [unix time, up] sorted by time
     * @param int $interval seconds between expected checks (3600 for the hourly task, the cron spacing for the command)
     * @return array{measured: int, up: int, gaps: list<array{from: int, to: int}>} seconds inside [$from, $to)
     */
    public static function coverage(array $samples, int $interval, int $from, int $to): array
    {
        $measured = 0;
        $up = 0;
        $gaps = [];
        $cursor = $from;
        $count = count($samples);

        for ($i = 0; $i < $count; $i++) {
            [$time, $isUp] = $samples[$i];
            $end = $i + 1 < $count ? min($samples[$i + 1][0], $time + 2 * $interval) : $time + $interval;
            $start = max($time, $from);
            $end = min($end, $to);
            if ($end <= $start) {
                continue;
            }
            if ($start > $cursor) {
                $gaps[] = ['from' => $cursor, 'to' => $start];
            }
            $measured += $end - $start;
            if ($isUp) {
                $up += $end - $start;
            }
            $cursor = max($cursor, $end);
        }
        if ($cursor < $to) {
            $gaps[] = ['from' => $cursor, 'to' => $to];
        }

        return ['measured' => $measured, 'up' => $up, 'gaps' => $gaps];
    }

    /**
     * @return float|null percent of the measured time that was up; null when nothing was measured
     */
    public static function uptimePercent(int $up, int $measured): ?float
    {
        return $measured > 0 ? 100.0 * $up / $measured : null;
    }

    /**
     * Nearest-rank percentile.
     *
     * @param array<int|float> $values
     * @param float $p 0 to 100
     */
    public static function percentile(array $values, float $p): ?int
    {
        if ($values === []) {
            return null;
        }
        sort($values);
        $rank = (int) ceil($p / 100 * count($values));

        return (int) round($values[max(1, $rank) - 1]);
    }

    /**
     * The part of an outage inside a period: it starts at the later of the outage's start and $from and ends at the
     * earliest of its end, $to and $now (an open outage runs until $now). An outage that only touches the period has
     * 0 seconds in it.
     *
     * @param int $start the outage's start (unix time)
     * @param int|null $end its end, null while it is open
     * @param int $from the period's start
     * @param int $to the period's end (exclusive)
     * @param int $now the current time
     * @return array{start: int, seconds: int} the start of the part inside the period and its length in seconds
     */
    public static function partIn(int $start, ?int $end, int $from, int $to, int $now): array
    {
        $begin = max($start, $from);

        return ['start' => $begin, 'seconds' => max(0, min($end ?? $now, $to, $now) - $begin)];
    }
}
