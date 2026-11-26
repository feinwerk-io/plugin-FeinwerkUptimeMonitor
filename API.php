<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor;

use Piwik\Common;
use Piwik\Option;
use Piwik\Piwik;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\Input\BadRequest;
use Piwik\Plugins\FeinwerkUptimeMonitor\Input\InvalidParameter;
use Piwik\Plugins\FeinwerkUptimeMonitor\Input\Params;
use Piwik\Plugins\FeinwerkUptimeMonitor\Report\UptimeReport;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\CheckRunner;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\DetectionJob;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\DefaultTargets;
use Piwik\Plugins\FeinwerkUptimeMonitor\External\ExternalResults;
use Piwik\Plugins\FeinwerkUptimeMonitor\Feedback\PluginFeedback;
use Piwik\Plugins\FeinwerkUptimeMonitor\Widgets\ScreenProps;
use Piwik\Plugin\Manager as PluginManager;
use Piwik\Site;
use Piwik\Version;

/**
 * Uptime of Matomo itself (interface, tracker endpoint, JavaScript tracker) and of the tracked websites (main URL,
 * Tag Manager containers, tracking proxy), checked from the Matomo server: status, uptime with coverage, response
 * times, outages, certificate expiry and the processing time of real tracking requests, plus the check targets.
 *
 * idSite 0 stands for the Matomo instance itself. Times are ISO 8601 in UTC, durations in seconds, response times in
 * milliseconds. Time without any check is "not measured" and never counts as up: uptime is up time divided by
 * measured time, and coverage says how much of the period was measured.
 *
 * @method static \Piwik\Plugins\FeinwerkUptimeMonitor\API getInstance()
 */
class API extends \Piwik\Plugin\API
{
    public const NOW_RATE_SECONDS = 60;
    public const MAX_WEB_TARGETS = 5;
    /** the hour strip of at most this many days (a year and a leap day): one cell per day */
    public const MAX_TIMELINE_DAYS = 366;

    /**
     * Current state of every check target of a website, or of Matomo itself with idSite 0: the latest result per
     * source (checked from the Matomo server, and from outside while another plugin delivers such results, see
     * getExternalSources), the certificate expiry and, for idSite 0, the processing time of real tracking requests in
     * the last hour.
     *
     * @param int $idSite website ID, or 0 for the Matomo instance (any user with view access to a website)
     * @return array {targets: list of {targetKey: string, kind: ui|tracker|js|web|container|proxy, url: string|null
     *               (Matomo's own addresses only for super users), urlSource: default|detected|manual, enabled: bool,
     *               lastCheckedAt: ISO time|null, serverRefuses: bool (the Matomo server never checks this address: an IP
     *               address outside what the setting "Allow private addresses" allows, a website's address on the
     *               server's own loopback, or localhost and names without a dot while private addresses are not allowed;
     *               it is not checkable from this server also before its first check, when states has no local yet; a
     *               name that leads to a private address shows only with its check), states: {local?: State, external?:
     *               State} (external only while a
     *               source of getExternalSources is active and reached its service within 2 hours; older results from
     *               outside are left out), certificate: {notAfter: Y-m-d, daysLeft: int, level:
     *               ok|warning|critical|expired}|null (the server's certificate, else the one from outside under the
     *               same condition)}, processing:
     *               {samples: int, p50Ms: int|null, p95Ms: int|null, maxMs: int|null, from: ISO time, to: ISO time}|null};
     *               State = {outcome: up|down|not_checkable, error: string|null (dns, connect, tls, timeout, blocked,
     *               protocol, proxy, http_status, content, redirect, maintenance, tracking_off, stale_container),
     *               note: protected|too_large|null (protected: behind a password or bot protection; too_large: a Tag
     *               Manager container larger than 4 MB, not read whole, so not checkable), httpStatus: int|null,
     *               responseMs: int|null, checkedAt: ISO time, stale: bool (older than two check intervals: the checks
     *               stopped; not current. From outside: older than 2 h 15 min, since such results arrive when the
     *               other plugin pulls them)}
     */
    public function getStatus($idSite)
    {
        $idSite = $this->viewableSite($idSite);
        $report = new UptimeReport();

        return [
            'targets' => $report->status($idSite, $idSite > 0 || Piwik::hasUserSuperUserAccess()),
            'processing' => $idSite === 0 ? $report->processingLastHour() : null,
        ];
    }

