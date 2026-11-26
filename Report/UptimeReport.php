<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Report;

use Piwik\Date;
use Piwik\Period\Factory as PeriodFactory;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Thresholds;
use Piwik\Plugins\FeinwerkUptimeMonitor\External\ExternalResults;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\AddressGuard;
use Piwik\Plugins\FeinwerkUptimeMonitor\Math\UptimeMath;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\CheckRunner;
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
    /** the strips of getTimeline: every target, or grouped as the screens show them */
    public const GROUPS = ['all', 'matomo', 'website'];
    private const HOUR_ROWS_DAYS = 31;
    /**
     * One address checked from both sides, as the uptime page combines them (UptimePage.vue COMBINED): the first of
     * these that either side has. Down when either side finds it down, reachable when one side reaches it and none
     * finds it down, not checkable only when no side can check it. An address that cannot be checked from outside
     * takes the server's outcome alone (counts()).
     */
    private const COMBINED = [Outcome::DOWN, Outcome::UP, Outcome::NOT_CHECKABLE, self::STALE];
    private const STALE = 'stale';

    /** whether results checked from outside count, read once per report (outsideActive()) */
    private ?bool $outside = null;

    public function __construct(private ?\Closure $now = null)
    {
    }

    /**
     * Whether results checked from outside count now: another plugin delivers them (ExternalResults::activeSource()).
     * Without one, old results from outside give no state and no certificate (status(), overview()).
     */
    public function outsideActive(): bool
    {
        return $this->outside ??= ExternalResults::activeSource($this->now()) !== null;
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
    public function range(int $idSite, string $period, string $date, int $timezoneOf = 0, bool $cutAtNow = true): array
    {
        // idSite 0 (Matomo itself) shown next to a website: that website's day
        $zoneSite = $idSite > 0 ? $idSite : $timezoneOf;
        $timezone = $zoneSite > 0 ? Site::getTimezoneFor($zoneSite) : 'UTC';
        // "today" and "yesterday" in the website's timezone, like Matomo's own reports
        $built = PeriodFactory::makePeriodFromQueryParams($timezone, $period, $date);
        // local midnight of the first day and of the day after the last one, as UTC instants
        $from = (int) strtotime($built->getDateStart()->setTimezone($timezone)->getDateStartUTC() . ' UTC');
        $to = (int) strtotime($built->getDateEnd()->setTimezone($timezone)->getDateEndUTC() . ' UTC') + 1;
        if ($cutAtNow) {
            $to = min($to, $this->now());
        }
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
     * The hour strip (Peter's D2): one cell per hour for a day, per local day (the website's timezone) for periods up to
     * 31 days, per UTC day beyond (when only day rows are kept). A cell sums the switched-on targets of the group (see
     * groupTargets(); the processing time never counts): up when all measured time was up, down when none was, partial
     * between, none when nothing was measured, future after now.
     *
     * @param array{from: int, to: int, grain: string} $range from range()
     * @param string $timezone the timezone the local days follow (Matomo's names, also "UTC+2")
     * @param string $group all|matomo|website, see groupTargets()
     * @return array{grain: string, days: ?string, cells: list<array{time: string, measuredSeconds: int, upSeconds: int, state: string}>}
     */
    public function timeline(int $idSite, array $range, string $source, string $timezone, string $period = '', string $group = 'all'): array
    {
        // the switched-on addresses, as on the screens (a switched-off address no longer counts)
        $ids = array_map(static fn(Target $t): int => $t->id, array_filter($this->groupTargets($idSite, $group),
            static fn(Target $t): bool => $t->kind !== Kind::PROCESSING && $t->enabled));
        $now = $this->now();
        $span = $range['to'] - $range['from'];
        // a fixed axis per period: a day in hours, a week and a month in the website's days, longer periods in UTC days
        $hourly = $period === 'day' || ($period !== 'week' && $period !== 'month' && $span <= 2 * 86400);
        $localDays = !$hourly && $span <= self::HOUR_ROWS_DAYS * 86400;
        $rollups = new RollupStore();
        $cells = [];
        $grain = $hourly ? 'hour' : 'day';
        $days = $hourly ? null : 'local';
        $readTo = min($range['to'], $now);
        $hourRows = ($hourly || $localDays) && $ids !== [] && $readTo > $range['from']
            ? $rollups->hours($ids, self::utc(intdiv($range['from'], 3600) * 3600), self::utc($readTo), $source)
            : [];
        if ($hourly) {
            for ($t = intdiv($range['from'], 3600) * 3600; $t < $range['to']; $t += 3600) {
                $cells[$t] = [0, 0];
            }
            foreach ($hourRows as $row) {
                $t = (int) strtotime($row['hour'] . ' UTC');
                if (isset($cells[$t])) {
                    $cells[$t][0] += (int) $row['measured_seconds'];
                    $cells[$t][1] += (int) $row['up_seconds'];
                }
            }
        } elseif ($localDays && ($hourRows !== [] || $readTo <= $range['from'] || $ids === []
            || $rollups->days($ids, gmdate('Y-m-d', $range['from'] + 43200), gmdate('Y-m-d', $readTo + 43200), $source) === [])) {
            // UTC days only when the hourly values are gone but day values exist (older than 90 days)
            // local days: the start of each local day as a UTC instant
            $starts = [];
            for ($t = $range['from']; $t < $range['to']; $t += 86400) {
                $starts[self::localDay($t, $timezone)] ??= $t;
            }
            foreach ($starts as $t) {
                $cells[$t] = [0, 0];
            }
            foreach ($hourRows as $row) {
                $local = self::localDay((int) strtotime($row['hour'] . ' UTC'), $timezone);
                if (isset($starts[$local])) {
                    $cells[$starts[$local]][0] += (int) $row['measured_seconds'];
                    $cells[$starts[$local]][1] += (int) $row['up_seconds'];
                }
            }
        } else {
            // long periods, and short ones whose hourly values are gone (kept 90 days): UTC days, like uptime()
            $days = 'utc';
            $first = gmdate('Y-m-d', $range['from'] + 43200);
            $last = gmdate('Y-m-d', $range['to'] + 43200);
            for ($day = $first; $day < $last; $day = gmdate('Y-m-d', (int) strtotime($day . ' UTC') + 86400)) {
                $cells[(int) strtotime($day . ' UTC')] = [0, 0];
            }
            if ($ids !== []) {
                foreach ($rollups->days($ids, $first, gmdate('Y-m-d', $readTo + 43200), $source) as $row) {
                    $t = (int) strtotime($row['day'] . ' UTC');
                    if (isset($cells[$t])) {
                        $cells[$t][0] += (int) $row['measured_seconds'];
                        $cells[$t][1] += (int) $row['up_seconds'];
                    }
                }
            }
        }
        $out = [];
        foreach ($cells as $t => [$measured, $up]) {
            if ($t >= $now) {
                $state = 'future';
            } else {
                $state = $measured <= 0 ? 'none' : ($up >= $measured ? 'up' : ($up <= 0 ? 'down' : 'partial'));
            }
            $out[] = ['time' => self::iso($t), 'measuredSeconds' => $measured, 'upSeconds' => $up, 'state' => $state];
        }

        // final review D3: a period before the first measurement names the day the measurements start
        $first = $rollups->firstMeasured($ids, $source);

        return ['grain' => $grain, 'days' => $days, 'cells' => $out,
            'firstMeasured' => $first !== null ? self::iso((int) strtotime($first . ' UTC')) : null];
    }

    /**
     * The local calendar day of a UTC instant in a Matomo timezone: IANA names, and Matomo's fixed offsets ("UTC+2",
     * "UTC-5.5") that PHP's DateTimeZone cannot read. Matomo's Date::setTimezone() is for the other direction (a local
     * date to UTC) and shifts the wrong way here.
     */
    private static function localDay(int $timestamp, string $timezone): string
    {
        if (preg_match('/^UTC([+-])(\d+(?:\.\d+)?)$/', $timezone, $m)) {
            $offset = (int) round((float) $m[2] * 3600) * ($m[1] === '-' ? -1 : 1);

            return gmdate('Y-m-d', $timestamp + $offset);
        }
        try {
            return (new \DateTime('@' . $timestamp))->setTimezone(new \DateTimeZone($timezone === '' ? 'UTC' : $timezone))->format('Y-m-d');
        } catch (\Throwable $e) {
            return gmdate('Y-m-d', $timestamp);
        }
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
     * The incidents that overlap the range, newest first, each with the part that lies inside it (startInPeriod,
     * durationInPeriodSeconds; UptimeMath::partIn()): an outage across midnight counts on each day only with its own
     * part, an open one up to now.
     *
     * @param array{from: int, to: int, grain: string} $range from range()
     * @return list<array>
     */
    public function incidents(int $idSite, array $range, string $state, int $limit, string $source): array
    {
        $out = [];
        $now = $this->now();
        foreach ((new IncidentStore())->find($idSite, self::utc($range['from']), self::utc($range['to']), $state, $limit, $source) as $row) {
            $start = (int) strtotime($row['started_at'] . ' UTC');
            $end = $row['ended_at'] !== null ? (int) strtotime($row['ended_at'] . ' UTC') : null;
            $part = UptimeMath::partIn($start, $end, $range['from'], $range['to'], $now);
            $out[] = [
                'idIncident' => (int) $row['idincident'],
                'type' => (string) $row['kind'],
                'targetKey' => $row['target_key'] !== null ? (string) $row['target_key'] : null,
                'kind' => $row['target_kind'] !== null ? (string) $row['target_kind'] : null,
                'source' => (string) $row['source'],
                'start' => self::iso($start),
                'end' => $end !== null ? self::iso($end) : null,
                'durationSeconds' => ($end ?? $now) - $start,
                'startInPeriod' => self::iso($part['start']),
                'durationInPeriodSeconds' => $part['seconds'],
                'open' => $end === null,
                'cause' => $row['cause'] !== null ? (string) $row['cause'] : null,
                'detail' => $row['detail'] !== null ? (string) $row['detail'] : null,
                'failedChecks' => (int) $row['down_samples'],
            ];
        }

        return $out;
    }

    /**
     * Latest state of each target of a website: from the Matomo server, and from outside only while a source of such
     * results is active (outsideActive()). The certificate is the server's, else the one from outside.
     *
     * @return list<array>
     */
    public function status(int $idSite, bool $withUrls): array
    {
        $targets = $this->targets($idSite);
        $states = (new StateStore())->forTargets(array_map(static fn(Target $t): int => $t->id, $targets));
        $staleAfter = Freshness::now($this->now());
        // results checked from outside come with the other plugin's pulls: current between two of them
        $staleBySource = [StateStore::EXTERNAL => max($staleAfter, ExternalResults::STALE_AFTER)];
        $outside = $this->outsideActive();
        $settings = self::settings();
        $guard = self::guard();
        $out = [];
        foreach ($targets as $target) {
            if ($target->kind === Kind::PROCESSING) {
                continue;
            }
            $bySource = [];
            $sides = self::sides($states[$target->id] ?? [], $outside);
            foreach ($sides as $source => $state) {
                $bySource[$source] = [
                    'outcome' => $state['outcome'],
                    'error' => $state['error'],
                    'note' => $state['note'],
                    'httpStatus' => $state['status'],
                    'responseMs' => $state['ms_total'],
                    'checkedAt' => self::iso((int) strtotime($state['checked_at'] . ' UTC')),
                    // older than two check intervals: no longer current, never shown as reachable
                    'stale' => $this->now() - (int) strtotime($state['checked_at'] . ' UTC') > ($staleBySource[$source] ?? $staleAfter),
                ];
            }
            $cert = self::certOf($sides);
            $out[] = [
                'targetKey' => $target->key,
                'kind' => $target->kind,
                'url' => $withUrls ? $target->url : null,
                'urlSource' => $target->urlSource,
                'enabled' => $target->enabled,
                'lastCheckedAt' => $target->lastCheckedAt !== null ? self::iso((int) strtotime($target->lastCheckedAt . ' UTC')) : null,
                'serverRefuses' => self::refuses($guard, $target),
                'states' => $bySource,
                'certificate' => $cert !== null ? $this->certificate($cert, $settings) : null,
            ];
        }

        return $out;
    }

    /**
     * The targets of a strip. Group all: every target of the website (idSite 0: Matomo's own). Group matomo: what runs
     * on the Matomo server for this website, Matomo's own addresses and the website's Tag Manager containers, whose
     * file Matomo serves (Peter, 2026-11-25, "a)"). Group website: the website's own addresses and its tracking proxy.
     *
     * @return Target[]
     */
    public function groupTargets(int $idSite, string $group): array
    {
        if ($group === 'matomo') {
            $own = array_filter($this->targets(0), static fn(Target $t): bool => in_array($t->kind, Kind::INSTANCE, true));
            $containers = $idSite > 0
                ? array_filter($this->targets($idSite), static fn(Target $t): bool => $t->kind === Kind::CONTAINER) : [];

            return array_merge(array_values($own), array_values($containers));
        }
        $targets = $this->targets($idSite);

        return $group === 'website'
            ? array_values(array_filter($targets, static fn(Target $t): bool => $t->kind !== Kind::CONTAINER))
            : $targets;
    }

    /**
     * One row per website and one for Matomo (idSite 0): how many targets, how many are down or cannot be checked,
     * the last check, the soonest certificate expiry. Tag Manager containers count in Matomo's row, which names the
     * websites whose container is down (containersDown). While results checked from outside count (outsideActive()),
     * each target combines both sides as the uptime page does (COMBINED, counting()); the certificate is the server's,
     * else the one from outside, and the last check the newer of both; notCheckableOutside counts the targets of
     * notCheckable whose current result from outside is not checkable too; downFromServerOnly the targets of down that
     * only the server finds down while the latest result from outside reaches them (Peter's 3a: amber on the screens),
     * and downFromOutsideOnly those that only the outside finds down, both by aloneDown() (L8 review of 5.3.0, the
     * review of its fixes; aloneDown() names the limit). Four queries for all websites, a fifth for the outages, open or
     * recently ended, of the targets one side finds down.
     *
     * @return list<array{idSite: int, name: string, timezone: string, targets: int, off: int, up: int, down: int, notCheckable: int, stale: int, lastCheckedAt: ?string, certificateDaysLeft: ?int, certificateLevel: ?string, containersDown: list<array{idSite: int, name: string}>, notCheckableOutside: int, downFromServerOnly: int, downFromOutsideOnly: int}>
     */
    public function overview(): array
    {
        $states = (new StateStore())->all();
        $now = $this->now();
        $staleAfter = Freshness::now($now);
        // results checked from outside: current between two of the other plugin's pulls, as in status()
        $staleOutside = max($staleAfter, ExternalResults::STALE_AFTER);
        $outside = $this->outsideActive();
        // the certificate thresholds and the guard once, not per target
        $settings = self::settings();
        $guard = self::guard();
        $names = [0 => 'Matomo'];
        $zones = [0 => 'UTC'];
        foreach ((new \Piwik\Plugins\SitesManager\Model())->getAllSites() as $site) {
            $names[(int) $site['idsite']] = \Piwik\Common::unsanitizeInputValue((string) $site['name']);
            $zones[(int) $site['idsite']] = (string) ($site['timezone'] ?? 'UTC');
        }
        $rows = [];
        // the targets that one side finds down: [idRow, idTarget, local, external, sides]
        $oneSided = [];
        foreach ((new TargetStore())->current() as $target) {
            if (!isset($names[$target->idSite])) {
                continue;
            }
            // a Tag Manager container is a file on the Matomo server: it counts with Matomo (Peter, 2026-11-25, "a)")
            $idRow = $target->kind === Kind::CONTAINER ? 0 : $target->idSite;
            $row = $rows[$idRow] ?? ['idSite' => $idRow, 'name' => $names[$idRow],
                'timezone' => $zones[$idRow] ?? 'UTC', 'targets' => 0,
                'off' => 0, 'up' => 0, 'down' => 0, 'notCheckable' => 0, 'stale' => 0, 'lastCheckedAt' => null,
                'certificateDaysLeft' => null, 'certificateLevel' => null, 'containersDown' => [], 'notCheckableOutside' => 0,
                'downFromServerOnly' => 0, 'downFromOutsideOnly' => 0];
            if (!$target->enabled) {
                // listed so that a super user can switch it on again from the overview (a container: from its website)
                $row['off']++;
                $rows[$idRow] = $row;
                continue;
            }
            $row['targets']++;
            $both = self::sides($states[$target->id] ?? [], $outside);
            $sides = self::counting($both);
            $local = self::outcomeOf($sides[StateStore::LOCAL] ?? null, $staleAfter, $now);
            if ($local === null && self::refuses($guard, $target)) {
                // the server never checks this address: not checkable from the moment it is set, with no check time
                $local = Outcome::NOT_CHECKABLE;
            }
            if ($local !== null || $sides !== []) {
                $external = self::outcomeOf($sides[StateStore::EXTERNAL] ?? null, $staleOutside, $now);
                $outcome = self::combined([$local, $external]);
                if ($outside && ($local === Outcome::DOWN) !== ($external === Outcome::DOWN)) {
                    // one side finds it down: whether that side alone does needs the open outages (aloneDown()); without
                    // results from outside there is no side to name and no query
                    $oneSided[] = [$idRow, $target->id, $local, $external, $sides];
                }
                // stale: the checks stopped, not current, so neither up nor down
                $row['stale'] += $outcome === self::STALE ? 1 : 0;
                $row['up'] += $outcome === Outcome::UP ? 1 : 0;
                $row['down'] += $outcome === Outcome::DOWN ? 1 : 0;
                $row['notCheckable'] += $outcome === Outcome::NOT_CHECKABLE ? 1 : 0;
                // UI review B3: the outside said it cannot check it either (counting() drops that side above)
                $row['notCheckableOutside'] += $outcome === Outcome::NOT_CHECKABLE
                    && self::outcomeOf($both[StateStore::EXTERNAL] ?? null, $staleOutside, $now) === Outcome::NOT_CHECKABLE ? 1 : 0;
                if ($target->kind === Kind::CONTAINER && $outcome === Outcome::DOWN) {
                    // Matomo's row says whose container fails: the fix may be in that website's Tag Manager
                    $row['containersDown'][$target->idSite] = ['idSite' => $target->idSite, 'name' => $names[$target->idSite]];
                }
                foreach ($sides as $state) {
                    $checked = self::iso((int) strtotime($state['checked_at'] . ' UTC'));
                    $row['lastCheckedAt'] = $row['lastCheckedAt'] === null ? $checked : max($row['lastCheckedAt'], $checked);
                }
                $notAfter = self::certOf($sides);
                if ($notAfter !== null) {
                    $cert = $this->certificate($notAfter, $settings);
                    if ($row['certificateDaysLeft'] === null || $cert['daysLeft'] < $row['certificateDaysLeft']) {
                        // the soonest certificate and its level, as the uptime page colours it
                        $row['certificateDaysLeft'] = $cert['daysLeft'];
                        $row['certificateLevel'] = $cert['level'];
                    }
                }
            }
            $rows[$idRow] = $row;
        }
        if ($oneSided !== []) {
            // one query for the outages of every target that one side finds down, open or ended since the oldest failing
            // result that can still be current (from outside: $staleOutside, at least the server's $staleAfter); review
            // of the 5.3.0 fixes, SHOULD 1 (index open, idtarget first)
            $outages = (new IncidentStore())->openOrEndedSince(array_column($oneSided, 1), self::utc($now - $staleOutside));
            $margin = Freshness::sidesMargin();
            foreach ($oneSided as [$idRow, $id, $local, $external, $sides]) {
                $server = [$local, $sides[StateStore::LOCAL] ?? null, $outages[$id][StateStore::LOCAL] ?? null];
                $fromOutside = [$external, $sides[StateStore::EXTERNAL] ?? null, $outages[$id][StateStore::EXTERNAL] ?? null];
                $rows[$idRow]['downFromServerOnly'] += $external === Outcome::UP
                    && self::aloneDown($server, $fromOutside, $margin) ? 1 : 0;
                $rows[$idRow]['downFromOutsideOnly'] += self::aloneDown($fromOutside, $server, $margin) ? 1 : 0;
            }
        }
        ksort($rows);
        foreach ($rows as &$row) {
            ksort($row['containersDown']);
            $row['containersDown'] = array_values($row['containersDown']);
        }
        unset($row);

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
     * The states of one target that count, the server's first: the one from outside only while results checked from
     * outside count (outsideActive()), so old ones never show after the other plugin stopped.
     *
     * @param array<string, array> $states one target's states by source (StateStore)
     * @return array<string, array>
     */
    private static function sides(array $states, bool $outside): array
    {
        $out = [];
        if (isset($states[StateStore::LOCAL])) {
            $out[StateStore::LOCAL] = $states[StateStore::LOCAL];
        }
        if ($outside && isset($states[StateStore::EXTERNAL])) {
            $out[StateStore::EXTERNAL] = $states[StateStore::EXTERNAL];
        }

        return $out;
    }

    /**
     * The sides that say something about an address: a result from outside that it cannot be checked from there (a
     * private address, a port the outside does not check) counts for nothing, so it never hides that the server's
     * checks stopped nor counts as a recent check; the uptime page does the same (UptimePage.vue row()).
     *
     * @param array<string, array> $sides sides()
     * @return array<string, array>
     */
    private static function counting(array $sides): array
    {
        if (($sides[StateStore::EXTERNAL]['outcome'] ?? null) === Outcome::NOT_CHECKABLE) {
            unset($sides[StateStore::EXTERNAL]);
        }

        return $sides;
    }

    /** The server's guard from the settings (no lookups here, refuses() only); null when they cannot be read. */
    private static function guard(): ?AddressGuard
    {
        try {
            return CheckRunner::guard();
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Whether the server never checks the target's address (AddressGuard::refusesWithoutLookup()): it reads not
     * checkable from the moment it is set instead of "not checked yet" until the next run.
     */
    private static function refuses(?AddressGuard $guard, Target $target): bool
    {
        return $guard !== null && $guard->refusesWithoutLookup($target->url, $target->isInstanceAddress());
    }

    /** the certificate expiry of a target (Y-m-d): the server's, else the one from outside (sides() order), else null */
    private static function certOf(array $sides): ?string
    {
        foreach ($sides as $state) {
            if ($state['cert_not_after'] !== null) {
                return (string) $state['cert_not_after'];
            }
        }

        return null;
    }

    /** one side's current outcome: up|down|not_checkable, stale when older than $staleAfter seconds, null without one */
    private static function outcomeOf(?array $state, int $staleAfter, int $now): ?string
    {
        if ($state === null) {
            return null;
        }

        return $now - (int) strtotime($state['checked_at'] . ' UTC') > $staleAfter ? self::STALE : (string) $state['outcome'];
    }

    /**
     * Whether one side alone finds a target down (Peter's 3a; L8 review of 5.3.0 and the review of its fixes, SHOULD 1
     * and 2). The failing side finds it down and the other does not. The other side has no outage of its own open for
     * it, nor one that ended at or after the failing side's latest failing result: the failing side has not checked the
     * target since the other side's recovery (an outage from outside stays open until two good minutes in a row, so its
     * latest "up" can lie inside it). When the other side reaches the target, its result is newer than the start of the
     * failure (the failing side's open outage, else its failing result) by more than $margin: an older "up" says
     * nothing about the failure, and the server stamps a run's results with the run's start (Freshness::sidesMargin()).
     * An other side without a current result, or one that cannot check the target, leaves it to the failing side.
     * vue/src/sides.ts aloneDown() is the same rule for the screens.
     *
     * Limit: the other side's latest result is the newest one Matomo has. Results from outside arrive when their source
     * delivers them (up to 2 h 15 min old, ExternalResults::STALE_AFTER), so a target that goes down for everyone while
     * the server alone already failed (the lasting 3a case) reads as down from the server only until the source
     * delivers a newer result from outside.
     *
     * @param array{0: ?string, 1: ?array, 2: ?array} $failing the failing side: its outcome (outcomeOf()), its latest
     *        state (StateStore row), its outage of the target that is open or ended last (IncidentStore::openOrEndedSince())
     * @param array{0: ?string, 1: ?array, 2: ?array} $other the other side, the same three
     * @param int $margin seconds (Freshness::sidesMargin())
     */
    private static function aloneDown(array $failing, array $other, int $margin): bool
    {
        [$outcome, $state, $outage] = $failing;
        [$otherOutcome, $otherState, $otherOutage] = $other;
        if ($outcome !== Outcome::DOWN || $state === null || $otherOutcome === Outcome::DOWN) {
            return false;
        }
        $checked = (int) strtotime($state['checked_at'] . ' UTC');
        if ($otherOutage !== null
            && ($otherOutage['ended_at'] === null || (int) strtotime($otherOutage['ended_at'] . ' UTC') >= $checked)
        ) {
            return false;
        }
        if ($otherOutcome !== Outcome::UP || $otherState === null) {
            return true;
        }
        // only an open outage of the failing side gives the start of its failure
        $since = $outage !== null && $outage['ended_at'] === null ? (int) strtotime($outage['started_at'] . ' UTC') : $checked;

        return (int) strtotime($otherState['checked_at'] . ' UTC') > $since + $margin;
    }

    /** @param list<?string> $outcomes the sides' outcomes (outcomeOf()) */
    private static function combined(array $outcomes): ?string
    {
        foreach (self::COMBINED as $outcome) {
            if (in_array($outcome, $outcomes, true)) {
                return $outcome;
            }
        }

        return null;
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
