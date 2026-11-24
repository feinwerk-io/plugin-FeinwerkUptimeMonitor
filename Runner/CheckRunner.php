<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Runner;

use Piwik\Config;
use Piwik\Option;
use Piwik\Plugin\Manager;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\ProbeResponse;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\ResponseClassifier;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\AddressGuard;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\CertificateReader;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Prober;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\CheckStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\IncidentStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Retention;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\RollupStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\SystemSettings;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\DefaultTargets;
use Piwik\Plugins\SitesManager\Model as SitesModel;

/**
 * One run of the checks (spec 6.2 to 6.4), used by the hourly task, the console command and "check now": sync the
 * default targets, probe the due ones within the time budget (least recently checked first), repeat failures once
 * after 5 seconds, store results, states and outages, note a gap after a long pause, roll up the touched hours, and
 * once a day detect targets, roll up days and delete old rows.
 */
final class CheckRunner
{
    public const DEFAULT_BUDGET = 60;
    public const LOCK_MARGIN = 120;
    public const RETRY_DELAY = 5;
    /** quick runs (browser-triggered tasks) still retry once, after a short pause */
    public const QUICK_RETRY_DELAY = 1;
    public const OPTION_ROLLED_DAY = 'fw_uptimemonitor_rolled_day';
    /** missed days are rolled up later, as far back as the raw checks are kept */
    private const MAX_CATCH_UP_DAYS = 13;
    public const GAP_THRESHOLD = 7200;
    public const OPTION_DAILY = 'fw_uptimemonitor_daily_at';
    public const OPTION_SYNCED = 'fw_uptimemonitor_synced_at';
    /** budget when Matomo's scheduled tasks may run inside a visitor's tracking request (browser-triggered archiving) */
    public const QUICK_BUDGET = 15;
    private const CERT_FALLBACKS_PER_RUN = 3;

    /**
     * @param \Closure(): float $clock microtime(true)
     * @param \Closure(int): void $sleep
     */
    public function __construct(
        private TargetStore $targets,
        private CheckStore $checks,
        private StateStore $states,
        private IncidentStore $incidents,
        private RollupStore $rollups,
        private Prober $prober,
        private ResponseClassifier $classifier,
        private DefaultTargets $defaults,
        private DetectionJob $detection,
        private Retention $retention,
        private IntervalTracker $interval,
        private ?RunLock $lock,
        private \Closure $clock,
        private \Closure $sleep,
        private int $budget = self::DEFAULT_BUDGET,
        private ?AddressGuard $guard = null,
        private int $retryDelay = self::RETRY_DELAY
    ) {
    }

    /**
     * Wires the runner from Matomo's settings and config.
     */
    /**
     * @param bool $quick a short run without the retry pause (browser-triggered scheduled tasks, which a visitor's
     *                    tracking request may wait for)
     */
    public static function create(?int $budget = null, bool $quick = false): self
    {
        $settings = new SystemSettings();
        $section = Config::getInstance()->FeinwerkUptimeMonitor;
        $guard = self::guard($settings);
        $targets = new TargetStore();

        return new self(
            $targets,
            new CheckStore(),
            new StateStore(),
            new IncidentStore(),
            new RollupStore(),
            self::prober($guard),
            new ResponseClassifier(),
            new DefaultTargets((string) $settings->trackerBaseUrl->getValue(), (string) $settings->loginHost->getValue()),
            new DetectionJob($targets),
            new Retention(),
            new IntervalTracker(),
            new RunLock(),
            static fn(): float => microtime(true),
            static function (int $seconds): void {
                sleep($seconds);
            },
            $quick ? self::QUICK_BUDGET
                : ($budget ?? max(10, (int) (is_array($section) ? ($section['run_budget_seconds'] ?? self::DEFAULT_BUDGET) : self::DEFAULT_BUDGET))),
            $guard,
            $quick ? self::QUICK_RETRY_DELAY : self::RETRY_DELAY
        );
    }