    /**
     * Uptime per check target and source over a Matomo period: uptime in percent of the measured time, coverage
     * (measured time in percent of the period, up to now), number of outages and response times.
     *
     * @param int $idSite website ID, or 0 for the Matomo instance
     * @param string $period day|week|month|year|range (Matomo's periods, in the website's timezone; UTC for idSite 0)
     * @param string $date a date (YYYY-MM-DD, today, yesterday) or for range "YYYY-MM-DD,YYYY-MM-DD"
     * @param string $source all|local|external; local = checked from the Matomo server, external = from outside (another plugin);
     *                       default all
     * @param int $timezoneOf only with idSite 0: a website ID whose timezone the period follows (view access needed);
     *                        default 0 = UTC
     * @return array list of {targetKey: string, kind: string, source: local|external, uptimePercent: float|null (null
     *               when nothing was measured; null for kind processing), coveragePercent: float, outages: int,
     *               samples: int, p50Ms: int|null, p95Ms: int|null, maxMs: int|null}; kind processing is the
     *               processing time of real tracking requests (p50Ms, p95Ms, maxMs only); periods up to 31 days are
     *               computed from hourly values (kept 90 days), longer ones and older ones from UTC days (kept 400
     *               days), whose percentiles are approximated from hourly values
     */
    public function getUptime($idSite, $period, $date, $source = 'all', $timezoneOf = 0)
    {
        $idSite = $this->viewableSite($idSite);
        $source = $this->oneOf('source', $source, UptimeReport::SOURCES);
        $report = new UptimeReport();

        return $report->uptime($idSite, $this->range($report, $idSite, $period, $date, $timezoneOf), $source);
    }

    /**
     * The hour strip of a website (idSite 0: Matomo itself) over a whole Matomo period, with a fixed axis: one cell per
     * hour for a day (and a range up to two days), per day in the website's timezone for a week, a month or a range up
     * to 31 days, per UTC day beyond. A cell sums the switched-on check targets of the group (see group): up when all
     * measured time was up, down when none was, partial between, none when nothing was measured, future after now.
     *
     * @param int $idSite website ID, or 0 for the Matomo instance
     * @param string $period day|week|month|year|range (Matomo's periods, in the website's timezone; UTC for idSite 0)
     * @param string $date a date (YYYY-MM-DD, today, yesterday) or for range "YYYY-MM-DD,YYYY-MM-DD"
     * @param string $source which results the cells sum: local (checked from the Matomo server), external (checked from
     *                       outside, by another plugin) or all (default): both added up, so an hour measured from both
     *                       sides counts its seconds twice (up to 7200 measured seconds per target and hour) and a cell
     *                       is up only when every side found every target up for all its measured time; firstMeasured
     *                       is then the first hour either side measured. The uptime page asks local and external apart
     *                       (one strip each)
     * @param int $timezoneOf only with idSite 0: a website ID whose timezone the period follows; default 0 = UTC
     * @param string $group which targets the strip sums: all (default) every switched-on target of idSite; matomo
     *                      Matomo's own addresses plus the website's Tag Manager containers (their file is served by
     *                      Matomo; not for anonymous viewers); website the website's addresses and tracking proxy
     *                      without its containers. With idSite 0 only all or matomo.
     * @return array {grain: hour|day, days: local|utc|null (with grain day: whether a cell is a day in the website's
     *               timezone or a UTC day), cells: list of {time: ISO time (start of the hour or day, UTC),
     *               measuredSeconds: int, upSeconds: int, state: up|down|partial|none|future}, firstMeasured: ISO time|null
     *               (the start of the first hour in which any of the strip's targets was measured, at any time, also
     *               after the period: a period before it reads "measurements start on"; once the hourly values are gone
     *               (90 days) the start of that UTC day; null when nothing was ever measured)}; at most 367 cells; a
     *               period longer than 366 days is refused with HTTP 400 naming 'period'
     */
    public function getTimeline($idSite, $period, $date, $source = 'all', $timezoneOf = 0, $group = 'all')
    {
        $idSite = $this->viewableSite($idSite);
        $source = $this->oneOf('source', $source, UptimeReport::SOURCES);
        $group = $this->oneOf('group', $group, $idSite === 0 ? ['all', 'matomo'] : UptimeReport::GROUPS);
        if ($group === 'matomo') {
            // Matomo's own health, as for idSite 0: never anonymous visitors of a public dashboard
            Piwik::checkUserIsNotAnonymous();
        }
        $report = new UptimeReport();
        // the whole period: the strip has a fixed axis, the hours or days after now are "future"
        $range = $this->range($report, $idSite, $period, $date, $timezoneOf, false);
        if ($range['to'] - $range['from'] > self::MAX_TIMELINE_DAYS * 86400) {
            throw $this->error(Piwik::translate('FeinwerkUptimeMonitor_ErrorPeriodTooLong', ['period', self::MAX_TIMELINE_DAYS]));
        }
        $zoneSite = $idSite > 0 ? $idSite : (int) $timezoneOf;
        $timezone = $zoneSite > 0 ? Site::getTimezoneFor($zoneSite) : 'UTC';

        return $report->timeline($idSite, $range, $source, $timezone, (string) $period, $group);
    }

