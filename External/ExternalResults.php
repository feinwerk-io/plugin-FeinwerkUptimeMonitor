<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\External;

use Piwik\Piwik;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\IncidentStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Retention;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\RollupStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\ContainerSource;

/**
 * The seam for results checked from outside (spec 9): the paid Pro plugin reads the targets and writes hour rows,
 * outages with their exact start and end, and the latest state per target, always with source `external`. The free
 * plugin itself never calls the outside service. A shared interface: change only with VERSION and an announcement.
 *
 * VERSION 2 (2026-11-26): targets(); writeHours() also recomputes the day rows of the past days it wrote; sources()
 * gives every entry the same keys, with settingsUrl, alerts (whether the source itself sends alerts for outages;
 * false when the entry does not say) and resultsAt (when its latest results arrived; null when the entry does not
 * say); the event EVENT_TARGETS_CHANGED; endOutages() (also forgets the latest state from outside of those targets,
 * except a not_checkable one); isActive(), activeOf() and activeSource(). writeIncidents() never opens again an
 * outage that has ended here. The VERSION 1 methods keep their parameters.
 *
 * The free plugin takes results checked from outside into account only while a source is active (activeSource()):
 * without one, old outside results give no state or certificate in getStatus, getCertificates, getSitesOverview and
 * the Sentinel checks, and the screens list no outages from outside. getUptime, getTimeline, getResponseTimes and
 * getIncidents still give them for source external or all (history).
 */
final class ExternalResults
{
    public const VERSION = 2;
    public const EVENT_SOURCES = 'FeinwerkUptimeMonitor.externalSource';

    /**
     * Posted without parameters after targets() changed: a target added, its address, kind or check data changed,
     * switched on or off, deleted or retired, also by detection and by the hourly sync of Matomo's own and the
     * websites' addresses. Only for a real change, possibly several times in one request: a listener that sends the
     * targets somewhere collects them and reads targets() once at the end of the request. A listener's failure never
     * stops the change.
     */
    public const EVENT_TARGETS_CHANGED = 'FeinwerkUptimeMonitor.targetsChanged';

    /** a source counts as active only when it reached its service within this many seconds (Pro: hourly pulls) */
    public const ACTIVE_WITHIN = 7200;

    /** how far a source's reachedAt may lie ahead of Matomo's clock (seconds); further ahead it does not count */
    public const CLOCK_AHEAD = 300;

    /**
     * a result checked from outside stays current this many seconds: it arrives when the source pulls (Pro: hourly, on
     * a page view at most every 5 minutes), so between pulls it is older than the local checks' window allows
     */
    public const STALE_AFTER = self::ACTIVE_WITHIN + 900;

    /** the keys of a target's extra that the seam gives out: what the classifier needs */
    private const EXTRA_TEXT = ['matomoHost', 'loginHost', 'idContainer'];

    /** @var \Closure(): int */
    private \Closure $now;

    /**
     * Callers construct it without arguments; the arguments are for tests.
     *
     * @param \Closure|null $now the current Unix time; default time()
     * @param ContainerSource|null $containers the live Tag Manager containers; default Tag Manager's tables
     */
    public function __construct(?\Closure $now = null, private ?ContainerSource $containers = null)
    {
        $this->now = $now ?? static fn(): int => time();
    }

    /**
     * Every current target, switched on or off, without the processing time pseudo target and without retired ones,
     * as the runner checks it: a Tag Manager container with the revision that is live now (Tag Manager inactive or
     * unreadable: the stored one; no longer published: none, checked by its id). Read only: unlike the runner it retires
     * nothing. Two queries (targets, live containers when there is a container).
     *
     * @return list<array{idtarget: int, idsite: int, key: string, kind: string, url: string, url_source: string, extra: array{matomoHost?: string, loginHost?: string, idContainer?: string, revision?: int}, enabled: bool, instanceAddress: bool}>
     *         idsite 0 = Matomo itself; kind ui|tracker|js|web|container|proxy; url_source default|detected|manual;
     *         instanceAddress: one of Matomo's own addresses (Target::isInstanceAddress())
     */
    public function targets(): array
    {
        $targets = (new TargetStore())->current();
        $live = null;
        foreach ($targets as $target) {
            if ($target->kind === Kind::CONTAINER && isset($target->extra['idContainer'])) {
                $live = ($this->containers ??= new ContainerSource())->liveRevisions();
                break;
            }
        }
        $out = [];
        foreach ($targets as $target) {
            $out[] = [
                'idtarget' => $target->id,
                'idsite' => $target->idSite,
                'key' => $target->key,
                'kind' => $target->kind,
                'url' => $target->url,
                'url_source' => $target->urlSource,
                'extra' => self::extra($target, $live),
                'enabled' => $target->enabled,
                'instanceAddress' => $target->isInstanceAddress(),
            ];
        }

        return $out;
    }

