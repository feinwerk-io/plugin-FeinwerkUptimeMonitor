<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Store;

use Piwik\Db;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Math\UptimeMath;

/**
 * Hour and day rows, the display grain for both sources (spec 9): samples, coverage, response time percentiles and
 * the certificate date. Local rows come from the raw checks and the tracker samples; external rows are written by Pro
 * (hours) and summed into days here.
 */
final class RollupStore
{
    /** the newest samples the percentiles of the last hour are taken from (memory on busy trackers) */
    public const PERCENTILE_SAMPLES = 5000;

    public const HOUR = 3600;
    public const DAY = 86400;
    private const TARGET_CHUNK = 50;

    /**
     * Recomputes the local hour rows of [$fromHour, $toHour) (UTC, whole hours).
     *
     * @param int $interval seconds between expected checks, for the coverage
     */
    public function rollHours(string $fromHour, string $toHour, int $interval, int $processingTargetId): void
    {
        $this->rollLocal(Schema::HOUR, 'hour', self::HOUR, $fromHour, $toHour, $interval, $processingTargetId);
    }

    /**
     * Recomputes the day rows of [$fromDay, $toDay) (UTC dates): local ones from the raw data (kept 14 and 2 days),
     * external ones from Pro's hour rows.
     */
    public function rollDays(string $fromDay, string $toDay, int $interval, int $processingTargetId): void
    {
        $from = $fromDay . ' 00:00:00';
        $to = $toDay . ' 00:00:00';
        $this->rollLocal(Schema::DAY, 'day', self::DAY, $from, $to, $interval, $processingTargetId);
        $this->rollExternalDays($from, $to);
        $this->rollProcessingDays($from, $to, $processingTargetId);
    }

    /**
     * Median and count of the processing time samples (not bulk) of the last hour, from the raw samples: the newest
     * hour row holds only the minutes since the full hour.
     *
     * @return array{samples: int, p50: ?int, p95: ?int, max: ?int}
     */
    public function processingSince(string $from): array
    {
        $table = Schema::table(Schema::SAMPLE);
        $totals = Db::fetchRow('SELECT COUNT(*) AS samples, MAX(ms) AS max_ms FROM ' . $table . ' WHERE sampled_at >= ? AND is_bulk = 0', [$from]);
        // a busy tracker samples many thousand requests an hour: the percentiles come from the newest ones
        $rows = Db::fetchAll(
            'SELECT ms FROM ' . $table . ' WHERE sampled_at >= ? AND is_bulk = 0 ORDER BY sampled_at DESC LIMIT ' . self::PERCENTILE_SAMPLES,
            [$from]
        );
        $ms = array_map('intval', array_column($rows, 'ms'));
        $count = (int) ($totals['samples'] ?? 0);

        return ['samples' => $count, 'p50' => UptimeMath::percentile($ms, 50), 'p95' => UptimeMath::percentile($ms, 95),
            'max' => $count > 0 && isset($totals['max_ms']) ? (int) $totals['max_ms'] : null];
    }

    /**
     * Median response time of one target's successful checks since $from, from the raw checks.
     */
    public function medianSince(int $idTarget, string $from): ?int
    {
        $rows = Db::fetchAll(
            'SELECT ms_total FROM ' . Schema::table(Schema::CHECK) . " WHERE idtarget = ? AND checked_at >= ? AND outcome = 'up'",
            [$idTarget, $from]
        );

        return UptimeMath::percentile(array_map('intval', array_column($rows, 'ms_total')), 50);
    }

    /**
     * @param int[] $idTargets
     * @param string $source all|local|external
     * @return array<int, array> rows ordered by target and time
     */
    public function hours(array $idTargets, string $from, string $to, string $source = 'all'): array
    {
        return $this->read(Schema::HOUR, 'hour', $idTargets, $from, $to, $source);
    }

