<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Report;

use Piwik\Period\Factory as PeriodFactory;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Thresholds;
use Piwik\Plugins\FeinwerkUptimeMonitor\Math\UptimeMath;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\Freshness;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\IncidentStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\RollupStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\SystemSettings;
use Piwik\Site;

/**
 * The numbers behind the API and the screens: status, uptime with coverage, response times, outages, certificates.
 * Reads the hour rows for periods up to 31 days (kept 90 days) and the day rows (UTC days, kept 400 days) for longer
 * periods or when no hour rows are left.
 */
final class UptimeReport
{
    public const PERIODS = ['day', 'week', 'month', 'year', 'range'];
    public const SOURCES = ['all', StateStore::LOCAL, StateStore::EXTERNAL];
    private const HOUR_ROWS_DAYS = 31;

    public function __construct(private ?\Closure $now = null)
    {
    }

    public function now(): int
    {
        return $this->now !== null ? (int) ($this->now)() : time();
    }

    /**
     * The UTC time range [from, to) of a Matomo period in the website's timezone (UTC for idSite 0), cut at now.
     *
     * @return array{from: int, to: int, grain: string}
     * @throws \Exception when Matomo cannot read the date
     */
    public function range(int $idSite, string $period, string $date, int $timezoneOf = 0): array
    {
        // idSite 0 (Matomo itself) shown next to a website: that website's day
        $zoneSite = $idSite > 0 ? $idSite : $timezoneOf;
        $timezone = $zoneSite > 0 ? Site::getTimezoneFor($zoneSite) : 'UTC';
        // "today" and "yesterday" in the website's timezone, like Matomo's own reports
        $built = PeriodFactory::makePeriodFromQueryParams($timezone, $period, $date);
        // local midnight of the first day and of the day after the last one, as UTC instants
        $from = (int) strtotime($built->getDateStart()->setTimezone($timezone)->getDateStartUTC() . ' UTC');
        $to = (int) strtotime($built->getDateEnd()->setTimezone($timezone)->getDateEndUTC() . ' UTC') + 1;
        $to = min($to, $this->now());
        $grain = $to - $from <= self::HOUR_ROWS_DAYS * 86400 ? 'hour' : 'day';

        return ['from' => $from, 'to' => max($from, $to), 'grain' => $grain];
    }

    /**
     * @return Target[] the targets shown for a website (idSite 0: Matomo's, with the processing pseudo target)
     */
    public function targets(int $idSite): array
    {
        $targets = (new TargetStore())->forSite($idSite);
        if ($idSite === 0) {
            $processing = (new TargetStore())->get(0, Kind::PROCESSING);
            if ($processing !== null) {
                $targets[] = $processing;
            }
        }

        return $targets;
    }

    /**
     * Uptime, coverage, outages and response times per target and source.
     *
     * @return list<array{targetKey: string, kind: string, source: string, uptimePercent: ?float, coveragePercent: float, outages: int, samples: int, p50Ms: ?int, p95Ms: ?int, maxMs: ?int}>
     */
    public function uptime(int $idSite, array $range, string $source): array
    {
        $targets = $this->targets($idSite);
        $ids = array_map(static fn(Target $t): int => $t->id, $targets);
        $rows = $this->rows($ids, $range, $source);
        $outages = [];
        foreach ((new IncidentStore())->find($idSite, self::utc($range['from']), self::utc($range['to']), 'all', 1000, $source) as $incident) {
            if ($incident['kind'] === IncidentStore::OUTAGE) {
                $key = $incident['idtarget'] . '|' . $incident['source'];
                $outages[$key] = ($outages[$key] ?? 0) + 1;
            }
        }
        $span = max(1, $range['to'] - $range['from']);

        $grouped = [];
        foreach ($rows as $row) {
            $grouped[$row['idtarget'] . '|' . $row['source']][] = $row;
        }
        $out = [];
        foreach ($targets as $target) {
            foreach (self::SOURCES as $src) {
                if ($src === 'all' || ($source !== 'all' && $src !== $source)) {
                    continue;
                }
                $group = $grouped[$target->id . '|' . $src] ?? [];
                if ($group === [] && $src === StateStore::EXTERNAL) {
                    continue;
                }
                $measured = array_sum(array_column($group, 'measured_seconds'));
                $up = array_sum(array_column($group, 'up_seconds'));
                $p50 = array_values(array_filter(array_column($group, 'ms_p50'), static fn($v): bool => $v !== null));
                $p95 = array_values(array_filter(array_column($group, 'ms_p95'), static fn($v): bool => $v !== null));
                $max = array_values(array_filter(array_column($group, 'ms_max'), static fn($v): bool => $v !== null));
                $isProcessing = $target->kind === Kind::PROCESSING;
                $uptime = UptimeMath::uptimePercent((int) $up, (int) $measured);
                $out[] = [
                    'targetKey' => $target->key,
                    'kind' => $target->kind,
                    'source' => $src,
                    'uptimePercent' => $isProcessing || $uptime === null ? null : round($uptime, 3),
                    'coveragePercent' => $isProcessing ? 0.0 : round(min(100.0, 100.0 * $measured / $span), 1),
                    'outages' => $outages[$target->id . '|' . $src] ?? 0,
                    'samples' => (int) array_sum(array_column($group, 'samples')),
                    'p50Ms' => UptimeMath::percentile(array_map('intval', $p50), 50),
                    'p95Ms' => UptimeMath::percentile(array_map('intval', $p95), 95),
                    'maxMs' => $max ? max(array_map('intval', $max)) : null,
                ];
            }
        }

        return $out;
    }