    /**
     * Writes hour rows checked from outside (upserts on idtarget, hour, source), then recomputes the day rows of every
     * past UTC day they touched, for the targets they touched: the free plugin sums a day once it is over, and Pro may
     * deliver a day's hours later (after Matomo was down). Today is summed when it is over. A day whose hour rows are
     * partly deleted (older than 90 days) keeps its row.
     *
     * @param list<array{idtarget: int, hour: string, samples: int, up_samples: int, measured_seconds: int, up_seconds: int, ms_p50: ?int, ms_p95: ?int, ms_max: ?int, cert_not_after: ?string, source?: string}> $rows
     *        hour: the start of the hour, "Y-m-d H:00:00" UTC; source: external only (another value throws)
     * @throws \InvalidArgumentException for a row of another source
     */
    public function writeHours(array $rows): void
    {
        $rows = array_map([self::class, 'external'], $rows);
        $rollups = new RollupStore();
        $rollups->upsertHours($rows);

        $now = ($this->now)();
        $today = gmdate('Y-m-d', $now);
        // the first day whose hours are all still kept (Retention deletes hours older than HOUR_DAYS days)
        $kept = gmdate('Y-m-d', $now - Retention::HOUR_DAYS * RollupStore::DAY + RollupStore::DAY - 1);
        $days = [];
        $targets = [];
        foreach ($rows as $row) {
            $day = substr((string) $row['hour'], 0, 10);
            if ($day < $today && $day >= $kept) {
                $days[$day] = true;
                $targets[(int) $row['idtarget']] = true;
            }
        }
        if ($days !== []) {
            $rollups->rollExternalDaysFor(array_keys($days), array_keys($targets));
        }
    }

    /**
     * Writes outages checked from outside with their exact start and end (upserts on target, source and start). An
     * outage ended here (switched off, retired, endOutages()) is never opened again by a row that still carries it
     * open; a row with an end replaces the end set here (IncidentStore::upsert() says why an address switched off and
     * on again keeps such an outage ended until the source reports its end).
     *
     * @param list<array{idtarget: int, started_at: string, ended_at: ?string, cause: ?string, detail: ?string, down_samples: int, source?: string}> $rows
     */
    public function writeIncidents(array $rows): void
    {
        $rows = array_map(static fn(array $row): array => self::external($row) + ['kind' => IncidentStore::OUTAGE], $rows);
        (new IncidentStore())->upsert($rows);
    }

    /**
     * Ends the open outages from outside of targets the source no longer checks (it stopped checking them: their
     * address cannot be checked from outside, they were switched off there, or its checks stopped): the source reports
     * no end for them. Their latest state from outside goes too, so they no longer read down (or reachable) from
     * outside; a not_checkable state stays (the source's note that it cannot check the address, written before this
     * call). An end before an outage's start ends it at its start. A changed address alone keeps its outage from outside
     * open until the source reports the end.
     *
     * @param int[] $idTargets
     * @param string $endedAt Y-m-d H:i:s UTC, when the source stopped checking them
     */
    public function endOutages(array $idTargets, string $endedAt): void
    {
        $ids = array_values(array_map('intval', $idTargets));
        (new IncidentStore())->closeOpen($ids, $endedAt, StateStore::EXTERNAL);
        (new StateStore())->forget($ids, StateStore::EXTERNAL, [Outcome::NOT_CHECKABLE]);
    }

    /**
     * @param list<array{idtarget: int, outcome: string, error: ?string, status: ?int, ms_total: ?int, cert_not_after: ?string, checked_at: string, source?: string}> $states
     */
    public function setLatest(array $states): void
    {
        $results = [];
        foreach ($states as $state) {
            $state = self::external($state);
            if (!in_array($state['outcome'], [Outcome::UP, Outcome::DOWN, Outcome::NOT_CHECKABLE], true)) {
                throw new \InvalidArgumentException('outcome must be up, down or not_checkable');
            }
            $results[] = new CheckResult((int) $state['idtarget'], $state['outcome'], $state['error'] ?? null, null,
                $state['status'] ?? null, ['total' => (int) ($state['ms_total'] ?? 0)], $state['cert_not_after'] ?? null,
                (string) $state['checked_at']);
        }
        (new StateStore())->upsertMany($results, StateStore::EXTERNAL);
    }