    /**
     * The guard from the settings: "Allow private addresses", and the config switch allowLoopbackForWebsites (websites
     * hosted on the Matomo server itself; off by default, because site admins could then probe the server).
     */
    public static function guard(?SystemSettings $settings = null): AddressGuard
    {
        $settings ??= new SystemSettings();
        $section = Config::getInstance()->FeinwerkUptimeMonitor;
        $allowPrivate = (bool) $settings->allowPrivate->getValue();
        $loopback = $allowPrivate && is_array($section) && !empty($section['allowLoopbackForWebsites']);

        return new AddressGuard($allowPrivate, null, $loopback);
    }

    /**
     * The prober with Matomo's [proxy] settings and CA bundle.
     */
    public static function prober(AddressGuard $guard): Prober
    {
        $proxy = Config::getInstance()->proxy;
        // like Matomo's own requests: [General] custom_cacert_pem when set (a TLS-inspecting proxy, an internal CA);
        // otherwise the server's own trust store
        $general = Config::getInstance()->General;
        $caInfo = is_array($general) && !empty($general['custom_cacert_pem']) ? (string) $general['custom_cacert_pem'] : null;

        return new Prober($guard, is_array($proxy) ? $proxy : [], self::userAgent(), 5000, 10000, 8, $caInfo);
    }

    /**
     * The User-Agent of every check: names the plugin and contains "Bot", so that Matomo's bot detection on a website
     * with server-side tracking does not count it as a visit.
     */
    public static function userAgent(): string
    {
        $version = '5';
        try {
            $version = (string) Manager::getInstance()->getLoadedPlugin('FeinwerkUptimeMonitor')->getVersion();
        } catch (\Throwable $e) {
            // keep the generic version
        }

        return 'Mozilla/5.0 (compatible; FeinwerkUptimeBot/' . $version . '; +https://plugins.feinwerk.io/en/plugins/FeinwerkUptimeMonitor)';
    }

    public function budget(): int
    {
        return $this->budget;
    }

    /**
     * @param string $trigger task|command|now
     * @param int|null $onlyIdSite "check now" for one website (0: the Matomo targets); no daily work then
     */
    public function run(string $trigger, ?int $onlyIdSite = null): RunReport
    {
        if ($this->lock !== null && !$this->lock->acquire($this->budget + self::LOCK_MARGIN)) {
            return new RunReport(0, 0, true);
        }
        try {
            return $this->runLocked($trigger, $onlyIdSite);
        } finally {
            if ($this->lock !== null) {
                $this->lock->release();
            }
        }
    }

