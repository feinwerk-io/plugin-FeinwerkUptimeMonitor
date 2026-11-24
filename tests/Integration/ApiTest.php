<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration;

use Piwik\Db;
use Piwik\NoAccessException;
use Piwik\Option;
use Piwik\Plugins\FeinwerkUptimeMonitor\API;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\External\ExternalResults;
use Piwik\Plugins\FeinwerkUptimeMonitor\FeinwerkUptimeMonitor;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\IncidentStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\RollupStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Schema;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\SystemSettings;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\DefaultTargets;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\HttpFixtureServer;
use Piwik\Tests\Framework\Fixture;
use Piwik\Tests\Framework\Mock\FakeAccess;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;

/**
 * Each API method: one happy path, at least one error case (HTTP 400 naming the parameter, or no access).
 *
 * @group FeinwerkUptimeMonitor
 */
class ApiTest extends IntegrationTestCase
{
    private static string $base;
    private int $web = 0;

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

    public function provideContainerConfig()
    {
        return ['Piwik\\Access' => new FakeAccess()];
    }

    public function setUp(): void
    {
        parent::setUp();
        FakeAccess::clearAccess(true);
        Fixture::loadAllTranslations();
        (new FeinwerkUptimeMonitor())->install();
        foreach (Schema::tables() as $table) {
            Db::query('TRUNCATE TABLE ' . Schema::table($table));
        }
        Option::deleteLike('fw_uptimemonitor_%');
        Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Shop', self::$base . '/page-proxy');
        $settings = new SystemSettings();
        $settings->allowPrivate->setValue(true);
        $settings->save();
        // the fixture website lives on 127.0.0.1
        \Piwik\Config::getInstance()->FeinwerkUptimeMonitor = ['allowLoopbackForWebsites' => 1];

        $targets = new TargetStore();
        $targets->syncDefaults([
            ['idSite' => 0, 'key' => 'ui', 'kind' => Kind::UI, 'url' => 'https://matomo.example.com/index.php', 'extra' => ['matomoHost' => 'matomo.example.com']],
            ['idSite' => 0, 'key' => 'tracker', 'kind' => Kind::TRACKER, 'url' => 'https://matomo.example.com/matomo.php', 'extra' => ['matomoHost' => 'matomo.example.com']],
            ['idSite' => 1, 'key' => DefaultTargets::webKey(self::$base . '/page-proxy'), 'kind' => Kind::WEB, 'url' => self::$base . '/page-proxy', 'extra' => ['matomoHost' => 'matomo.example.com']],
        ]);
        $this->web = $targets->get(1, DefaultTargets::webKey(self::$base . '/page-proxy'))->id;
    }

    /** Calls the API class directly: Matomo's request layer would turn the exception into a plain one (code 0). */
    public function tearDown(): void
    {
        Fixture::resetTranslations();
        parent::tearDown();
    }

    private static function api(string $method, array $params = [])
    {
        return API::getInstance()->$method(...$params);
    }

    private function assertBadRequest(string $method, array $params, string $needle, int $code = 400): void
    {
        try {
            self::api($method, $params);
            $this->fail("$method: no error");
        } catch (\Exception $e) {
            $this->assertSame($code, $e->getCode(), $e->getMessage());
            $this->assertStringContainsString($needle, $e->getMessage());
        }
    }

    private static function viewer(): void
    {
        FakeAccess::clearAccess(false, [], [1]);
    }

    public function test_getStatus_siteAndInstance(): void
    {
        (new StateStore())->upsertMany([new CheckResult($this->web, Outcome::UP, null, null, 200, ['total' => 120], '2099-01-01', '2026-03-14 10:00:00')], StateStore::LOCAL);
        $status = self::api('getStatus', ['idSite' => 1]);
        $this->assertNull($status['processing']);
        $this->assertSame(Outcome::UP, $status['targets'][0]['states']['local']['outcome']);
        $this->assertSame('2026-03-14T10:00:00Z', $status['targets'][0]['states']['local']['checkedAt']);
        $this->assertSame('ok', $status['targets'][0]['certificate']['level']);
        $this->assertArrayHasKey('samples', self::api('getStatus', ['idSite' => 0])['processing']);
    }

