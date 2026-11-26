<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration\Runner;

use Piwik\Db;
use Piwik\Option;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\ResponseClassifier;
use Piwik\Plugins\FeinwerkUptimeMonitor\FeinwerkUptimeMonitor;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\AddressGuard;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Capabilities;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Prober;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\CheckRunner;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\DetectionJob;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\IntervalTracker;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\RunLock;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\CheckStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\IncidentStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Retention;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\RollupStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Schema;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\ContainerSource;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\DefaultTargets;
use Piwik\Plugins\FeinwerkUptimeMonitor\Tasks;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\DisabledFunctions;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\HttpFixtureServer;
use Piwik\Tests\Framework\Fixture;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;

/**
 * Whole runs against the local HTTP fixture server.
 *
 * @group FeinwerkUptimeMonitor
 */
class CheckRunnerTest extends IntegrationTestCase
{
    private static string $base;
    private array $slept = [];

    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();
        self::$base = HttpFixtureServer::start();
    }

    public static function tearDownAfterClass(): void
    {
        HttpFixtureServer::stop();
        parent::tearDownAfterClass();
    }

    public function setUp(): void
    {
        parent::setUp();
        (new FeinwerkUptimeMonitor())->install();
        foreach (Schema::tables() as $table) {
            Db::query('TRUNCATE TABLE ' . Schema::table($table));
        }
        Option::deleteLike('fw_uptimemonitor_%');
        $this->slept = [];
    }

    /**
     * @param \Closure|null $clock the run's clock, default microtime(true)
     * @param Capabilities|null $capabilities the prober's PHP functions, default all of this PHP's
     */
    private function runner(array $sitePaths, int $budget = 60, int $parallel = 8, ?RunLock $lock = null, int $retryDelay = CheckRunner::RETRY_DELAY,
        ?ContainerSource $containers = null, ?\Closure $clock = null, ?Capabilities $capabilities = null): CheckRunner
    {
        foreach ($sitePaths as $i => $path) {
            Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Site ' . $i, self::$base . $path);
        }
        $guard = new AddressGuard(true, null, true); // the fixture websites live on 127.0.0.1
        $targets = new TargetStore();

        return new CheckRunner(
            $targets,
            new CheckStore(),
            new StateStore(),
            new IncidentStore(),
            new RollupStore(),
            new Prober($guard, [], 'FeinwerkUptimeBot/test', 1000, 3000, $parallel, null, $capabilities),
            new ResponseClassifier(),
            new DefaultTargets('', '', $containers ?? new ContainerSource(static fn(): bool => false), static fn(): string => self::$base . '/'),
            new DetectionJob($targets),
            new Retention(),
            new IntervalTracker(),
            $lock,
            $clock ?? static fn(): float => microtime(true),
            function (int $seconds): void {
                $this->slept[] = $seconds;
            },
            $budget,
            $guard,
            $retryDelay
        );
    }

    private static function rows(string $table): int
    {
        return (int) Db::fetchOne('SELECT COUNT(*) FROM ' . Schema::table($table));
    }

    public function test_run_checksAllAndStoresResults(): void
    {
        $report = $this->runner(['/ok'])->run('task');

        $this->assertFalse($report->locked);
        $this->assertSame(4, $report->checked, 'interface, tracker, matomo.js and the website');
        $this->assertSame(0, $report->notMeasured);
        foreach ($report->results as $result) {
            $this->assertSame(Outcome::UP, $result->outcome, (string) $result->idTarget . ' ' . $result->error);
        }
        $this->assertSame(4, self::rows(Schema::CHECK));
        $this->assertSame(4, self::rows(Schema::STATE));
        $this->assertGreaterThan(0, self::rows(Schema::HOUR));
        $this->assertSame([], $this->slept, 'nothing to retry');
    }

    public function test_budget_cutsAndRotates(): void
    {
        $runner = $this->runner(['/slow?s=2', '/slow?s=2&b', '/slow?s=2&c'], 1, 1);

        // one request at a time, one second: the three fast Matomo targets and the first slow website fit
        $first = $runner->run('task');
        $this->assertSame(6, $first->checked + $first->notMeasured);
        $this->assertGreaterThan(0, $first->notMeasured, 'the budget stopped the run');
        $checkedFirst = array_map(static fn(CheckResult $r): int => $r->idTarget, $first->results);

        $second = $runner->run('task');
        $this->assertNotContains($second->results[0]->idTarget, $checkedFirst, 'the next run starts with the targets left out');
    }

    public function test_failedCheck_isRetriedOnce(): void
    {
        $report = $this->runner(['/db-down'])->run('task');

        $this->assertSame([CheckRunner::RETRY_DELAY], $this->slept);
        $down = array_values(array_filter($report->results, static fn(CheckResult $r): bool => $r->outcome === Outcome::DOWN));
        $this->assertCount(1, $down);
        $this->assertSame(Outcome::HTTP_STATUS, $down[0]->error);
        $this->assertSame(1, self::rows(Schema::INCIDENT));
    }

    /**
     * Review L8 #2, #3: a publish in Tag Manager changes the container file at once. The revision is read on every run,
     * for containers of every source; a detected container that is no longer published is retired.
     */
    public function test_containers_followTheLiveRevisionOnEveryRun(): void
    {
        $live = [['idsite' => 1, 'idcontainer' => 'AbC123', 'revision' => 3]];
        $containers = new ContainerSource(static fn(): bool => true, static function () use (&$live): array {
            return $live;
        });
        $runner = $this->runner(['/ok'], 60, 8, null, CheckRunner::RETRY_DELAY, $containers);
        $targets = new TargetStore();
        $runner->run('task'); // the first run syncs the defaults
        // the container as found on the website, with the revision it had when it was adopted
        $targets->setUrl(1, 'ctr:AbC123', Kind::CONTAINER, self::$base . '/container', TargetStore::SOURCE_DETECTED,
            ['idContainer' => 'AbC123', 'revision' => 2, 'matomoHost' => '127.0.0.1']);
        $targets->setUrl(1, 'ctr:Manual1', Kind::CONTAINER, self::$base . '/container', TargetStore::SOURCE_MANUAL,
            ['idContainer' => 'AbC123', 'revision' => 1, 'matomoHost' => '127.0.0.1']);

        $runner->run('task');
        $outcome = static function (string $key) use ($targets): ?string {
            $id = $targets->get(1, $key)->id;
            return (new StateStore())->forTargets([$id])[$id][StateStore::LOCAL]['outcome'] ?? null;
        };
        $this->assertSame(Outcome::UP, $outcome('ctr:AbC123'), 'live revision 3 is what the file says');
        $this->assertSame(Outcome::UP, $outcome('ctr:Manual1'));

        $live = []; // unpublished in Tag Manager
        $runner->run('task');
        $keys = array_map(static fn($t) => $t->key, $targets->forSite(1));
        $this->assertNotContains('ctr:AbC123', $keys, 'a detected container no longer published is retired');
        $this->assertContains('ctr:Manual1', $keys, 'one set by hand stays');
        $this->assertSame(Outcome::UP, $outcome('ctr:Manual1'), 'checked by its id only');
    }

    public function test_quickRun_stillRetriesAfterAShortPause(): void
    {
        $this->runner(['/db-down'], 15, 8, null, CheckRunner::QUICK_RETRY_DELAY)->run('task');
        $this->assertSame([CheckRunner::QUICK_RETRY_DELAY], $this->slept);
    }

    public function test_missedDays_areRolledUpLater(): void
    {
        $threeDaysAgo = gmdate('Y-m-d', time() - 3 * 86400);
        (new CheckStore())->insertMany([new CheckResult(77, Outcome::UP, null, null, 200, ['total' => 50], null, $threeDaysAgo . ' 12:00:00')]);
        Option::set(CheckRunner::OPTION_ROLLED_DAY, gmdate('Y-m-d', time() - 5 * 86400));

        $this->runner(['/ok'])->run('task');

        $day = (new RollupStore())->days([77], $threeDaysAgo, gmdate('Y-m-d', time() - 2 * 86400));
        $this->assertCount(1, $day, 'a day without any run still gets its day row');
        $this->assertSame(gmdate('Y-m-d', time() - 86400), Option::get(CheckRunner::OPTION_ROLLED_DAY));
    }

    public function test_lockHeld_secondRunReturnsLocked(): void
    {
        $held = new RunLock();
        $this->assertTrue($held->acquire(60));
        try {
            $report = $this->runner(['/ok'], 60, 8, new RunLock())->run('task');
            $this->assertTrue($report->locked);
            $this->assertSame(0, $report->checked);
            $this->assertSame(0, self::rows(Schema::CHECK));
        } finally {
            $held->release();
        }
    }

    /**
     * Review 5.3.1 #3: the run keeps its lock alive before each batch, and on the sequential way a batch is one address:
     * the lock's UPDATE ran before every address. It now runs at most every LOCK_REFRESH_EVERY seconds of the run's clock,
     * always with the run's whole lock time.
     */
    public function test_lockRefresh_atMostEveryTenSeconds_notBeforeEveryAddress(): void
    {
        $lock = new class extends RunLock {
            /** @var int[] */
            public array $refreshes = [];

            public function refresh(int $ttlSeconds): void
            {
                $this->refreshes[] = $ttlSeconds;
                parent::refresh($ttlSeconds);
            }
        };
        // the run's clock moves 4 seconds on each reading, from now on (the prober's deadline compares with real time):
        // the start, then one reading before each of the six addresses (8, 12 and 24 seconds after the last refresh)
        $readings = 0;
        $now = microtime(true);
        $clock = static function () use (&$readings, $now): float {
            return $now + 4 * $readings++;
        };
        $sequential = new Capabilities(DisabledFunctions::except(['curl_multi_exec']));
        $report = $this->runner(['/ok', '/ok?b', '/ok?c'], 60, 8, $lock, CheckRunner::RETRY_DELAY, null, $clock, $sequential)->run('task');

        $this->assertSame(6, $report->checked, 'three Matomo addresses and three websites, one after the other');
        $this->assertSame([60 + CheckRunner::LOCK_MARGIN, 60 + CheckRunner::LOCK_MARGIN], $lock->refreshes,
            'after 12 and 24 seconds, not before each of the six');
    }

    public function test_firstRunAfterLongPause_recordsGap(): void
    {
        $fiveHoursAgo = gmdate('Y-m-d H:i:s', time() - 5 * 3600);
        (new CheckStore())->insertMany([new CheckResult(999, Outcome::UP, null, null, 200, [], null, $fiveHoursAgo)]);

        $this->runner(['/ok'])->run('task');

        $gap = Db::fetchRow('SELECT * FROM ' . Schema::table(Schema::INCIDENT) . ' WHERE kind = ?', [IncidentStore::GAP]);
        $this->assertNotEmpty($gap);
        $this->assertSame(gmdate('Y-m-d H:i:s', strtotime($fiveHoursAgo . ' UTC') + 7200), $gap['started_at']);
        $this->assertNotNull($gap['ended_at']);
    }

    public function test_noGap_afterAnHour(): void
    {
        (new CheckStore())->insertMany([new CheckResult(999, Outcome::UP, null, null, 200, [], null, gmdate('Y-m-d H:i:s', time() - 3600))]);
        $this->runner(['/ok'])->run('task');
        $this->assertSame(0, (int) Db::fetchOne('SELECT COUNT(*) FROM ' . Schema::table(Schema::INCIDENT) . ' WHERE kind = ?', [IncidentStore::GAP]));
    }

    public function test_checkNowForOneSite_checksOnlyItsTargets(): void
    {
        $report = $this->runner(['/ok', '/ok?second'])->run('now', 2);
        $this->assertSame(1, $report->checked);
        $this->assertNull(Option::get(CheckRunner::OPTION_DAILY) ?: null, 'no daily work for "check now"');
    }

    public function test_taskSkips_whenTheCronRunsTheCommand(): void
    {
        $interval = new IntervalTracker();
        foreach ([180, 120, 60] as $ago) {
            $interval->recordCommandRun(time() - $ago);
        }
        $this->assertTrue((new IntervalTracker())->cronActive(time()));
        $this->assertSame(60, (new IntervalTracker())->interval(time()));
        (new Tasks())->runChecks();
        $this->assertSame(0, self::rows(Schema::CHECK));
    }

    public function test_twoRunsByHand_areNoCron(): void
    {
        $interval = new IntervalTracker();
        $interval->recordCommandRun(time() - 30);
        $interval->recordCommandRun(time());
        $fresh = new IntervalTracker();
        $this->assertFalse($fresh->cronActive(time()));
        $this->assertSame(IntervalTracker::HOURLY, $fresh->interval(time()), 'a test run by hand changes nothing');
    }

    public function test_detection_adoptsProxyOnSiteHost_andSuggestsForeign(): void
    {
        $targets = new TargetStore();
        $html = static fn(string $u): string => "<script>var u=\"$u\";_paq.push(['setTrackerUrl', u+'matomo.php']);g.src=u+'matomo.php';</script>";
        $job = new DetectionJob($targets);
        $result = $job->run(
            [
                1 => ['url' => 'https://www.shop.example/', 'found' => $job->read($html('https://www.shop.example/'), 'https://www.shop.example/')],
                2 => ['url' => 'https://blog.example/', 'found' => $job->read($html('https://cdn.agency.example/'), 'https://blog.example/')],
            ],
            'matomo.example.com',
            [1 => ['www.shop.example'], 2 => ['blog.example']]
        );

        $proxy = $targets->get(1, Kind::PROXY);
        $this->assertNotNull($proxy);
        $this->assertSame('https://www.shop.example/matomo.php', $proxy->url);
        $this->assertSame(TargetStore::SOURCE_DETECTED, $proxy->urlSource);
        $this->assertNull($targets->get(0, Kind::TRACKER), 'the foreign tracker is not adopted');
        $this->assertSame('https://cdn.agency.example/matomo.php', $result['suggested'][2][0]['url']);
        $this->assertSame('https://cdn.agency.example/matomo.php', DetectionJob::suggestions()[2][0]['url']);
    }

    public function test_detection_neverChangesMatomosOwnTargets(): void
    {
        $targets = new TargetStore();
        $targets->syncDefaults([['idSite' => 0, 'key' => Kind::TRACKER, 'kind' => Kind::TRACKER, 'url' => 'https://matomo.example.com/matomo.php', 'extra' => []]]);
        $job = new DetectionJob($targets);
        $renamed = "<script>var u='https://matomo.example.com/';_paq.push(['setTrackerUrl', u+'nope.php']);</script>";
        $withQuery = "<script>var u='https://www.shop.example/';_paq.push(['setTrackerUrl', u+'matomo.php?idsite=9&rec=1']);</script>";
        $plan = $job->run([
            1 => ['url' => 'https://www.shop.example/', 'found' => $job->read($renamed, 'https://www.shop.example/')],
            2 => ['url' => 'https://blog.example/', 'found' => $job->read($withQuery, 'https://blog.example/')],
        ], 'matomo.example.com', [1 => ['www.shop.example'], 2 => ['blog.example', 'www.shop.example']]);

        $this->assertSame('https://matomo.example.com/matomo.php', $targets->get(0, Kind::TRACKER)->url, 'a website cannot replace it');
        $this->assertSame(0, $plan['suggested'][1][0]['idSite'], 'only a suggestion for super users');
        $this->assertSame([], $plan['adopt']);
        $this->assertArrayNotHasKey(2, $plan['suggested'], 'a tracker address with parameters is dropped');
    }

    public function test_userAgent_isABotForMatomosDeviceDetector(): void
    {
        $detector = new \DeviceDetector\DeviceDetector(CheckRunner::userAgent());
        $detector->parse();
        $this->assertTrue($detector->isBot(), CheckRunner::userAgent());
    }
}