    /**
     * Response time series of one check target over a Matomo period: per hour for periods up to 31 days while the
     * hourly values exist (90 days), else per UTC day.
     *
     * @param int $idSite website ID, or 0 for the Matomo instance
     * @param string $period day|week|month|year|range
     * @param string $date a date or for range "YYYY-MM-DD,YYYY-MM-DD"
     * @param string $targetKey a key from getTargets, e.g. "tracker", "web:1a2b3c4d" or "processing" (idSite 0: the
     *                          processing time of real tracking requests)
     * @param string $source all|local|external, default all
     * @param int $timezoneOf only with idSite 0: a website ID whose timezone the period follows; default 0 = UTC
     * @return array list of {time: ISO time (start of the hour or day), source: local|external, samples: int, p50Ms:
     *               int|null, p95Ms: int|null, maxMs: int|null, uptimePercent: float|null}; empty for Matomo's own
     *               targets before the first check run
     */
    public function getResponseTimes($idSite, $period, $date, $targetKey, $source = 'all', $timezoneOf = 0)
    {
        $idSite = $this->viewableSite($idSite);
        $source = $this->oneOf('source', $source, UptimeReport::SOURCES);
        $report = new UptimeReport();
        $range = $this->range($report, $idSite, $period, $date, $timezoneOf);
        $key = trim((string) $targetKey);
        if ($idSite === 0 && in_array($key, array_merge(Kind::INSTANCE, [Kind::PROCESSING]), true)
            && (new TargetStore())->get(0, $key) === null
        ) {
            // Matomo's own targets exist from the first check run (or the first sampled tracking request) on
            return [];
        }

        return $report->responseTimes($this->target($idSite, $key), $range, $source);
    }

    /**
     * Outages of a website's check targets (idSite 0: of Matomo's own targets, and the gaps in which Matomo itself
     * ran no checks) that overlap a Matomo period, newest first. Use durationInPeriodSeconds, not durationSeconds, to
     * add up the downtime of a period: an outage from 23:30 to 00:30 counts 30 minutes on each day. Outages of several
     * targets may overlap; each target counts its own.
     *
     * @param int $idSite website ID, or 0 for the Matomo instance
     * @param string $period day|week|month|year|range
     * @param string $date a date or for range "YYYY-MM-DD,YYYY-MM-DD"
     * @param string $state all|open|closed, default all
     * @param int $limit 1 to 1000, default 100
     * @param string $source all|local|external, default all
     * @param int $timezoneOf only with idSite 0: a website ID whose timezone the period follows; default 0 = UTC
     * @return array list of {idIncident: int, type: outage|gap, targetKey: string|null, kind: string|null, source:
     *               local|external, start: ISO time, end: ISO time|null (null while open), durationSeconds: int (the
     *               whole outage, until now while open), startInPeriod: ISO time (the later of start and the period's
     *               start), durationInPeriodSeconds: int (the seconds from startInPeriod to the earliest of end, the
     *               period's end and now; 0 when the outage only touches the period), open: bool, cause: string|null
     *               (the error of the first failed check), detail: string|null (e.g. "HTTP 500"), failedChecks: int}
     */
    public function getIncidents($idSite, $period, $date, $state = 'all', $limit = 100, $source = 'all', $timezoneOf = 0)
    {
        $idSite = $this->viewableSite($idSite);
        $state = $this->oneOf('state', $state, ['all', 'open', 'closed']);
        $limit = $this->wholeNumber('limit', $limit, 1, 1000);
        $source = $this->oneOf('source', $source, UptimeReport::SOURCES);
        $report = new UptimeReport();

        return $report->incidents($idSite, $this->range($report, $idSite, $period, $date, $timezoneOf), $state, $limit, $source);
    }