    /** Review L8 #9: anonymous visitors of a public dashboard read their website, never Matomo's own health. */
    public function test_anonymous_seesTheWebsiteButNotMatomoItself(): void
    {
        FakeAccess::clearAccess(false, [], [1], 'anonymous');
        $this->assertIsArray(self::api('getStatus', ['idSite' => 1]));
        foreach (['getStatus' => ['idSite' => 0], 'getCertificates' => ['idSite' => 0],
            'getIncidents' => ['idSite' => 0, 'period' => 'day', 'date' => '2026-03-14']] as $method => $params) {
            try {
                self::api($method, $params);
                $this->fail("$method: anonymous got Matomo's data");
            } catch (\Piwik\NoAccessException $e) {
                $this->assertNotSame('', $e->getMessage());
            }
        }
    }

    /** Release check L7: before the first check run Matomo's own targets do not exist yet; no error, just no values. */
    public function test_getResponseTimes_matomosTargetsBeforeTheFirstRun_isEmpty(): void
    {
        Db::query('DELETE FROM ' . Schema::table(Schema::TARGET) . ' WHERE idsite = 0');
        foreach (['processing', 'tracker'] as $key) {
            $this->assertSame([], self::api('getResponseTimes', ['idSite' => 0, 'period' => 'day', 'date' => '2026-03-14', 'targetKey' => $key]));
        }
        $this->assertBadRequest('getResponseTimes', ['idSite' => 0, 'period' => 'day', 'date' => '2026-03-14', 'targetKey' => 'nope'], "'nope'");
    }

    public function test_getStatus_unknownSite_is400(): void
    {
        $this->assertBadRequest('getStatus', ['idSite' => 99], "'99'");
        $this->assertBadRequest('getStatus', ['idSite' => 'x'], "'idSite'");
    }

    public function test_getUptime_happy_andCoverage(): void
    {
        (new RollupStore())->upsertHours([['idtarget' => $this->web, 'hour' => '2026-03-14 10:00:00', 'source' => StateStore::EXTERNAL,
            'samples' => 60, 'up_samples' => 57, 'measured_seconds' => 3600, 'up_seconds' => 3420, 'ms_p50' => 80, 'ms_p95' => 200,
            'ms_max' => 900, 'cert_not_after' => null]]);
        $rows = self::api('getUptime', ['idSite' => 1, 'period' => 'day', 'date' => '2026-03-14', 'source' => 'external']);
        $this->assertCount(1, $rows);
        $this->assertSame(95.0, $rows[0]['uptimePercent']);
        $this->assertSame('external', $rows[0]['source']);
        $this->assertGreaterThan(0, $rows[0]['coveragePercent']);
        $this->assertSame(80, $rows[0]['p50Ms']);
    }

    /**
     * @dataProvider timezones
     */
    public function test_getUptime_usesTheWebsitesLocalDay(string $timezone, string $hourInside, string $hourOutside): void
    {
        $idSite = Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Local', 'https://local.example/', 1, null, null, $timezone);
        $targets = new TargetStore();
        $targets->syncDefaults([['idSite' => $idSite, 'key' => 'web:local', 'kind' => Kind::WEB, 'url' => 'https://local.example/', 'extra' => []]]);
        $id = $targets->get($idSite, 'web:local')->id;
        $row = static fn(string $hour, int $up): array => ['idtarget' => $id, 'hour' => $hour, 'source' => StateStore::EXTERNAL,
            'samples' => 60, 'up_samples' => $up, 'measured_seconds' => 3600, 'up_seconds' => $up * 60, 'ms_p50' => 80,
            'ms_p95' => 90, 'ms_max' => 100, 'cert_not_after' => null];
        (new RollupStore())->upsertHours([$row($hourInside, 60), $row($hourOutside, 0)]);

        $uptime = self::api('getUptime', ['idSite' => $idSite, 'period' => 'day', 'date' => '2026-03-14', 'source' => 'external']);
        $this->assertSame(100.0, $uptime[0]['uptimePercent'], 'only the hour of the local day counts');
        $this->assertSame(60, $uptime[0]['samples']);
    }