    /**
     * @param int[] $idTargets
     * @param string $source all|local|external
     */
    public function days(array $idTargets, string $from, string $to, string $source = 'all'): array
    {
        return $this->read(Schema::DAY, 'day', $idTargets, $from, $to, $source);
    }

    /**
     * The start of the first hour in which any of the targets was measured, at any time (UTC, "Y-m-d H:i:s"): from the
     * hour rows (kept 90 days), else the first UTC day of the day rows (kept 400 days) at 00:00; null when never. One
     * MIN per table over the primary key's leading columns (idtarget, then the hour or day).
     *
     * @param int[] $idTargets
     * @param string $source all|local|external
     */
    public function firstMeasured(array $idTargets, string $source = 'all'): ?string
    {
        if ($idTargets === []) {
            return null;
        }
        $first = [];
        foreach ([Schema::HOUR => 'hour', Schema::DAY => 'day'] as $table => $column) {
            $sql = "SELECT MIN(`$column`) FROM " . Schema::table($table) . ' WHERE idtarget IN (' . Sql::placeholders($idTargets) . ')'
                . ' AND measured_seconds > 0';
            $bind = $idTargets;
            if ($source !== 'all') {
                $sql .= ' AND source = ?';
                $bind[] = $source;
            }
            $value = Db::fetchOne($sql, $bind);
            $first[$column] = $value === null || $value === false ? null : (string) $value;
        }
        $hour = $first['hour'];
        $day = $first['day'] !== null ? substr($first['day'], 0, 10) : null;
        // the hour is exact; when the hours of the first day are gone (older than 90 days), the UTC day
        if ($hour !== null && ($day === null || substr($hour, 0, 10) <= $day)) {
            return $hour;
        }

        return $day !== null ? $day . ' 00:00:00' : null;
    }

    /**
     * Writes external rows (Pro); local rows are refused by the caller.
     */
    public function upsertHours(array $rows): void
    {
        $values = [];
        foreach ($rows as $row) {
            $values[] = [$row['idtarget'], $row['hour'], $row['source'], $row['samples'], $row['up_samples'], 0,
                $row['measured_seconds'], $row['up_seconds'], $row['ms_p50'], $row['ms_p95'], $row['ms_max'], $row['cert_not_after']];
        }
        $this->write(Schema::HOUR, 'hour', $values);
    }

    private function rollLocal(string $table, string $column, int $size, string $from, string $to, int $interval, int $processingTargetId): void
    {
        $fromTs = (int) strtotime($from . ' UTC');
        $toTs = (int) strtotime($to . ' UTC');
        $rows = [];

        // in chunks of targets, each written at once: a day of per-minute checks of many targets would not fit into
        // memory together
        $checkStore = new CheckStore();
        $lookback = 2 * $interval;
        $ids = $checkStore->targetsBetween(gmdate('Y-m-d H:i:s', $fromTs - $lookback), $to);
        foreach (array_chunk($ids, self::TARGET_CHUNK) as $chunk) {
            $byTarget = $checkStore->between($from, $to, $lookback, $chunk);
            $this->write($table, $column, $this->localRows($byTarget, $column, $size, $fromTs, $toTs, $interval));
        }

        // the day rows of the processing time come from its hour rows (rollProcessingDays): a day of samples of a busy
        // tracker is too large to read at once
        $samples = $column === 'day' ? [] : Db::fetchAll(
            'SELECT sampled_at, ms, is_bulk FROM ' . Schema::table(Schema::SAMPLE) . ' WHERE sampled_at >= ? AND sampled_at < ?',
            [$from, $to]
        );
        $buckets = [];
        foreach ($samples as $sample) {
            $ts = (int) strtotime($sample['sampled_at'] . ' UTC');
            $key = $fromTs + intdiv($ts - $fromTs, $size) * $size;
            $buckets[$key]['ms'] = $buckets[$key]['ms'] ?? [];
            $buckets[$key]['bulk'] = ($buckets[$key]['bulk'] ?? 0) + ((int) $sample['is_bulk'] ? 1 : 0);
            if (!(int) $sample['is_bulk']) {
                $buckets[$key]['ms'][] = (int) $sample['ms'];
            }
        }
        foreach ($buckets as $start => $bucket) {
            $ms = $bucket['ms'];
            $rows[] = [$processingTargetId, self::grain($column, $start), StateStore::LOCAL, count($ms), 0, $bucket['bulk'],
                0, 0, UptimeMath::percentile($ms, 50), UptimeMath::percentile($ms, 95), $ms ? max($ms) : null, null];
        }

        $this->write($table, $column, $rows);
    }