    /**
     * TLS certificates of a website's https targets (idSite 0: of Matomo's own addresses) with their expiry. Warning
     * from the super user setting (default 14 days before), critical from 3 days before. As read from the Matomo server,
     * else from outside while another plugin delivers such results (see getStatus).
     *
     * @param int $idSite website ID, or 0 for the Matomo instance
     * @return array list of {targetKey: string, host: string|null (null for Matomo's own addresses unless super user),
     *               notAfter: Y-m-d, daysLeft: int, level: ok|warning|critical|expired}, soonest expiry first
     */
    public function getCertificates($idSite)
    {
        $idSite = $this->viewableSite($idSite);
        $report = new UptimeReport();
        $out = [];
        // Matomo's own addresses only for super users (spec 5.5)
        $withHosts = $idSite > 0 || Piwik::hasUserSuperUserAccess();
        foreach ($report->status($idSite, true) as $row) {
            if ($row['certificate'] === null) {
                continue;
            }
            $host = $withHosts ? (string) parse_url((string) $row['url'], PHP_URL_HOST) : null;
            $out[] = ['targetKey' => $row['targetKey'], 'host' => $host] + $row['certificate'];
        }
        usort($out, static fn(array $a, array $b): int => $a['daysLeft'] <=> $b['daysLeft']);

        return $out;
    }

    /**
     * The check targets of a website (idSite 0: Matomo's interface, tracker endpoint and JavaScript tracker) and the
     * addresses found on the website that were only suggested, not adopted.
     *
     * @param int $idSite website ID, or 0 for the Matomo instance (URLs of idSite 0 only for super users)
     * @return array {targets: list of {targetKey: string, kind: string, url: string|null, urlSource:
     *               default|detected|manual, enabled: bool, lastCheckedAt: ISO time|null}, suggestions: list of
     *               {idSite: int, key: string, kind: string, url: string}}
     */
    public function getTargets($idSite)
    {
        $idSite = $this->viewableSite($idSite);
        $withUrls = $idSite > 0 || Piwik::hasUserSuperUserAccess();
        $targets = [];
        foreach ((new TargetStore())->forSite($idSite) as $target) {
            $targets[] = self::targetRow($target, $withUrls);
        }

        // Matomo's own addresses, also found ones, only for super users (spec 5.5)
        return ['targets' => $targets, 'suggestions' => $withUrls ? self::suggestionsFor($idSite) : []];
    }

    /**
     * Adds a check target by hand: another address of the website or its tracking proxy (admin of the website), or
     * one of Matomo's own addresses (idSite 0, super users), which replaces the default.
     *
     * @param int $idSite website ID (admin access), or 0 for the Matomo instance (super user)
     * @param string $kind web|proxy for a website (at most 5 web targets per website), ui|tracker|js for idSite 0
     * @param string $url http:// or https:// address without user name or password, at most 2048 characters
     * @return array the target: {targetKey: string, kind: string, url: string, urlSource: manual, enabled: bool,
     *               lastCheckedAt: null}
     */
    public function addTarget($idSite, $kind, $url)
    {
        $idSite = $this->writableSite($idSite);
        $kind = $this->oneOf('kind', $kind, $idSite === 0 ? Kind::INSTANCE : [Kind::WEB, Kind::PROXY]);
        $url = $this->url($url, $kind);
        $store = new TargetStore();
        $key = $kind === Kind::WEB ? DefaultTargets::webKey($url) : $kind;
        if ($kind === Kind::WEB && $store->get($idSite, $key) === null) {
            $webTargets = array_filter($store->forSite($idSite), static fn(Target $t): bool => $t->kind === Kind::WEB);
            if (count($webTargets) >= self::MAX_WEB_TARGETS) {
                throw $this->error(Piwik::translate('FeinwerkUptimeMonitor_ErrorTargetLimit', [self::MAX_WEB_TARGETS]));
            }
        }
        $existing = $store->get($idSite, $key);

        return self::targetRow($store->setUrl($idSite, $key, $kind, $url, TargetStore::SOURCE_MANUAL, $existing->extra ?? self::extra($idSite)), true);
    }