    public static function timezones(): array
    {
        // the first hour of the local 2026-03-14 (inside) and the last hour of the local day before (outside)
        return [
            'Berlin' => ['Europe/Berlin', '2026-03-13 23:00:00', '2026-03-13 22:00:00'],
            'Los Angeles' => ['America/Los_Angeles', '2026-03-14 07:00:00', '2026-03-14 06:00:00'],
            'Tokyo' => ['Asia/Tokyo', '2026-03-13 15:00:00', '2026-03-13 14:00:00'],
        ];
    }

    public function test_getUptime_badSource_is400(): void
    {
        $this->assertBadRequest('getUptime', ['idSite' => 1, 'period' => 'day', 'date' => '2026-03-14', 'source' => 'remote'], "'source'");
        $this->assertBadRequest('getUptime', ['idSite' => 1, 'period' => 'day', 'date' => '2026-03-14', 'source' => 'remote'], 'all, local, external');
        $this->assertBadRequest('getUptime', ['idSite' => 1, 'period' => 'decade', 'date' => '2026-03-14'], "'period'");
        $this->assertBadRequest('getUptime', ['idSite' => 1, 'period' => 'day', 'date' => 'someday'], "'date'");
    }

    public function test_getResponseTimes_happy_andUnknownTarget(): void
    {
        (new RollupStore())->upsertHours([['idtarget' => $this->web, 'hour' => '2026-03-14 10:00:00', 'source' => StateStore::EXTERNAL,
            'samples' => 60, 'up_samples' => 60, 'measured_seconds' => 3600, 'up_seconds' => 3600, 'ms_p50' => 80, 'ms_p95' => 200,
            'ms_max' => 900, 'cert_not_after' => null]]);
        $key = DefaultTargets::webKey(self::$base . '/page-proxy');
        $series = self::api('getResponseTimes', ['idSite' => 1, 'period' => 'day', 'date' => '2026-03-14', 'targetKey' => $key]);
        $this->assertSame('2026-03-14T10:00:00Z', $series[0]['time']);
        $this->assertSame(200, $series[0]['p95Ms']);
        $this->assertBadRequest('getResponseTimes', ['idSite' => 1, 'period' => 'day', 'date' => '2026-03-14', 'targetKey' => 'web:nothere'], "'web:nothere'");
    }

    public function test_getIncidents_happy_andBadLimit(): void
    {
        (new IncidentStore())->apply([new CheckResult($this->web, Outcome::DOWN, Outcome::TIMEOUT, null, null, [], null, '2026-03-14 10:00:00')]);
        $incidents = self::api('getIncidents', ['idSite' => 1, 'period' => 'day', 'date' => '2026-03-14', 'state' => 'open']);
        $this->assertCount(1, $incidents);
        $this->assertTrue($incidents[0]['open']);
        $this->assertSame('timeout', $incidents[0]['cause']);
        $this->assertBadRequest('getIncidents', ['idSite' => 1, 'period' => 'day', 'date' => '2026-03-14', 'limit' => 5000], "'limit'");
        $this->assertBadRequest('getIncidents', ['idSite' => 1, 'period' => 'day', 'date' => '2026-03-14', 'state' => 'gone'], "'state'");
    }