    private function runLocked(string $trigger, ?int $onlyIdSite): RunReport
    {
        $start = ($this->clock)();
        $deadline = $start + $this->budget;
        $nowTs = (int) $start;
        $checkedAt = gmdate('Y-m-d H:i:s', $nowTs);
        $previous = $this->checks->lastCheckAt();
        $interval = $this->interval->interval($nowTs);

        // Matomo's websites and containers change rarely: sync at most hourly, and for "check now" of a website that has
        // no targets yet
        $synced = (int) Option::get(self::OPTION_SYNCED);
        if ($nowTs - $synced >= 3600 || $synced > $nowTs
            || ($onlyIdSite !== null && $this->targets->forSite($onlyIdSite) === [])
        ) {
            $this->targets->syncDefaults($this->defaults->specs());
            Option::set(self::OPTION_SYNCED, (string) $nowTs);
        }
        $due = $this->targets->due();
        if ($onlyIdSite !== null) {
            $due = array_values(array_filter($due, static fn(Target $t): bool => $t->idSite === $onlyIdSite));
        }
        $due = $this->withLiveRevisions($due);
        $byId = [];
        foreach ($due as $target) {
            $byId[$target->id] = $target;
        }

        // classify each result as it arrives and keep no bodies (memory); on the daily run, read the main pages of
        // the websites for the detection right away and keep only what was found
        $detect = $onlyIdSite === null && Option::get(self::OPTION_DAILY) !== gmdate('Y-m-d', $nowTs);
        $results = [];
        $pages = [];
        $consume = function (Target $target, ProbeResponse $response) use (&$results, &$pages, $detect, $checkedAt): void {
            $results[$target->id] = $this->classifier->classify($target, $response, $checkedAt);
            if ($detect && $target->kind === Kind::WEB && $target->urlSource === TargetStore::SOURCE_DEFAULT
                && $response->status !== null && $response->status < 400 && $response->body !== ''
            ) {
                $pages[$target->idSite] = ['url' => $response->finalUrl, 'found' => $this->detection->read($response->body, $response->finalUrl)];
            }
        };
        // a slow batch (DNS, timeouts) must not let the lock expire while the run goes on
        $keepLock = function (): void {
            if ($this->lock !== null) {
                $this->lock->refresh($this->budget + self::LOCK_MARGIN);
            }
        };
        $this->prober->probeAll($due, $deadline, $consume, $keepLock);

        $failed = array_values(array_filter($due, static fn(Target $t): bool => isset($results[$t->id]) && $results[$t->id]->outcome === Outcome::DOWN));
        if ($failed && ($this->clock)() + $this->retryDelay < $deadline) {
            ($this->sleep)($this->retryDelay);
            $this->prober->probeAll($failed, $deadline, $consume, $keepLock);
        }
        $results = $this->withCertificateFallback($results, $byId, $deadline);

        $list = array_values($results);
        $this->checks->insertMany($list);
        $this->states->upsertMany($list, StateStore::LOCAL);
        $this->targets->markChecked($list);
        $this->incidents->apply($list);

        if ($previous !== null) {
            $previousTs = (int) strtotime($previous . ' UTC');
            if ($nowTs - $previousTs > max(self::GAP_THRESHOLD, 2 * $interval)) {
                $this->incidents->recordGap(gmdate('Y-m-d H:i:s', $previousTs + 2 * $interval), $checkedAt);
            }
        }

        $hour = intdiv($nowTs, 3600) * 3600;
        $processing = $this->targets->processingTargetId();
        $this->rollups->rollHours(gmdate('Y-m-d H:i:s', $hour - 3600), gmdate('Y-m-d H:i:s', $hour + 3600), $interval, $processing);

        if ($onlyIdSite === null) {
            $this->daily($nowTs, $interval, $processing, $pages, $byId);
        }

        return new RunReport(count($results), count($due) - count($results), false, $list);
    }

    /**
     * @param array<int, CheckResult> $results
     * @param array<int, Target> $byId
     * @return array<int, CheckResult>
     */
    private function withCertificateFallback(array $results, array $byId, float $deadline): array
    {
        if ($this->guard === null) {
            return $results;
        }
        $left = self::CERT_FALLBACKS_PER_RUN;
        foreach ($results as $id => $result) {
            if ($left <= 0 || ($this->clock)() + 6 > $deadline) {
                break;
            }
            $url = $byId[$id]->url;
            // also for a broken certificate (expired, self-signed): exactly then its date matters
            $tlsFailed = $result->error === Outcome::TLS;
            if ($result->certNotAfter !== null || ($result->outcome !== Outcome::UP && !$tlsFailed)
                || strncasecmp($url, 'https:', 6) !== 0 || $this->prober->usesProxyFor((string) parse_url($url, PHP_URL_HOST))
            ) {
                continue;
            }
            $left--;
            $decision = $this->guard->check($url, $byId[$id]->isInstanceAddress());
            if (!$decision->allowed || $decision->ip === null) {
                continue;
            }
            $date = CertificateReader::fromHandshake($decision->host, $decision->ip, $decision->port, min(5.0, max(1.0, $deadline - ($this->clock)())));
            if ($date !== null) {
                $results[$id] = new CheckResult($result->idTarget, $result->outcome, $result->error, $result->note,
                    $result->status, $result->timings, $date, $result->checkedAt);
            }
        }

        return $results;
    }