    /**
     * Changes the address of a check target or switches it off and on. A changed address counts as set by hand and
     * is never replaced by Matomo's default or by detection.
     *
     * @param int $idSite website ID (admin access), or 0 for the Matomo instance (super user)
     * @param string $targetKey a key from getTargets
     * @param string $url the new http(s) address; empty: unchanged
     * @param string $enabled 1 (check it), 0 (do not check it); empty: unchanged
     * @return array the target: {targetKey: string, kind: string, url: string, urlSource: default|detected|manual,
     *               enabled: bool, lastCheckedAt: ISO time|null}
     */
    public function updateTarget($idSite, $targetKey, $url = '', $enabled = '')
    {
        $idSite = $this->writableSite($idSite);
        $target = $this->target($idSite, $targetKey);
        $store = new TargetStore();
        if (trim((string) $url) !== '') {
            $target = $store->setUrl($idSite, $target->key, $target->kind, $this->url($url, $target->kind), TargetStore::SOURCE_MANUAL, $target->extra);
        }
        if (trim((string) $enabled) !== '') {
            $target = $store->setEnabled($idSite, $target->key, $this->flag('enabled', $enabled));
        }

        return self::targetRow($target, true);
    }

    /**
     * Removes a check target that was added by hand or found on the website. For a changed default (e.g. a renamed
     * tracker) Matomo's default comes back with the next check run. Defaults themselves cannot be removed: switch them off
     * with updateTarget and enabled=0.
     *
     * @param int $idSite website ID (admin access), or 0 for the Matomo instance (super user)
     * @param string $targetKey a key from getTargets
     * @return array {deleted: true, targetKey: string}
     */
    public function deleteTarget($idSite, $targetKey)
    {
        $idSite = $this->writableSite($idSite);
        $target = $this->target($idSite, $targetKey);
        if ($target->urlSource === TargetStore::SOURCE_DEFAULT) {
            throw $this->error(Piwik::translate('FeinwerkUptimeMonitor_ErrorDefaultTarget', [$target->key]));
        }
        (new TargetStore())->delete($idSite, $target->key);

        return ['deleted' => true, 'targetKey' => $target->key];
    }

    /**
     * Reads the website's main page now and says which tracker, tracking proxy and Tag Manager containers it uses.
     * Addresses on Matomo's host or the website's own hosts can be adopted; others are only suggested. Without apply,
     * nothing is changed (dry run). The daily check does the same by itself.
     *
     * @param int $idSite website ID (admin access)
     * @param int $apply 0 (default): only show; 1: adopt and store the suggestions
     * @return array {found: {trackerUrl: string|null, jsUrl: string|null, containerUrls: {id: url}}, adopt: list of
     *               {idSite: int, key: string, kind: string, url: string}, suggest: list of the same, applied: bool}
     */
    public function detectTargets($idSite, $apply = 0)
    {
        $idSite = $this->writableSite($idSite, false);
        $apply = $this->flag('apply', $apply);
        $main = null;
        foreach ((new TargetStore())->forSite($idSite) as $target) {
            if ($target->kind === Kind::WEB && $target->urlSource === TargetStore::SOURCE_DEFAULT) {
                $main = $target;
            }
        }
        if ($main === null) {
            throw $this->error(Piwik::translate('FeinwerkUptimeMonitor_ErrorNoMainUrl'));
        }

        $job = new DetectionJob(new TargetStore());
        $response = CheckRunner::prober(CheckRunner::guard())->probeAll([$main], microtime(true) + 15)[$main->id] ?? null;
        $found = $job->read($response !== null ? $response->body : '', $response !== null ? $response->finalUrl : $main->url);
        $matomoHost = (string) ($main->extra['matomoHost'] ?? '');
        $plan = $job->plan([$idSite => ['url' => $main->url, 'found' => $found]], $matomoHost, [$idSite => self::siteHosts($idSite)]);
        if ($apply) {
            $job->apply($plan, [$idSite]);
        }
        $strip = static fn(array $c): array => ['idSite' => $c['idSite'], 'key' => $c['key'], 'kind' => $c['kind'], 'url' => $c['url']];
        // Matomo's own addresses are for super users only, also as suggestions
        $visible = static fn(array $c): bool => $c['idSite'] > 0 || Piwik::hasUserSuperUserAccess();

        return [
            'found' => ['trackerUrl' => $found->trackerUrl, 'jsUrl' => $found->jsUrl, 'containerUrls' => $found->containerUrls],
            'adopt' => array_map($strip, $plan['adopt']),
            'suggest' => array_values(array_map($strip, array_filter($plan['suggested'][$idSite] ?? [], $visible))),
            'applied' => $apply,
        ];
    }