    public function test_getCertificates_happy_andNoAccess(): void
    {
        (new StateStore())->upsertMany([new CheckResult($this->web, Outcome::UP, null, null, 200, [], '2000-01-01', '2026-03-14 10:00:00')], StateStore::LOCAL);
        $certs = self::api('getCertificates', ['idSite' => 1]);
        $this->assertSame('expired', $certs[0]['level']);
        $this->assertSame('127.0.0.1', $certs[0]['host']);
        FakeAccess::clearAccess(false, [], []);
        $this->expectException(NoAccessException::class);
        self::api('getCertificates', ['idSite' => 1]);
    }

    public function test_getCertificates_ofMatomo_hidesHostsFromViewers(): void
    {
        $ui = (new TargetStore())->get(0, 'ui')->id;
        (new StateStore())->upsertMany([new CheckResult($ui, Outcome::UP, null, null, 200, [], '2099-01-01', '2026-03-14 10:00:00')], StateStore::LOCAL);
        $this->assertSame('matomo.example.com', self::api('getCertificates', ['idSite' => 0])[0]['host']);
        self::viewer();
        $this->assertNull(self::api('getCertificates', ['idSite' => 0])[0]['host']);
    }

    public function test_getTargets_instanceUrls_onlyForSuperUser(): void
    {
        $this->assertSame('https://matomo.example.com/matomo.php', array_column(self::api('getTargets', ['idSite' => 0])['targets'], 'url', 'targetKey')['tracker']);
        self::viewer();
        $this->assertNull(array_column(self::api('getTargets', ['idSite' => 0])['targets'], 'url', 'targetKey')['tracker']);
        $this->assertNotNull(self::api('getTargets', ['idSite' => 1])['targets'][0]['url']);
    }

    public function test_addTarget_happy_limit_andViewUserCannotWrite(): void
    {
        $row = self::api('addTarget', ['idSite' => 1, 'kind' => 'proxy', 'url' => 'https://www.shop.example/matomo.php']);
        $this->assertSame('proxy', $row['targetKey']);
        $this->assertSame('manual', $row['urlSource']);
        for ($i = 1; $i <= 4; $i++) {
            self::api('addTarget', ['idSite' => 1, 'kind' => 'web', 'url' => "https://www.shop.example/page$i"]);
        }
        $this->assertBadRequest('addTarget', ['idSite' => 1, 'kind' => 'web', 'url' => 'https://www.shop.example/page5'], '5');
        $this->assertBadRequest('addTarget', ['idSite' => 1, 'kind' => 'tracker', 'url' => 'https://x.example/'], "'kind'");
        $this->assertBadRequest('addTarget', ['idSite' => 1, 'kind' => 'web', 'url' => 'ftp://x.example/'], "'url'");
        self::viewer();
        $this->expectException(NoAccessException::class);
        self::api('addTarget', ['idSite' => 1, 'kind' => 'web', 'url' => 'https://www.shop.example/x']);
    }

    public function test_trackerAndProxyAddresses_withParameters_are400(): void
    {
        $this->assertBadRequest('addTarget', ['idSite' => 1, 'kind' => 'proxy', 'url' => 'https://www.shop.example/matomo.php?idsite=1&rec=1'], "'url'");
        $this->assertBadRequest('updateTarget', ['idSite' => 0, 'targetKey' => 'tracker', 'url' => 'https://matomo.example.com/matomo.php?rec=1'], "'url'");
        $this->assertSame('web', self::api('addTarget', ['idSite' => 1, 'kind' => 'web', 'url' => 'https://www.shop.example/?lang=de'])['kind']);
    }