    /**
     * @param array<int, list<array>> $byTarget raw checks by target
     */
    private function localRows(array $byTarget, string $column, int $size, int $fromTs, int $toTs, int $interval): array
    {
        $rows = [];
        foreach ($byTarget as $idTarget => $checks) {
            $samples = [];
            $times = [];
            foreach ($checks as $k => $check) {
                $times[$k] = (int) strtotime($check['checked_at'] . ' UTC');
                if ($check['outcome'] !== Outcome::NOT_CHECKABLE) {
                    $samples[] = [$times[$k], $check['outcome'] === Outcome::UP];
                }
            }
            for ($start = $fromTs; $start < $toTs; $start += $size) {
                $end = $start + $size;
                $count = 0;
                $ups = 0;
                $ms = [];
                $cert = null;
                foreach ($checks as $k => $check) {
                    if ($times[$k] < $start || $times[$k] >= $end) {
                        continue;
                    }
                    $count++;
                    if ($check['outcome'] === Outcome::UP) {
                        $ups++;
                        $ms[] = $check['ms_total'];
                    }
                    $cert = $check['cert_not_after'] ?? $cert;
                }
                $coverage = UptimeMath::coverage($samples, $interval, $start, $end);
                if ($count === 0 && $coverage['measured'] === 0) {
                    continue;
                }
                $rows[] = [$idTarget, self::grain($column, $start), StateStore::LOCAL, $count, $ups, 0,
                    $coverage['measured'], $coverage['up'], UptimeMath::percentile($ms, 50), UptimeMath::percentile($ms, 95),
                    $ms ? max($ms) : null, $cert];
            }
        }

        return $rows;
    }

    /**
     * Day rows of the processing time from its hour rows: sums, the median of the hourly medians, the 95th
     * percentile of the hourly ones, the maximum.
     */
    private function rollProcessingDays(string $from, string $to, int $processingTargetId): void
    {
        $rows = Db::fetchAll(
            'SELECT DATE(hour) AS day, samples, bulk_samples, ms_p50, ms_p95, ms_max FROM ' . Schema::table(Schema::HOUR)
            . ' WHERE idtarget = ? AND source = ? AND hour >= ? AND hour < ?',
            [$processingTargetId, StateStore::LOCAL, $from, $to]
        );
        $days = [];
        foreach ($rows as $row) {
            $d = $days[$row['day']] ?? ['samples' => 0, 'bulk' => 0, 'p50' => [], 'p95' => [], 'max' => null];
            $d['samples'] += (int) $row['samples'];
            $d['bulk'] += (int) $row['bulk_samples'];
            if ($row['ms_p50'] !== null) {
                $d['p50'][] = (int) $row['ms_p50'];
            }
            if ($row['ms_p95'] !== null) {
                $d['p95'][] = (int) $row['ms_p95'];
            }
            if ($row['ms_max'] !== null) {
                $d['max'] = max((int) $d['max'], (int) $row['ms_max']);
            }
            $days[$row['day']] = $d;
        }
        $values = [];
        foreach ($days as $day => $d) {
            $values[] = [$processingTargetId, (string) $day, StateStore::LOCAL, $d['samples'], 0, $d['bulk'], 0, 0,
                UptimeMath::percentile($d['p50'], 50), UptimeMath::percentile($d['p95'], 95), $d['max'], null];
        }
        $this->write(Schema::DAY, 'day', $values);
    }