    /**
     * Checks a website's targets (idSite 0: Matomo's own) right now and stores the results; sends no alert. At most
     * once a minute per website; answers HTTP 429 sooner.
     *
     * @param int $idSite website ID (admin access), or 0 for the Matomo instance (super user)
     * @return array {locked: bool (another check run is going; nothing done), results: list of {targetKey: string,
     *               outcome: up|down|not_checkable, error: string|null, note: protected|too_large|null, httpStatus:
     *               int|null, responseMs: int}}
     */
    public function checkNow($idSite)
    {
        $idSite = $this->writableSite($idSite);
        $option = 'fw_uptimemonitor_now_' . $idSite;
        $last = (int) Option::get($option);
        $wait = $last + self::NOW_RATE_SECONDS - time();
        if ($wait > 0) {
            throw $this->error(Piwik::translate('FeinwerkUptimeMonitor_ErrorCheckNowTooSoon', [$wait]), null, 429);
        }
        Option::set($option, (string) time());

        $report = CheckRunner::create(25)->run('now', $idSite);
        // after the run: on the very first one, the run itself creates the default targets
        $keys = [];
        foreach ((new TargetStore())->forSite($idSite) as $target) {
            $keys[$target->id] = $target->key;
        }
        $results = [];
        foreach ($report->results as $result) {
            $results[] = [
                'targetKey' => $keys[$result->idTarget] ?? (string) $result->idTarget,
                'outcome' => $result->outcome,
                'error' => $result->error,
                'note' => $result->note,
                'httpStatus' => $result->status,
                'responseMs' => (int) ($result->timings['total'] ?? 0),
            ];
        }

        return ['locked' => $report->locked, 'results' => $results];
    }

    /**
     * Overview for super users: one row for Matomo (idSite 0) and one per website with check targets, saying how many
     * of its switched-on targets are up, down or cannot be checked, and how many are switched off. Tag Manager
     * containers count in Matomo's row: their file is served by the Matomo server. Checked from the Matomo server;
     * while another plugin delivers results checked from outside (an active source of getExternalSources), each target
     * combines both sides as Visitors > Uptime does: down when either side finds it down, up when one side reaches it
     * and none finds it down, not checkable only when no side can check it, stale only when no side has a current
     * result. A result from outside that cannot check a target (e.g. a private address) counts for nothing: the
     * server's result alone gives the target's state and last check.
     *
     * @return array list of {idSite: int (0 = Matomo), name: string, timezone: string (the website's, Matomo's names
     *               such as Europe/Berlin or UTC+2; UTC for Matomo), targets: int (switched on), off: int (switched
     *               off), up: int, down: int, notCheckable: int, stale: int (results older than two check intervals: the
     *               checks stopped; counted neither as up nor as down; from outside older than 2 h 15 min), each
     *               switched-on target counted in at most one of up, down, notCheckable and stale (in none before its
     *               first check, except an address the server never checks: notCheckable at once, see serverRefuses of
     *               getStatus), lastCheckedAt: ISO time|null (the newest result of the row, of either side),
     *               certificateDaysLeft: int|null (soonest expiry, per target the server's certificate, else the one
     *               from outside; negative when expired), certificateLevel:
     *               ok|warning|critical|expired|null (the level of that soonest certificate: warning from the super user
     *               setting, by default 14 days before, critical from 3 days before), containersDown: list of
     *               {idSite: int, name: string} (in Matomo's row: the websites whose Tag Manager container is not
     *               reachable; empty in the other rows), notCheckableOutside: int (how many of notCheckable cannot be
     *               checked from outside either, by the current result of an active source of getExternalSources; 0
     *               without one: then they cannot be checked from the Matomo server)}
     */
    public function getSitesOverview()
    {
        Piwik::checkUserHasSuperUserAccess();

        return (new UptimeReport())->overview();
    }