    /**
     * Response time series of one target.
     *
     * @return list<array{time: string, source: string, samples: int, p50Ms: ?int, p95Ms: ?int, maxMs: ?int, uptimePercent: ?float}>
     */
    public function responseTimes(Target $target, array $range, string $source): array
    {
        $out = [];
        foreach ($this->rows([$target->id], $range, $source) as $row) {
            $time = $range['grain'] === 'hour' ? (string) $row['hour'] : $row['day'] . ' 00:00:00';
            $uptime = UptimeMath::uptimePercent((int) $row['up_seconds'], (int) $row['measured_seconds']);
            $out[] = [
                'time' => self::iso((int) strtotime($time . ' UTC')),
                'source' => (string) $row['source'],
                'samples' => (int) $row['samples'],
                'p50Ms' => $row['ms_p50'] !== null ? (int) $row['ms_p50'] : null,
                'p95Ms' => $row['ms_p95'] !== null ? (int) $row['ms_p95'] : null,
                'maxMs' => $row['ms_max'] !== null ? (int) $row['ms_max'] : null,
                'uptimePercent' => $target->kind === Kind::PROCESSING || $uptime === null ? null : round($uptime, 3),
            ];
        }
        usort($out, static fn(array $a, array $b): int => [$a['time'], $a['source']] <=> [$b['time'], $b['source']]);

        return $out;
    }

    /**
     * @return list<array>
     */
    public function incidents(int $idSite, array $range, string $state, int $limit, string $source): array
    {
        $out = [];
        foreach ((new IncidentStore())->find($idSite, self::utc($range['from']), self::utc($range['to']), $state, $limit, $source) as $row) {
            $start = (int) strtotime($row['started_at'] . ' UTC');
            $end = $row['ended_at'] !== null ? (int) strtotime($row['ended_at'] . ' UTC') : null;
            $out[] = [
                'idIncident' => (int) $row['idincident'],
                'type' => (string) $row['kind'],
                'targetKey' => $row['target_key'] !== null ? (string) $row['target_key'] : null,
                'kind' => $row['target_kind'] !== null ? (string) $row['target_kind'] : null,
                'source' => (string) $row['source'],
                'start' => self::iso($start),
                'end' => $end !== null ? self::iso($end) : null,
                'durationSeconds' => ($end ?? $this->now()) - $start,
                'open' => $end === null,
                'cause' => $row['cause'] !== null ? (string) $row['cause'] : null,
                'detail' => $row['detail'] !== null ? (string) $row['detail'] : null,
                'failedChecks' => (int) $row['down_samples'],
            ];
        }

        return $out;
    }

    /**
     * Latest state of each target of a website, both sources.
     *
     * @return list<array>
     */
    public function status(int $idSite, bool $withUrls): array
    {
        $targets = $this->targets($idSite);
        $states = (new StateStore())->forTargets(array_map(static fn(Target $t): int => $t->id, $targets));
        $staleAfter = Freshness::now($this->now());
        $settings = self::settings();
        $out = [];
        foreach ($targets as $target) {
            if ($target->kind === Kind::PROCESSING) {
                continue;
            }
            $bySource = [];
            $cert = null;
            foreach ($states[$target->id] ?? [] as $source => $state) {
                $bySource[$source] = [
                    'outcome' => $state['outcome'],
                    'error' => $state['error'],
                    'note' => $state['note'],
                    'httpStatus' => $state['status'],
                    'responseMs' => $state['ms_total'],
                    'checkedAt' => self::iso((int) strtotime($state['checked_at'] . ' UTC')),
                    // older than two check intervals: no longer current, never shown as reachable
                    'stale' => $this->now() - (int) strtotime($state['checked_at'] . ' UTC') > $staleAfter,
                ];
                $cert = $cert ?? $state['cert_not_after'];
            }
            $out[] = [
                'targetKey' => $target->key,
                'kind' => $target->kind,
                'url' => $withUrls ? $target->url : null,
                'urlSource' => $target->urlSource,
                'enabled' => $target->enabled,
                'lastCheckedAt' => $target->lastCheckedAt !== null ? self::iso((int) strtotime($target->lastCheckedAt . ' UTC')) : null,
                'states' => $bySource,
                'certificate' => $cert !== null ? $this->certificate($cert, $settings) : null,
            ];
        }

        return $out;
    }