    public function test_detectTargets_hidesMatomoSuggestionsFromSiteAdmins(): void
    {
        Option::set('fw_uptimemonitor_suggestions', json_encode([1 => [
            ['idSite' => 0, 'key' => 'tracker', 'kind' => 'tracker', 'url' => 'https://matomo.example.com/js/tracker.php'],
            ['idSite' => 1, 'key' => 'proxy', 'kind' => 'proxy', 'url' => 'https://cdn.example/matomo.php'],
        ]]));
        $this->assertSame(['proxy'], array_column(self::api('getTargets', ['idSite' => 1])['suggestions'], 'key'));
        $this->assertSame(['tracker'], array_column(self::api('getTargets', ['idSite' => 0])['suggestions'], 'key'));
        self::viewer();
        $this->assertSame([], self::api('getTargets', ['idSite' => 0])['suggestions'], 'no Matomo addresses for viewers');
    }

    public function test_updateTarget_disable_andUnknownKey(): void
    {
        $row = self::api('updateTarget', ['idSite' => 0, 'targetKey' => 'tracker', 'url' => 'https://matomo.example.com/js/tracker.php']);
        $this->assertSame('manual', $row['urlSource']);
        $this->assertFalse(self::api('updateTarget', ['idSite' => 0, 'targetKey' => 'tracker', 'enabled' => '0'])['enabled']);
        $this->assertBadRequest('updateTarget', ['idSite' => 0, 'targetKey' => 'nothing', 'enabled' => '0'], "'nothing'");
        $this->assertBadRequest('updateTarget', ['idSite' => 0, 'targetKey' => 'tracker', 'enabled' => 'yes'], "'enabled'");
    }

    public function test_deleteTarget_manualYes_defaultNo(): void
    {
        self::api('addTarget', ['idSite' => 1, 'kind' => 'proxy', 'url' => 'https://www.shop.example/matomo.php']);
        $this->assertTrue(self::api('deleteTarget', ['idSite' => 1, 'targetKey' => 'proxy'])['deleted']);
        $this->assertBadRequest('deleteTarget', ['idSite' => 0, 'targetKey' => 'ui'], "'ui'");
    }

    public function test_detectTargets_dryRunChangesNothing_applyAdopts(): void
    {
        $plan = self::api('detectTargets', ['idSite' => 1]);
        $this->assertSame(self::$base . '/matomo.php', $plan['found']['trackerUrl']);
        $this->assertSame('proxy', $plan['adopt'][0]['key']);
        $this->assertFalse($plan['applied']);
        $this->assertNull((new TargetStore())->get(1, Kind::PROXY), 'a dry run writes nothing');

        $this->assertTrue(self::api('detectTargets', ['idSite' => 1, 'apply' => 1])['applied']);
        $this->assertSame(TargetStore::SOURCE_DETECTED, (new TargetStore())->get(1, Kind::PROXY)->urlSource);
        $this->assertBadRequest('detectTargets', ['idSite' => 0], "'idSite'");
    }

    public function test_checkNow_runsAndIsRateLimited(): void
    {
        Db::query('TRUNCATE TABLE ' . Schema::table(Schema::TARGET));
        $result = self::api('checkNow', ['idSite' => 1]);
        $this->assertFalse($result['locked']);
        $this->assertNotEmpty($result['results']);
        // in CI Tag Manager is installed and gives every new website a container, so look among all results
        $keys = array_column($result['results'], 'targetKey');
        $this->assertNotEmpty(array_filter($keys, static fn(string $k): bool => strpos($k, 'web:') === 0), 'keys also on the very first run');
        $this->assertSame([], array_filter($keys, 'is_numeric'), 'never an internal id');
        $this->assertBadRequest('checkNow', ['idSite' => 1], '', 429);
    }

    public function test_getSitesOverview_superUserOnly(): void
    {
        (new StateStore())->upsertMany([new CheckResult($this->web, Outcome::DOWN, Outcome::TIMEOUT, null, null, [], '2000-01-01', gmdate('Y-m-d H:i:s'))], StateStore::LOCAL);
        $rows = array_column(self::api('getSitesOverview'), null, 'idSite');
        $this->assertSame('Matomo', $rows[0]['name']);
        $this->assertSame(2, $rows[0]['targets']);
        $this->assertSame('Shop', $rows[1]['name']);
        $this->assertSame(1, $rows[1]['down']);
        $this->assertLessThan(0, $rows[1]['certificateDaysLeft']);
        FakeAccess::clearAccess(false, [1], [1]);
        $this->expectException(NoAccessException::class);
        self::api('getSitesOverview');
    }