    /**
     * One thumbs vote under the uptime page (Feinwerk feedback kit). The Matomo server sends it to Feinwerk, never the
     * browser; nothing about the user, the website or its visitors. Off with [FeinwerkUptimeMonitor] feedback = 0.
     *
     * @param int $idSite the website the page shows (view access needed; not sent)
     * @param string $topic the question: only "page"
     * @param string $vote "up" or "down"
     * @return array {sent: bool}: false when switched off, in test mode, or within 10 seconds of the same vote
     */
    public function sendFeedback($idSite, $topic, $vote)
    {
        Piwik::checkUserIsNotAnonymous();
        $idSite = $this->viewableSite($idSite);
        $topic = $this->oneOf('topic', $topic, PluginFeedback::TOPICS);
        $vote = $this->oneOf('vote', $vote, ['up', 'down']);
        if (!PluginFeedback::enabled()) {
            return ['sent' => false];
        }
        $payload = PluginFeedback::payload(
            $topic,
            $vote,
            (string) PluginManager::getInstance()->getLoadedPlugin(PluginFeedback::PLUGIN)->getVersion(),
            Version::VERSION,
            (string) ($_SERVER['HTTP_USER_AGENT'] ?? ''),
            ScreenProps::language()
        );
        // one vote per user and question in 10 seconds, at most PluginFeedback::SERVER_CAP a minute per server
        $key = PluginFeedback::throttleOption(Piwik::getCurrentUserLogin(), $payload['topic']);
        if (time() - (int) Option::get($key) < 10) {
            return ['sent' => false];
        }
        $server = PluginFeedback::countVote((string) Option::get(PluginFeedback::SERVER_OPTION), time());
        if ($server === null) {
            return ['sent' => false];
        }
        Option::set($key, (string) time());
        Option::set(PluginFeedback::SERVER_OPTION, $server);

        return ['sent' => (new PluginFeedback())->send($payload)];
    }

    /**
     * Whether results checked from outside, reported by another plugin, are coming in (empty without such a plugin).
     * A source counts as delivering when active is true and reachedAt lies within the last 2 hours; only then do
     * getStatus, getCertificates and getSitesOverview include its results.
     *
     * @return array list of {name: string, active: bool (licensed and delivering), reachedAt: ISO time|null (when it
     *               last reached its service, also to send settings), settingsUrl: string|null (its settings page,
     *               relative to Matomo), alerts: bool (it sends alerts for outages itself; false when it does not say),
     *               resultsAt: ISO time|null (when its latest results arrived; null before the first ones or when it
     *               does not say)}
     */
    public function getExternalSources()
    {
        Piwik::checkUserHasSomeViewAccess();

        return ExternalResults::sources();
    }

    private function viewableSite($idSite): int
    {
        $idSite = $this->wholeNumber('idSite', $idSite, 0, PHP_INT_MAX);
        if ($idSite === 0) {
            // Matomo's own health: logged-in users with view access, never anonymous visitors of a public dashboard
            Piwik::checkUserIsNotAnonymous();
            Piwik::checkUserHasSomeViewAccess();
            return 0;
        }
        Piwik::checkUserHasViewAccess($idSite);
        $this->existingSite($idSite);

        return $idSite;
    }

    private function writableSite($idSite, bool $instanceAllowed = true): int
    {
        $idSite = $this->wholeNumber('idSite', $idSite, $instanceAllowed ? 0 : 1, PHP_INT_MAX);
        if ($idSite === 0) {
            Piwik::checkUserHasSuperUserAccess();
            return 0;
        }
        Piwik::checkUserHasAdminAccess($idSite);
        $this->existingSite($idSite);

        return $idSite;
    }

    private function existingSite(int $idSite): void
    {
        try {
            new Site($idSite);
        } catch (\Throwable $e) {
            throw $this->error(Piwik::translate('FeinwerkUptimeMonitor_ErrorSiteUnknown', [$idSite]));
        }
    }

    private function target(int $idSite, $targetKey): Target
    {
        $key = trim((string) $targetKey);
        $target = (new TargetStore())->get($idSite, $key);
        if ($target === null || ($target->kind === Kind::PROCESSING && $idSite !== 0)) {
            throw $this->error(Piwik::translate('FeinwerkUptimeMonitor_ErrorTargetUnknown', [$key]));
        }

        return $target;
    }

    private function range(UptimeReport $report, int $idSite, $period, $date, $timezoneOf = 0, bool $cutAtNow = true): array
    {
        $period = $this->oneOf('period', $period, UptimeReport::PERIODS);
        $timezoneOf = $idSite === 0 ? $this->wholeNumber('timezoneOf', $timezoneOf, 0, PHP_INT_MAX) : 0;
        if ($timezoneOf > 0) {
            Piwik::checkUserHasViewAccess($timezoneOf);
            $this->existingSite($timezoneOf);
        }
        try {
            return $report->range($idSite, $period, trim((string) $date), $timezoneOf, $cutAtNow);
        } catch (\Throwable $e) {
            throw $this->error(Piwik::translate('FeinwerkUptimeMonitor_ErrorParameterNotAllowed',
                ['date', trim((string) $date), 'YYYY-MM-DD, today, yesterday, YYYY-MM-DD,YYYY-MM-DD']));
        }
    }