    /**
     * One row per website and one for Matomo (idSite 0): how many targets, how many are down or cannot be checked,
     * the last check, the soonest certificate expiry. Four queries for all websites.
     *
     * @return list<array{idSite: int, name: string, targets: int, off: int, up: int, down: int, notCheckable: int, stale: int, lastCheckedAt: ?string, certificateDaysLeft: ?int}>
     */
    public function overview(): array
    {
        $states = (new StateStore())->all();
        $staleAfter = Freshness::now($this->now());
        $names = [0 => 'Matomo'];
        foreach ((new \Piwik\Plugins\SitesManager\Model())->getAllSites() as $site) {
            $names[(int) $site['idsite']] = \Piwik\Common::unsanitizeInputValue((string) $site['name']);
        }
        $rows = [];
        foreach ((new TargetStore())->current() as $target) {
            if (!isset($names[$target->idSite])) {
                continue;
            }
            $row = $rows[$target->idSite] ?? ['idSite' => $target->idSite, 'name' => $names[$target->idSite], 'targets' => 0,
                'off' => 0, 'up' => 0, 'down' => 0, 'notCheckable' => 0, 'stale' => 0, 'lastCheckedAt' => null,
                'certificateDaysLeft' => null];
            if (!$target->enabled) {
                // listed so that a super user can switch it on again from the overview
                $row['off']++;
                $rows[$target->idSite] = $row;
                continue;
            }
            $row['targets']++;
            $state = $states[$target->id][StateStore::LOCAL] ?? null;
            if ($state !== null) {
                $checkedTs = (int) strtotime($state['checked_at'] . ' UTC');
                if ($this->now() - $checkedTs > $staleAfter) {
                    // the checks stopped: not current, so neither up nor down
                    $row['stale']++;
                } else {
                    $row['up'] += $state['outcome'] === 'up' ? 1 : 0;
                    $row['down'] += $state['outcome'] === 'down' ? 1 : 0;
                    $row['notCheckable'] += $state['outcome'] === 'not_checkable' ? 1 : 0;
                }
                $checked = self::iso($checkedTs);
                $row['lastCheckedAt'] = $row['lastCheckedAt'] === null ? $checked : max($row['lastCheckedAt'], $checked);
                if ($state['cert_not_after'] !== null) {
                    $days = $this->certificate($state['cert_not_after'])['daysLeft'];
                    $row['certificateDaysLeft'] = $row['certificateDaysLeft'] === null ? $days : min($row['certificateDaysLeft'], $days);
                }
            }
            $rows[$target->idSite] = $row;
        }
        ksort($rows);

        return array_values($rows);
    }

    /**
     * Processing time of real tracking requests over the last hour (spec 6.6).
     *
     * @return array{samples: int, p50Ms: ?int, p95Ms: ?int, maxMs: ?int, from: string, to: string}
     */
    public function processingLastHour(): array
    {
        $now = $this->now();
        $last = (new RollupStore())->processingSince(self::utc($now - 3600));

        return [
            'samples' => $last['samples'],
            'p50Ms' => $last['p50'],
            'p95Ms' => $last['p95'],
            'maxMs' => $last['max'],
            'from' => self::iso($now - 3600),
            'to' => self::iso($now),
        ];
    }

    /**
     * @return array{notAfter: string, daysLeft: int, level: string} level ok|warning|critical|expired
     */
    public function certificate(string $notAfter, ?array $settings = null): array
    {
        $settings ??= self::settings();
        $days = (int) floor(((int) strtotime($notAfter . ' 23:59:59 UTC') - $this->now()) / 86400);
        $level = $days < 0 ? 'expired' : ($days <= Thresholds::CERT_CRITICAL_DAYS ? 'critical' : ($days <= $settings['certWarningDays'] ? 'warning' : 'ok'));

        return ['notAfter' => $notAfter, 'daysLeft' => $days, 'level' => $level];
    }

    public static function iso(int $timestamp): string
    {
        return gmdate('Y-m-d\TH:i:s\Z', $timestamp);
    }

    public static function utc(int $timestamp): string
    {
        return gmdate('Y-m-d H:i:s', $timestamp);
    }

    /**
     * @return array{certWarningDays: int, slowTrackerMs: int}
     */
    public static function settings(): array
    {
        try {
            $settings = new SystemSettings();
            return [
                'certWarningDays' => (int) $settings->certWarningDays->getValue(),
                'slowTrackerMs' => (int) $settings->slowTrackerMs->getValue(),
            ];
        } catch (\Throwable $e) {
            return ['certWarningDays' => SystemSettings::DEFAULT_CERT_WARNING_DAYS, 'slowTrackerMs' => SystemSettings::DEFAULT_SLOW_TRACKER_MS];
        }
    }

    /**
     * Hour rows for short periods; day rows for long ones and when the hours are already deleted (sets the grain).
     */
    private function rows(array $ids, array &$range, string $source): array
    {
        $rollups = new RollupStore();
        if ($range['grain'] === 'hour') {
            $rows = $rollups->hours($ids, self::utc(intdiv($range['from'], 3600) * 3600), self::utc($range['to']), $source);
            if ($rows !== []) {
                return $rows;
            }
            $range['grain'] = 'day';
        }

        // the UTC days that lie mostly inside the period
        return $rollups->days($ids, gmdate('Y-m-d', $range['from'] + 43200), gmdate('Y-m-d', $range['to'] + 43200), $source);
    }
}