    private function rollExternalDays(string $from, string $to): void
    {
        $rows = Db::fetchAll(
            'SELECT idtarget, DATE(hour) AS day, samples, up_samples, measured_seconds, up_seconds, ms_p50, ms_p95, ms_max, cert_not_after FROM '
            . Schema::table(Schema::HOUR) . ' WHERE source = ? AND hour >= ? AND hour < ? ORDER BY idtarget, hour',
            [StateStore::EXTERNAL, $from, $to]
        );
        $days = [];
        foreach ($rows as $row) {
            $key = $row['idtarget'] . '|' . $row['day'];
            $d = $days[$key] ?? ['idtarget' => (int) $row['idtarget'], 'day' => (string) $row['day'], 'samples' => 0,
                'up_samples' => 0, 'measured' => 0, 'up' => 0, 'p50' => [], 'p95' => [], 'max' => null, 'cert' => null];
            $d['samples'] += (int) $row['samples'];
            $d['up_samples'] += (int) $row['up_samples'];
            $d['measured'] += (int) $row['measured_seconds'];
            $d['up'] += (int) $row['up_seconds'];
            if ($row['ms_p50'] !== null) {
                $d['p50'][] = (int) $row['ms_p50'];
            }
            if ($row['ms_p95'] !== null) {
                $d['p95'][] = (int) $row['ms_p95'];
            }
            if ($row['ms_max'] !== null) {
                $d['max'] = max((int) $d['max'], (int) $row['ms_max']);
            }
            $d['cert'] = $row['cert_not_after'] ?? $d['cert'];
            $days[$key] = $d;
        }
        $values = [];
        foreach ($days as $d) {
            // the hours carry no raw times: the day's p50 is the median of the hourly ones, its p95 the 95th of theirs
            $values[] = [$d['idtarget'], $d['day'], StateStore::EXTERNAL, $d['samples'], $d['up_samples'], 0, $d['measured'],
                $d['up'], UptimeMath::percentile($d['p50'], 50), UptimeMath::percentile($d['p95'], 95), $d['max'], $d['cert']];
        }
        $this->write(Schema::DAY, 'day', $values);
    }

    private function write(string $table, string $column, array $rows): void
    {
        Sql::insertRows(
            Schema::table($table),
            ['idtarget', $column, 'source', 'samples', 'up_samples', 'bulk_samples', 'measured_seconds', 'up_seconds', 'ms_p50', 'ms_p95', 'ms_max', 'cert_not_after'],
            $rows,
            'samples = VALUES(samples), up_samples = VALUES(up_samples), bulk_samples = VALUES(bulk_samples),'
            . ' measured_seconds = VALUES(measured_seconds), up_seconds = VALUES(up_seconds), ms_p50 = VALUES(ms_p50),'
            . ' ms_p95 = VALUES(ms_p95), ms_max = VALUES(ms_max), cert_not_after = VALUES(cert_not_after)'
        );
    }

    private function read(string $table, string $column, array $idTargets, string $from, string $to, string $source): array
    {
        if ($idTargets === []) {
            return [];
        }
        $sql = 'SELECT * FROM ' . Schema::table($table) . ' WHERE idtarget IN (' . Sql::placeholders($idTargets) . ')'
            . " AND `$column` >= ? AND `$column` < ?";
        $bind = array_merge($idTargets, [$from, $to]);
        if ($source !== 'all') {
            $sql .= ' AND source = ?';
            $bind[] = $source;
        }

        return Db::fetchAll($sql . " ORDER BY idtarget, `$column`", $bind);
    }

    private static function grain(string $column, int $start): string
    {
        return $column === 'hour' ? gmdate('Y-m-d H:i:s', $start) : gmdate('Y-m-d', $start);
    }
}