    /**
     * Container targets get the revision that is live now (one query per run): a publish or rollback in Tag Manager
     * rewrites the file at once, the hourly sync would compare with the old one. A detected container that is no longer
     * published is retired; one set by hand is checked by its id only; defaults are retired by the hourly sync.
     *
     * @param Target[] $due
     * @return Target[]
     */
    private function withLiveRevisions(array $due): array
    {
        $containers = array_filter($due, static fn(Target $t): bool => $t->kind === Kind::CONTAINER && isset($t->extra['idContainer']));
        if ($containers === []) {
            return $due;
        }
        $live = $this->defaults->containers()->liveRevisions();
        if ($live === null) {
            return $due;
        }
        $out = [];
        $retire = [];
        foreach ($due as $target) {
            if ($target->kind !== Kind::CONTAINER || !isset($target->extra['idContainer'])) {
                $out[] = $target;
                continue;
            }
            $revision = $live[$target->idSite . '|' . $target->extra['idContainer']] ?? null;
            if ($revision !== null) {
                $out[] = $target->withExtra(['revision' => $revision] + $target->extra);
            } elseif ($target->urlSource === TargetStore::SOURCE_DETECTED) {
                $retire[] = $target->id;
            } else {
                $extra = $target->extra;
                unset($extra['revision']);
                $out[] = $target->withExtra($extra);
            }
        }
        $this->targets->retire($retire);

        return $out;
    }

    /**
     * @param array<int, array{url: string, found: \Piwik\Plugins\FeinwerkUptimeMonitor\Targets\DetectedTargets}> $pages
     * @param array<int, Target> $byId
     */
    private function daily(int $nowTs, int $interval, int $processing, array $pages, array $byId): void
    {
        $today = gmdate('Y-m-d', $nowTs);
        if (Option::get(self::OPTION_DAILY) === $today) {
            return;
        }
        // every day since the last one rolled up (a day without any run is not lost), at most as far back as raw checks
        $rolled = (string) Option::get(self::OPTION_ROLLED_DAY);
        $first = gmdate('Y-m-d', $nowTs - 86400);
        $earliest = gmdate('Y-m-d', $nowTs - self::MAX_CATCH_UP_DAYS * 86400);
        if ($rolled !== '' && $rolled < $first) {
            $first = max($earliest, gmdate('Y-m-d', (int) strtotime($rolled . ' UTC') + 86400));
        }
        // one day at a time (memory: a day of per-minute checks is the most read at once), each day marked when done, so
        // a failure resumes there
        for ($day = $first; $day < $today; $day = gmdate('Y-m-d', (int) strtotime($day . ' UTC') + 86400)) {
            $next = gmdate('Y-m-d', (int) strtotime($day . ' UTC') + 86400);
            $this->rollups->rollDays($day, $next, $interval, $processing);
            Option::set(self::OPTION_ROLLED_DAY, $day);
        }
        $this->retention->run(new \DateTimeImmutable('@' . $nowTs));
        // marked done only after the work: a failed day is tried again in the next run
        Option::set(self::OPTION_DAILY, $today);

        if ($pages) {
            $matomoHost = '';
            foreach ($byId as $target) {
                if ($target->idSite === 0 && isset($target->extra['matomoHost'])) {
                    $matomoHost = (string) $target->extra['matomoHost'];
                    break;
                }
            }
            $this->detection->run($pages, $matomoHost, self::siteHosts());
        }
    }

    /**
     * @return array<int, string[]> hosts of every website's URLs, one query
     */
    private static function siteHosts(): array
    {
        $hosts = [];
        try {
            foreach ((new SitesModel())->getAllKnownUrlsForAllSites() as $row) {
                $host = strtolower((string) parse_url((string) $row['url'], PHP_URL_HOST));
                if ($host !== '') {
                    $hosts[(int) $row['idsite']][] = $host;
                }
            }
        } catch (\Throwable $e) {
            return [];
        }

        return $hosts;
    }
}
