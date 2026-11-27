<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Math;

/**
 * The local days and hours of a website's timezone as UTC instants, for the cells of the hour strip (L8 review of 5.4.0,
 * BLOCKER 1). A local day runs from local midnight to the next local midnight: 23 or 25 hours on a daylight saving
 * change (23.5 or 24.5 on Lord Howe Island), never simply 86400 seconds after the day before. A local hour starts on the
 * local whole hour, and where the clock jumps by half an hour the jump starts a new cell.
 *
 * Timezones are Matomo's names: IANA names, and Matomo's fixed offsets ("UTC+2", "UTC-5.5"), which PHP's DateTimeZone
 * cannot read and which have no clock change. A name PHP does not know counts as UTC.
 */
final class LocalClock
{
    /** at most this many cells (a strip has at most 367; a safety net against a timezone database that loops) */
    private const MAX_CELLS = 1000;

    /**
     * The local midnights in [$from, $to): $from first (the period's own start), then each next local midnight.
     *
     * @return int[] ascending
     */
    public static function dayStarts(int $from, int $to, string $timezone): array
    {
        $zone = self::zone($timezone);
        if ($zone === null) {
            return self::steps($from, $to, 86400);
        }
        $starts = [];
        $day = (new \DateTimeImmutable('@' . $from))->setTimezone($zone);
        $t = $from;
        while ($t < $to && count($starts) < self::MAX_CELLS) {
            $starts[] = $t;
            // the next calendar day at 00:00 local; where midnight does not exist (the clock jumps over it), PHP takes
            // the first time after the gap, which is that day's start
            $day = $day->modify('+1 day')->setTime(0, 0);
            $next = $day->getTimestamp();
            $t = $next > $t ? $next : $t + 86400;
        }

        return $starts;
    }

    /**
     * The starts of the local hours in [$from, $to): $from first, then each local whole hour, and each clock change
     * (a new local hour starts there, e.g. 01:30 on Lord Howe Island). On the UTC hour in whole-hour zones, at :30 or
     * :15 UTC in zones such as Asia/Kolkata or Asia/Kathmandu; 23 or 25 hours on a daylight saving day.
     *
     * @return int[] ascending
     */
    public static function hourStarts(int $from, int $to, string $timezone): array
    {
        $zone = self::zone($timezone);
        $transitions = $zone !== null ? $zone->getTransitions($from, max($from, $to - 1)) : false;
        if (!is_array($transitions) || $transitions === []) {
            return self::steps($from, $to, 3600);
        }
        $starts = [$from => true];
        $count = count($transitions);
        for ($i = 0; $i < $count; $i++) {
            // the first entry is the state at $from, the others are the clock changes inside the period
            $segmentStart = $i === 0 ? $from : (int) $transitions[$i]['ts'];
            $segmentEnd = $i + 1 < $count ? min($to, (int) $transitions[$i + 1]['ts']) : $to;
            if ($segmentStart >= $to) {
                break;
            }
            if ($i > 0) {
                $starts[$segmentStart] = true;
            }
            $offset = (int) $transitions[$i]['offset'];
            // the first local whole hour at or after the segment's start
            $t = $segmentStart + ((-($segmentStart + $offset)) % 3600 + 3600) % 3600;
            for (; $t < $segmentEnd && count($starts) < self::MAX_CELLS; $t += 3600) {
                $starts[$t] = true;
            }
        }
        $out = array_keys($starts);
        sort($out);

        return array_values(array_filter($out, static fn(int $t): bool => $t >= $from && $t < $to));
    }

    /** Matomo's fixed offsets ("UTC+2", "UTC-5.5") in seconds, null for any other name */
    private static function fixedOffset(string $timezone): ?int
    {
        if (!preg_match('/^UTC([+-])(\d+(?:\.\d+)?)$/', $timezone, $m)) {
            return null;
        }

        return (int) round((float) $m[2] * 3600) * ($m[1] === '-' ? -1 : 1);
    }

    /** an IANA zone, null for Matomo's fixed offsets (no clock change: whole days and hours apart) and unknown names */
    private static function zone(string $timezone): ?\DateTimeZone
    {
        if ($timezone === '' || self::fixedOffset($timezone) !== null) {
            return null;
        }
        try {
            return new \DateTimeZone($timezone);
        } catch (\Throwable $e) {
            return null;
        }
    }

    /** @return int[] $from, $from + $step, ... before $to */
    private static function steps(int $from, int $to, int $step): array
    {
        $out = [];
        for ($t = $from; $t < $to && count($out) < self::MAX_CELLS; $t += $step) {
            $out[] = $t;
        }

        return $out;
    }
}