    private function oneOf(string $name, $value, array $allowed): string
    {
        try {
            return Params::oneOf($name, $value, $allowed);
        } catch (InvalidParameter $e) {
            throw $this->badParameter($e);
        }
    }

    private function wholeNumber(string $name, $value, int $min, int $max): int
    {
        try {
            return Params::wholeNumber($name, $value, $min, $max);
        } catch (InvalidParameter $e) {
            throw $this->badParameter($e);
        }
    }

    private function flag(string $name, $value): bool
    {
        try {
            return Params::flag($name, $value);
        } catch (InvalidParameter $e) {
            throw $this->badParameter($e);
        }
    }

    private function url($value, string $kind): string
    {
        try {
            return in_array($kind, [Kind::TRACKER, Kind::JS, Kind::PROXY, Kind::CONTAINER], true)
                ? Params::bareUrl('url', $value)
                : Params::url('url', $value);
        } catch (InvalidParameter $e) {
            throw $this->badParameter($e);
        }
    }

    private function badParameter(InvalidParameter $e): \Exception
    {
        $message = $e->allowed !== []
            ? Piwik::translate('FeinwerkUptimeMonitor_ErrorParameterNotAllowed', [$e->parameter, $e->value, implode(', ', $e->allowed)])
            : Piwik::translate('FeinwerkUptimeMonitor_ErrorParameterRange', [$e->parameter, $e->value, (string) $e->min, (string) $e->max]);

        return $this->error($message, $e);
    }

    /**
     * HTTP 400 with the message for scripts and AI clients. Matomo's own Ajax calls (force_api_session=1) keep
     * HTTP 200: Matomo 5.0 to 6.0 replace the message of any error status there with "Something went wrong".
     */
    private function error(string $message, ?\Throwable $previous = null, int $code = 400): \Exception
    {
        return Common::getRequestVar('force_api_session', 0, 'int') === 1
            ? new \Exception($message, 0, $previous)
            : new BadRequest($message, $code, $previous);
    }

    /**
     * Suggestions found on websites: a website's own (idSite > 0), or Matomo's from every website (idSite 0, super
     * users), without duplicates.
     */
    private static function suggestionsFor(int $idSite): array
    {
        $out = [];
        foreach (DetectionJob::suggestions() as $fromSite => $list) {
            foreach ((array) $list as $suggestion) {
                $for = (int) ($suggestion['idSite'] ?? -1);
                if ($for !== $idSite || ($idSite > 0 && (int) $fromSite !== $idSite)) {
                    continue;
                }
                $out[$suggestion['key'] . '|' . $suggestion['url']] = [
                    'idSite' => $for, 'key' => (string) $suggestion['key'], 'kind' => (string) $suggestion['kind'], 'url' => (string) $suggestion['url'],
                ];
            }
        }

        return array_values($out);
    }

    private static function targetRow(Target $target, bool $withUrl): array
    {
        return [
            'targetKey' => $target->key,
            'kind' => $target->kind,
            'url' => $withUrl ? $target->url : null,
            'urlSource' => $target->urlSource,
            'enabled' => $target->enabled,
            'lastCheckedAt' => $target->lastCheckedAt !== null ? UptimeReport::iso((int) strtotime($target->lastCheckedAt . ' UTC')) : null,
        ];
    }

    private static function extra(int $idSite): array
    {
        $ui = (new TargetStore())->get(0, Kind::UI);

        return ['matomoHost' => (string) ($ui->extra['matomoHost'] ?? '')];
    }

    /**
     * @return string[]
     */
    private static function siteHosts(int $idSite): array
    {
        $hosts = [];
        foreach (\Piwik\Plugins\SitesManager\API::getInstance()->getSiteUrlsFromId($idSite) as $url) {
            $host = strtolower((string) parse_url((string) $url, PHP_URL_HOST));
            if ($host !== '') {
                $hosts[] = $host;
            }
        }

        return $hosts;
    }
}