    /**
     * The registered outside sources, e.g. Pro: its name, whether it is licensed and working, when it last reached its
     * service, the page of its settings, whether it sends alerts for outages itself, and when its latest results
     * arrived. Entries without a name are dropped.
     *
     * @return list<array{name: string, active: bool, reachedAt: ?string, settingsUrl: ?string, alerts: bool, resultsAt: ?string}>
     *         reachedAt: ISO 8601 UTC or null (its last contact with its service, also a push of settings); settingsUrl:
     *         a relative address of this Matomo ("index.php?..."), else null; alerts: true only when the entry says so
     *         (it sends alerts for outages somewhere, e.g. by e-mail); resultsAt: ISO 8601 UTC, when it last wrote
     *         results through this seam, else null (none yet, or the entry does not say)
     */
    public static function sources(): array
    {
        $sources = [];
        try {
            /**
             * Lets a plugin that writes results checked from outside (FeinwerkUptimeMonitorPro) say that it is there.
             *
             * @param array &$sources append ['name' => string, 'active' => bool, 'reachedAt' => ?string (ISO 8601 UTC),
             *                        'settingsUrl' => ?string (relative, "index.php?module=..."), 'alerts' => bool (it
             *                        sends alerts for outages itself; optional, default false), 'resultsAt' => ?string
             *                        (ISO 8601 UTC, when it last wrote results; optional, default null)]
             */
            Piwik::postEvent(self::EVENT_SOURCES, [&$sources]);
        } catch (\Throwable $e) {
            return [];
        }

        $out = [];
        foreach ($sources as $source) {
            if (!is_array($source) || !isset($source['name']) || !is_scalar($source['name']) || (string) $source['name'] === '') {
                continue;
            }
            $reached = $source['reachedAt'] ?? null;
            $results = $source['resultsAt'] ?? null;
            $url = $source['settingsUrl'] ?? null;
            $out[] = [
                'name' => (string) $source['name'],
                'active' => !empty($source['active']),
                'reachedAt' => is_string($reached) && $reached !== '' ? $reached : null,
                // it becomes a link on the screens: only a page of this Matomo, never a script or another host
                'settingsUrl' => is_string($url) && preg_match('/^index\.php\?[^\s"\'<>\\\\]*$/D', $url) === 1 ? $url : null,
                'alerts' => ($source['alerts'] ?? false) === true,
                'resultsAt' => is_string($results) && $results !== '' ? $results : null,
            ];
        }

        return $out;
    }

    /**
     * Whether a source of sources() delivers results now: active, and it reached its service within ACTIVE_WITHIN
     * seconds, at most CLOCK_AHEAD seconds ahead of now (the same rule silences this plugin's Sentinel checks U01 and
     * U02).
     *
     * @param array{active?: bool, reachedAt?: ?string} $source an entry of sources()
     * @param int $now Unix time
     */
    public static function isActive(array $source, int $now): bool
    {
        $reached = isset($source['reachedAt']) && is_string($source['reachedAt']) ? strtotime($source['reachedAt']) : false;

        return !empty($source['active']) && $reached !== false && $now - $reached < self::ACTIVE_WITHIN
            && $reached - $now <= self::CLOCK_AHEAD;
    }

    /**
     * The first of these sources that delivers results now (isActive()), else null: the one rule for whether the
     * screens, getStatus, the admin overview and the Sentinel checks take results checked from outside into account.
     * For a caller that already holds sources(); activeSource() reads them itself.
     *
     * @param list<array> $sources entries of sources()
     * @param int $now Unix time
     * @return array{name: string, active: bool, reachedAt: ?string, settingsUrl: ?string, alerts: bool, resultsAt: ?string}|null
     */
    public static function activeOf(array $sources, int $now): ?array
    {
        foreach ($sources as $source) {
            if (is_array($source) && self::isActive($source, $now)) {
                return $source;
            }
        }

        return null;
    }

    /**
     * The first source of sources() that delivers results now (activeOf()), else null. Posts the sources event once;
     * call it once per request or report, never per target.
     *
     * @param int $now Unix time
     * @return array{name: string, active: bool, reachedAt: ?string, settingsUrl: ?string, alerts: bool, resultsAt: ?string}|null
     */
    public static function activeSource(int $now): ?array
    {
        return self::activeOf(self::sources(), $now);
    }

    /**
     * The extra data of a target as the runner resolves it, only the keys the seam gives out.
     *
     * @param array<string, int>|null $live the live revision per "idsite|idcontainer"; null when nothing is known
     */
    private static function extra(Target $target, ?array $live): array
    {
        $out = [];
        foreach (self::EXTRA_TEXT as $key) {
            if (isset($target->extra[$key]) && is_scalar($target->extra[$key])) {
                $out[$key] = (string) $target->extra[$key];
            }
        }
        if (isset($target->extra['revision']) && is_numeric($target->extra['revision'])) {
            $out['revision'] = (int) $target->extra['revision'];
        }
        if ($target->kind === Kind::CONTAINER && isset($out['idContainer']) && $live !== null) {
            $revision = $live[$target->idSite . '|' . $out['idContainer']] ?? null;
            unset($out['revision']);
            if ($revision !== null) {
                $out['revision'] = (int) $revision;
            }
        }

        return $out;
    }

    private static function external(array $row): array
    {
        if (($row['source'] ?? StateStore::EXTERNAL) !== StateStore::EXTERNAL) {
            throw new \InvalidArgumentException('ExternalResults writes source external only');
        }

        return ['source' => StateStore::EXTERNAL] + $row;
    }
}