    public function test_getSitesOverview_oldResultsAreNotReachableNorDown(): void
    {
        (new StateStore())->upsertMany([new CheckResult($this->web, Outcome::UP, null, null, 200, [], null, gmdate('Y-m-d H:i:s', time() - 3 * 86400))], StateStore::LOCAL);
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame(1, $row['stale']);
        $this->assertSame(0, $row['down']);
    }

    /** UI review: a website whose addresses are all switched off stays in the overview, so it can be switched on again. */
    public function test_getSitesOverview_listsSwitchedOffWebsites(): void
    {
        foreach ((new TargetStore())->forSite(1) as $target) {
            self::api('updateTarget', ['idSite' => 1, 'targetKey' => $target->key, 'url' => '', 'enabled' => '0']);
        }
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame(0, $row['targets']);
        $this->assertGreaterThan(0, $row['off']);
        $this->assertSame(0, $row['up']);
    }

    public function test_getSitesOverview_countsReachableTargets(): void
    {
        (new StateStore())->upsertMany([new CheckResult($this->web, Outcome::UP, null, null, 200, [], null, gmdate('Y-m-d H:i:s'))], StateStore::LOCAL);
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame(1, $row['up']);
    }

    public function test_matomosUptime_followsTheViewedWebsitesDay(): void
    {
        $idSite = Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Tokyo', 'https://tokyo.example/', 1, null, null, 'Asia/Tokyo');
        $tracker = (new TargetStore())->get(0, 'tracker')->id;
        $row = static fn(string $hour, int $up): array => ['idtarget' => $tracker, 'hour' => $hour, 'source' => StateStore::EXTERNAL,
            'samples' => 60, 'up_samples' => $up, 'measured_seconds' => 3600, 'up_seconds' => $up * 60, 'ms_p50' => 80,
            'ms_p95' => 90, 'ms_max' => 100, 'cert_not_after' => null];
        // the first hour of the Tokyo day 2026-03-14 (up) and the hour before it (down)
        (new RollupStore())->upsertHours([$row('2026-03-13 15:00:00', 60), $row('2026-03-13 14:00:00', 0)]);
        $rows = array_column(self::api('getUptime', ['idSite' => 0, 'period' => 'day', 'date' => '2026-03-14', 'source' => 'external', 'timezoneOf' => $idSite]), null, 'targetKey');
        $this->assertSame(100.0, $rows['tracker']['uptimePercent']);
        $this->assertBadRequest('getUptime', ['idSite' => 0, 'period' => 'day', 'date' => '2026-03-14', 'timezoneOf' => 'x'], "'timezoneOf'");
    }

    public function test_externalResults_rejectLocal_andShowAsExternal(): void
    {
        try {
            (new ExternalResults())->writeHours([['idtarget' => $this->web, 'hour' => '2026-03-14 10:00:00', 'source' => 'local']]);
            $this->fail('local rows must be refused');
        } catch (\InvalidArgumentException $e) {
            $this->addToAssertionCount(1);
        }
        (new ExternalResults())->setLatest([['idtarget' => $this->web, 'outcome' => Outcome::DOWN, 'error' => Outcome::TIMEOUT,
            'status' => null, 'ms_total' => 10000, 'cert_not_after' => null, 'checked_at' => '2026-03-14 10:00:00']]);
        $status = self::api('getStatus', ['idSite' => 1]);
        $this->assertSame(Outcome::DOWN, $status['targets'][0]['states']['external']['outcome']);
        $this->assertSame([], self::api('getExternalSources'));
    }
}
