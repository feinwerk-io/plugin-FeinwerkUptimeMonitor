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
use Piwik\Piwik;
use Piwik\Plugins\FeinwerkUptimeMonitor\API;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\External\ExternalResults;
use Piwik\Plugins\FeinwerkUptimeMonitor\FeinwerkUptimeMonitor;
use Piwik\Plugins\FeinwerkUptimeMonitor\Report\UptimeReport;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\IntervalTracker;
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

    /**
     * A plugin that adds results checked from outside, registered as the seam's event asks (Pro's shape): active and
     * reached at $reachedAt (default a minute ago), so it delivers (ExternalResults::isActive) unless $active is false.
     */
    private static function outsideSource(bool $active = true, ?int $reachedAt = null): void
    {
        Piwik::addAction(ExternalResults::EVENT_SOURCES, static function (&$sources) use ($active, $reachedAt): void {
            $sources[] = ['name' => 'Outside checks', 'active' => $active,
                'reachedAt' => gmdate('Y-m-d\TH:i:s\Z', $reachedAt ?? time() - 60), 'settingsUrl' => null];
        });
    }

    /** the latest result from outside of one target, as the other plugin writes it (ExternalResults::setLatest) */
    private static function outsideState(int $idTarget, string $outcome, ?string $cert = null, ?string $checkedAt = null): void
    {
        (new ExternalResults())->setLatest([['idtarget' => $idTarget, 'outcome' => $outcome,
            'error' => $outcome === Outcome::DOWN ? Outcome::HTTP_STATUS : null, 'status' => $outcome === Outcome::DOWN ? 502 : 200,
            'ms_total' => 118, 'cert_not_after' => $cert, 'checked_at' => $checkedAt ?? gmdate('Y-m-d H:i:s')]]);
    }

    /**
     * The days a certificate has left, as the report counts them, for a call between $before and $after: the run may
     * cross UTC midnight between the fixture and the call (L8 review finding 11).
     *
     * @return int[]
     */
    private static function daysLeft(string $notAfter, int $before, int $after): array
    {
        $end = (int) strtotime($notAfter . ' 23:59:59 UTC');

        return array_values(array_unique([(int) floor(($end - $before) / 86400), (int) floor(($end - $after) / 86400)]));
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

    /** F1 of the 5.1.5 review: each outage names its part inside the period, so day totals never count across midnight. */
    public function test_getIncidents_partInThePeriod_anOutageAcrossMidnight(): void
    {
        $store = new IncidentStore();
        $store->apply([new CheckResult($this->web, Outcome::DOWN, Outcome::TIMEOUT, null, null, [], null, '2026-03-14 23:30:00')]);
        $store->apply([new CheckResult($this->web, Outcome::UP, null, null, 200, [], null, '2026-03-15 00:30:00')]);
        foreach (['2026-03-14' => '2026-03-14T23:30:00Z', '2026-03-15' => '2026-03-15T00:00:00Z'] as $date => $start) {
            $incidents = self::api('getIncidents', ['idSite' => 1, 'period' => 'day', 'date' => $date]);
            $this->assertCount(1, $incidents, $date);
            $this->assertSame(3600, $incidents[0]['durationSeconds'], $date);
            $this->assertSame($start, $incidents[0]['startInPeriod'], $date);
            $this->assertSame(1800, $incidents[0]['durationInPeriodSeconds'], $date);
        }
        // the week (Monday to Sunday) holds it whole
        $week = self::api('getIncidents', ['idSite' => 1, 'period' => 'week', 'date' => '2026-03-14']);
        $this->assertSame(['2026-03-14T23:30:00Z', 3600], [$week[0]['startInPeriod'], $week[0]['durationInPeriodSeconds']]);
    }

    public function test_incidents_anOpenOutageSinceYesterday_countsTodayFromMidnightToNow(): void
    {
        (new IncidentStore())->apply([new CheckResult($this->web, Outcome::DOWN, Outcome::TIMEOUT, null, null, [], null, '2026-03-14 22:00:00')]);
        $now = (int) strtotime('2026-03-15 10:00:00 UTC');
        $report = new UptimeReport(static fn(): int => $now);
        $today = $report->incidents(1, $report->range(1, 'day', '2026-03-15'), 'all', 100, 'all');
        $this->assertCount(1, $today);
        $this->assertTrue($today[0]['open']);
        $this->assertSame(12 * 3600, $today[0]['durationSeconds']);
        $this->assertSame(['2026-03-15T00:00:00Z', 10 * 3600], [$today[0]['startInPeriod'], $today[0]['durationInPeriodSeconds']]);
        $yesterday = $report->incidents(1, $report->range(1, 'day', '2026-03-14'), 'all', 100, 'all');
        $this->assertSame(['2026-03-14T22:00:00Z', 2 * 3600], [$yesterday[0]['startInPeriod'], $yesterday[0]['durationInPeriodSeconds']]);
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
        $this->assertSame('expired', $rows[1]['certificateLevel']);
        $this->assertNull($rows[0]['certificateLevel'], 'no certificate read: no level');
        FakeAccess::clearAccess(false, [1], [1]);
        $this->expectException(NoAccessException::class);
        self::api('getSitesOverview');
    }

    /** Final review: the overview colours the certificate column like the uptime page: the soonest one's level. */
    public function test_getSitesOverview_certificateLevel_ofTheSoonest(): void
    {
        $targets = new TargetStore();
        $ui = $targets->get(0, 'ui')->id;
        $tracker = $targets->get(0, 'tracker')->id;
        $now = gmdate('Y-m-d H:i:s');
        $in = static fn(int $days): string => gmdate('Y-m-d', time() + $days * 86400);
        (new StateStore())->upsertMany([
            new CheckResult($ui, Outcome::UP, null, null, 200, [], $in(40), $now),
            new CheckResult($tracker, Outcome::UP, null, null, 200, [], $in(2), $now),
            new CheckResult($this->web, Outcome::UP, null, null, 200, [], $in(10), $now),
        ], StateStore::LOCAL);
        $before = time();
        $rows = array_column(self::api('getSitesOverview'), null, 'idSite');
        $after = time();
        $this->assertSame('critical', $rows[0]['certificateLevel'], 'the soonest of Matomo');
        $this->assertContains($rows[0]['certificateDaysLeft'], self::daysLeft($in(2), $before, $after));
        $this->assertSame('warning', $rows[1]['certificateLevel']);
        $this->assertContains($rows[1]['certificateDaysLeft'], self::daysLeft($in(10), $before, $after));
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

    /**
     * F2 (B10 review): while results checked from outside come in, the overview combines both sides as the uptime page
     * does. A website this server cannot check but the outside reaches is reachable (not folded as "cannot be
     * checked"); an address down from outside only is down; the certificate from outside fills the server's gap.
     */
    public function test_getSitesOverview_withOutside_combinesBothSides(): void
    {
        $targets = new TargetStore();
        $targets->syncDefaults([
            ['idSite' => 0, 'key' => 'ui', 'kind' => Kind::UI, 'url' => 'https://matomo.example.com/index.php', 'extra' => []],
            ['idSite' => 0, 'key' => 'tracker', 'kind' => Kind::TRACKER, 'url' => 'https://matomo.example.com/matomo.php', 'extra' => []],
            ['idSite' => 1, 'key' => DefaultTargets::webKey(self::$base . '/page-proxy'), 'kind' => Kind::WEB, 'url' => self::$base . '/page-proxy', 'extra' => []],
            ['idSite' => 1, 'key' => 'ctr:abc123', 'kind' => Kind::CONTAINER, 'url' => 'https://matomo.example.com/js/container_abc123.js', 'extra' => ['idContainer' => 'abc123']],
        ]);
        $ui = $targets->get(0, 'ui')->id;
        $tracker = $targets->get(0, 'tracker')->id;
        $container = $targets->get(1, 'ctr:abc123')->id;
        $now = gmdate('Y-m-d H:i:s');
        $earlier = gmdate('Y-m-d H:i:s', time() - 120);
        (new StateStore())->upsertMany([
            new CheckResult($ui, Outcome::UP, null, null, 200, [], null, $earlier),
            new CheckResult($tracker, Outcome::UP, null, null, 200, [], null, $earlier),
            new CheckResult($container, Outcome::UP, null, null, 200, [], null, $earlier),
            new CheckResult($this->web, Outcome::NOT_CHECKABLE, Outcome::CONNECT, null, null, [], null, $earlier),
        ], StateStore::LOCAL);
        $in10 = gmdate('Y-m-d', time() + 10 * 86400);
        self::outsideState($this->web, Outcome::UP, $in10, $now);
        self::outsideState($tracker, Outcome::DOWN, null, $now);
        self::outsideState($container, Outcome::DOWN, null, $now);

        // without a source that delivers: the server's results only, as before
        self::outsideSource(false);
        $rows = array_column(self::api('getSitesOverview'), null, 'idSite');
        $this->assertSame([0, 1, 0], [$rows[1]['up'], $rows[1]['notCheckable'], $rows[1]['down']], 'not checkable from this server');
        $this->assertNull($rows[1]['certificateDaysLeft'], 'no certificate from old results from outside');
        $this->assertSame([3, 0, []], [$rows[0]['up'], $rows[0]['down'], $rows[0]['containersDown']]);
        $this->assertSame(UptimeReport::iso((int) strtotime($earlier . ' UTC')), $rows[1]['lastCheckedAt']);

        self::outsideSource();
        $before = time();
        $rows = array_column(self::api('getSitesOverview'), null, 'idSite');
        $after = time();
        $this->assertSame([1, 0, 0], [$rows[1]['up'], $rows[1]['notCheckable'], $rows[1]['down']], 'reachable from outside');
        $this->assertSame('warning', $rows[1]['certificateLevel'], 'the certificate from outside');
        $this->assertContains($rows[1]['certificateDaysLeft'], self::daysLeft($in10, $before, $after));
        $this->assertSame(UptimeReport::iso((int) strtotime($now . ' UTC')), $rows[1]['lastCheckedAt'], 'the newer of both sides');
        $this->assertSame([1, 2], [$rows[0]['up'], $rows[0]['down']], 'down from outside is down: the tracker and the container');
        $this->assertSame([['idSite' => 1, 'name' => 'Shop']], $rows[0]['containersDown']);
    }

    /** F2: a side whose result is old counts only when the other has none that is current, as on the uptime page. */
    public function test_getSitesOverview_withOutside_staleSidesAsOnThePage(): void
    {
        self::outsideSource();
        $old = gmdate('Y-m-d H:i:s', time() - 3 * 86400);
        (new StateStore())->upsertMany([new CheckResult($this->web, Outcome::NOT_CHECKABLE, Outcome::CONNECT, null, null, [], null, $old)], StateStore::LOCAL);
        self::outsideState($this->web, Outcome::UP, null, gmdate('Y-m-d H:i:s', time() - 3600));
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([1, 0], [$row['up'], $row['stale']], 'the server stopped, from outside current within 2 h 15 min');

        self::outsideState($this->web, Outcome::UP, null, gmdate('Y-m-d H:i:s', time() - ExternalResults::STALE_AFTER - 600));
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([0, 1, 0], [$row['up'], $row['stale'], $row['notCheckable']], 'no side current: stale');
    }

    /**
     * An address that cannot be checked from outside (a private address, a port the outside does not check) says
     * nothing about it: it neither hides that the server's checks stopped nor counts as a fresh check.
     */
    public function test_getSitesOverview_withOutside_notCheckableFromOutsideAddsNothing(): void
    {
        self::outsideSource();
        $old = gmdate('Y-m-d H:i:s', time() - 3 * 86400);
        (new StateStore())->upsertMany([new CheckResult($this->web, Outcome::UP, null, null, 200, [], null, $old)], StateStore::LOCAL);
        self::outsideState($this->web, Outcome::NOT_CHECKABLE);
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([0, 1, 0], [$row['up'], $row['stale'], $row['notCheckable']], 'the server stopped: stale, not "not checkable"');
        $this->assertSame(UptimeReport::iso((int) strtotime($old . ' UTC')), $row['lastCheckedAt'], 'the server\'s last check');

        (new StateStore())->forget([$this->web]);
        self::outsideState($this->web, Outcome::NOT_CHECKABLE);
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([0, 0, 0, null], [$row['up'], $row['stale'], $row['notCheckable'], $row['lastCheckedAt']],
            'not measured yet by the server');
    }

    /**
     * L8 review finding 1: the other plugin stops checking an address that was down from outside (switched off there,
     * beyond its limit): its outage ends and the address no longer reads down from outside, on the page (getStatus) and
     * in the overview.
     */
    public function test_endOutages_theAddressNoLongerReadsDownFromOutside(): void
    {
        self::outsideSource();
        self::outsideState($this->web, Outcome::DOWN);
        (new ExternalResults())->writeIncidents([['idtarget' => $this->web, 'started_at' => gmdate('Y-m-d H:i:s', time() - 600),
            'ended_at' => null, 'cause' => Outcome::HTTP_STATUS, 'detail' => 'HTTP 502', 'down_samples' => 10]]);
        $this->assertSame(Outcome::DOWN, self::api('getStatus', ['idSite' => 1])['targets'][0]['states']['external']['outcome']);
        $this->assertSame(1, array_column(self::api('getSitesOverview'), null, 'idSite')[1]['down']);

        (new ExternalResults())->endOutages([$this->web], gmdate('Y-m-d H:i:s'));

        $this->assertArrayNotHasKey('external', self::api('getStatus', ['idSite' => 1])['targets'][0]['states']);
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([0, 0], [$row['down'], $row['up']], 'neither down nor reachable: not checked by anyone now');
        $this->assertSame([], self::api('getIncidents', ['idSite' => 1, 'period' => 'day', 'date' => 'today', 'state' => 'open']));
    }

    /**
     * UI review B3: each overview row says how many of the addresses it counts as not checkable the outside cannot
     * check either, so the admin page names the side ("cannot be checked from this server" unless no side can).
     */
    public function test_getSitesOverview_notCheckableOutside(): void
    {
        $settings = new SystemSettings();
        $settings->allowPrivate->setValue(false);
        $settings->save();
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([1, 0], [$row['notCheckable'], $row['notCheckableOutside']], 'without results from outside');

        self::outsideState($this->web, Outcome::NOT_CHECKABLE);
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([1, 0], [$row['notCheckable'], $row['notCheckableOutside']], 'old results from outside count for nothing');

        self::outsideSource();
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([1, 1], [$row['notCheckable'], $row['notCheckableOutside']], 'no side can check it');

        self::outsideState($this->web, Outcome::NOT_CHECKABLE, null, gmdate('Y-m-d H:i:s', time() - ExternalResults::STALE_AFTER - 600));
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([1, 0], [$row['notCheckable'], $row['notCheckableOutside']], 'an old answer from outside says nothing now');
        $this->assertSame(0, array_column(self::api('getSitesOverview'), null, 'idSite')[0]['notCheckableOutside']);
    }

    /**
     * B11 part 2: an address the Matomo server never checks (a loopback or private IP address while private addresses
     * are not allowed) reads not checkable from the moment it is set, not "not checked yet" until the next check run;
     * a public address keeps reading "not checked yet", also when the outside cannot check it.
     */
    public function test_anAddressTheServerRefuses_isNotCheckableBeforeItsFirstCheck(): void
    {
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([0, null], [$row['notCheckable'], $row['lastCheckedAt']], 'private addresses allowed: not checked yet');
        $this->assertFalse(self::api('getStatus', ['idSite' => 1])['targets'][0]['serverRefuses']);

        $settings = new SystemSettings();
        $settings->allowPrivate->setValue(false);
        $settings->save();

        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([1, 0, null], [$row['notCheckable'], $row['up'], $row['lastCheckedAt']], 'no check time it never had');
        $target = self::api('getStatus', ['idSite' => 1])['targets'][0];
        $this->assertTrue($target['serverRefuses']);
        $this->assertSame([], $target['states'], 'no invented result');

        self::outsideSource();
        self::outsideState($this->web, Outcome::UP);
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([1, 0], [$row['up'], $row['notCheckable']], 'it answers from outside: reachable');

        (new TargetStore())->setUrl(1, 'web:public', Kind::WEB, 'https://www.example.org/', TargetStore::SOURCE_MANUAL);
        $id = (new TargetStore())->get(1, 'web:public')->id;
        self::outsideState($id, Outcome::NOT_CHECKABLE);
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame([2, 1, 0], [$row['targets'], $row['up'], $row['notCheckable']], 'the public address: not checked yet');
        $targets = array_column(self::api('getStatus', ['idSite' => 1])['targets'], null, 'targetKey');
        $this->assertFalse($targets['web:public']['serverRefuses'], 'a name: only the check tells');
    }

    public function test_getSitesOverview_countsReachableTargets(): void
    {
        (new StateStore())->upsertMany([new CheckResult($this->web, Outcome::UP, null, null, 200, [], null, gmdate('Y-m-d H:i:s'))], StateStore::LOCAL);
        $row = array_column(self::api('getSitesOverview'), null, 'idSite')[1];
        $this->assertSame(1, $row['up']);
        $this->assertSame('UTC', $row['timezone']);
    }

    /** Peter, 2026-11-25, "a)": a Tag Manager container counts with Matomo, served by the Matomo server. */
    public function test_getSitesOverview_countsContainersWithMatomo(): void
    {
        $targets = new TargetStore();
        // syncDefaults retires the defaults it is not given: the setUp's three again, plus the container
        $targets->syncDefaults([
            ['idSite' => 0, 'key' => 'ui', 'kind' => Kind::UI, 'url' => 'https://matomo.example.com/index.php', 'extra' => []],
            ['idSite' => 0, 'key' => 'tracker', 'kind' => Kind::TRACKER, 'url' => 'https://matomo.example.com/matomo.php', 'extra' => []],
            ['idSite' => 1, 'key' => DefaultTargets::webKey(self::$base . '/page-proxy'), 'kind' => Kind::WEB, 'url' => self::$base . '/page-proxy', 'extra' => []],
            ['idSite' => 1, 'key' => 'ctr:abc123', 'kind' => Kind::CONTAINER, 'url' => 'https://matomo.example.com/js/container_abc123.js', 'extra' => ['idContainer' => 'abc123']],
        ]);
        $container = $targets->get(1, 'ctr:abc123')->id;
        $now = gmdate('Y-m-d H:i:s');
        (new StateStore())->upsertMany([
            new CheckResult($container, Outcome::DOWN, Outcome::HTTP_STATUS, null, 403, [], null, $now),
            new CheckResult($this->web, Outcome::UP, null, null, 200, [], null, $now),
        ], StateStore::LOCAL);
        $rows = array_column(self::api('getSitesOverview'), null, 'idSite');
        $this->assertSame([3, 1], [$rows[0]['targets'], $rows[0]['down']], 'Matomo: ui, tracker and the container');
        $this->assertSame([1, 0, 1], [$rows[1]['targets'], $rows[1]['down'], $rows[1]['up']], 'the website: its address only');
        $this->assertSame([['idSite' => 1, 'name' => 'Shop']], $rows[0]['containersDown'], 'Matomo says whose container');
        $this->assertSame([], $rows[1]['containersDown']);
    }

    /** Peter, 2026-11-25, "a)": the strips as the screens group them, the container in Matomo's. */
    public function test_getTimeline_groups_containerInMatomosStrip(): void
    {
        $targets = new TargetStore();
        $targets->syncDefaults([
            ['idSite' => 0, 'key' => 'ui', 'kind' => Kind::UI, 'url' => 'https://matomo.example.com/index.php', 'extra' => []],
            ['idSite' => 0, 'key' => 'tracker', 'kind' => Kind::TRACKER, 'url' => 'https://matomo.example.com/matomo.php', 'extra' => []],
            ['idSite' => 1, 'key' => DefaultTargets::webKey(self::$base . '/page-proxy'), 'kind' => Kind::WEB, 'url' => self::$base . '/page-proxy', 'extra' => []],
            ['idSite' => 1, 'key' => 'ctr:abc123', 'kind' => Kind::CONTAINER, 'url' => 'https://matomo.example.com/js/container_abc123.js', 'extra' => ['idContainer' => 'abc123']],
        ]);
        $row = fn(int $id, int $up): array => ['idtarget' => $id, 'hour' => '2026-03-14 10:00:00',
            'source' => StateStore::LOCAL, 'samples' => 60, 'up_samples' => 60, 'measured_seconds' => 3600,
            'up_seconds' => $up, 'ms_p50' => 80, 'ms_p95' => 90, 'ms_max' => 100, 'cert_not_after' => null];
        (new RollupStore())->upsertHours([
            $row($targets->get(0, 'ui')->id, 3600),
            $row($targets->get(0, 'tracker')->id, 3600),
            $row($this->web, 3600),
            $row($targets->get(1, 'ctr:abc123')->id, 0),
        ]);
        $cell = function (array $params): array {
            $cells = array_column(self::api('getTimeline', $params + ['period' => 'day', 'date' => '2026-03-14'])['cells'], null, 'time');
            return [$cells['2026-03-14T10:00:00Z']['measuredSeconds'], $cells['2026-03-14T10:00:00Z']['upSeconds'], $cells['2026-03-14T10:00:00Z']['state']];
        };
        $this->assertSame([10800, 7200, 'partial'], $cell(['idSite' => 1, 'group' => 'matomo']), 'ui, tracker and the down container');
        $this->assertSame([3600, 3600, 'up'], $cell(['idSite' => 1, 'group' => 'website']), 'the website without its container');
        $this->assertSame([7200, 3600, 'partial'], $cell(['idSite' => 1]), 'default all: every target of the website, as before');
        $this->assertSame([7200, 7200, 'up'], $cell(['idSite' => 0, 'group' => 'matomo']), 'idSite 0: no website, no container');

        $this->assertBadRequest('getTimeline', ['idSite' => 0, 'period' => 'day', 'date' => '2026-03-14', 'group' => 'website'], "'group'");
        $this->assertBadRequest('getTimeline', ['idSite' => 1, 'period' => 'day', 'date' => '2026-03-14', 'group' => 'server'], "'group'");
        FakeAccess::clearAccess(false, [], [1], 'anonymous');
        $this->assertSame([3600, 3600, 'up'], $cell(['idSite' => 1, 'group' => 'website']), 'anonymous viewers see the website');
        $this->expectException(\Piwik\NoAccessException::class);
        $cell(['idSite' => 1, 'group' => 'matomo']);
    }

    /** Peter's D2: the hour strip. Hours for a day, local days for a week; up, partial, down and nothing measured. */
    public function test_getTimeline_hoursForADay_daysForAWeek(): void
    {
        $row = fn(string $hour, int $measured, int $up): array => ['idtarget' => $this->web, 'hour' => $hour,
            'source' => StateStore::EXTERNAL, 'samples' => 60, 'up_samples' => 60, 'measured_seconds' => $measured,
            'up_seconds' => $up, 'ms_p50' => 80, 'ms_p95' => 90, 'ms_max' => 100, 'cert_not_after' => null];
        (new RollupStore())->upsertHours([$row('2026-03-14 10:00:00', 3600, 3600), $row('2026-03-14 11:00:00', 3600, 1800),
            $row('2026-03-14 12:00:00', 3600, 0)]);

        $day = self::api('getTimeline', ['idSite' => 1, 'period' => 'day', 'date' => '2026-03-14']);
        $this->assertSame('hour', $day['grain']);
        $this->assertCount(24, $day['cells']);
        $states = array_column($day['cells'], 'state', 'time');
        $this->assertSame(['none', 'up', 'partial', 'down'], [$states['2026-03-14T09:00:00Z'], $states['2026-03-14T10:00:00Z'],
            $states['2026-03-14T11:00:00Z'], $states['2026-03-14T12:00:00Z']]);

        // final review D3: the first measured hour, also for a period before it
        $this->assertSame('2026-03-14T10:00:00Z', $day['firstMeasured']);
        $before = self::api('getTimeline', ['idSite' => 1, 'period' => 'day', 'date' => '2026-03-10']);
        $this->assertSame(['none', '2026-03-14T10:00:00Z'], [array_unique(array_column($before['cells'], 'state'))[0], $before['firstMeasured']]);
        $this->assertNull(self::api('getTimeline', ['idSite' => 1, 'period' => 'day', 'date' => '2026-03-14', 'source' => 'local'])['firstMeasured'],
            'only the source asked for');
        $this->assertNull(self::api('getTimeline', ['idSite' => 0, 'period' => 'day', 'date' => '2026-03-14'])['firstMeasured'],
            'never measured');

        $week = self::api('getTimeline', ['idSite' => 1, 'period' => 'week', 'date' => '2026-03-14']);
        $this->assertSame('day', $week['grain']);
        $this->assertCount(7, $week['cells']);
        $byDay = array_column($week['cells'], null, 'time');
        $this->assertSame(['measuredSeconds' => 10800, 'upSeconds' => 5400, 'state' => 'partial'],
            array_intersect_key($byDay['2026-03-14T00:00:00Z'], array_flip(['measuredSeconds', 'upSeconds', 'state'])));

        $this->assertBadRequest('getTimeline', ['idSite' => 1, 'period' => 'decade', 'date' => '2026-03-14'], "'period'");
        FakeAccess::clearAccess(false, [], [1], 'anonymous');
        $this->expectException(\Piwik\NoAccessException::class);
        self::api('getTimeline', ['idSite' => 0, 'period' => 'day', 'date' => '2026-03-14']);
    }

    /** Regression: the strip's local days east of UTC (Berlin), and Matomo's fixed offsets (UTC+2). */
    public function test_getTimeline_localDaysEastOfUtc_andFixedOffsets(): void
    {
        foreach (['Europe/Berlin', 'UTC+2'] as $zone) {
            $idSite = Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Zone ' . $zone, 'https://zone.example/', 1, null, null, $zone);
            (new TargetStore())->setUrl($idSite, 'web:zone', Kind::WEB, 'https://zone.example/', TargetStore::SOURCE_MANUAL);
            $id = (new TargetStore())->get($idSite, 'web:zone')->id;
            // midday of 2026-03-14 local (12:00 Berlin is 11:00 UTC in March; UTC+2 fixed: 10:00 UTC). The old mapping
            // (Matomo's Date::setTimezone, which shifts the other way) put this hour into the 13th
            $hour = $zone === 'UTC+2' ? '2026-03-14 10:00:00' : '2026-03-14 11:00:00';
            (new RollupStore())->upsertHours([['idtarget' => $id, 'hour' => $hour, 'source' => StateStore::EXTERNAL,
                'samples' => 60, 'up_samples' => 60, 'measured_seconds' => 3600, 'up_seconds' => 3600, 'ms_p50' => 80,
                'ms_p95' => 90, 'ms_max' => 100, 'cert_not_after' => null]]);
            $month = self::api('getTimeline', ['idSite' => $idSite, 'period' => 'month', 'date' => '2026-03-14']);
            $this->assertSame(['day', 'local'], [$month['grain'], $month['days']], $zone);
            $measured = array_values(array_filter($month['cells'], static fn(array $c): bool => $c['measuredSeconds'] > 0));
            $this->assertCount(1, $measured, $zone);
            $this->assertSame(['measuredSeconds' => 3600, 'state' => 'up'], ['measuredSeconds' => $measured[0]['measuredSeconds'],
                'state' => $measured[0]['state']], $zone);
            // the cell is the local 14 March: its start is local midnight as UTC
            $this->assertSame($zone === 'UTC+2' ? '2026-03-13T22:00:00Z' : '2026-03-13T23:00:00Z', $measured[0]['time'], $zone);
        }
    }

    /** Hourly values are kept 90 days: an older day or week falls back to the UTC day rows, like the uptime figures. */
    public function test_getTimeline_withoutHourRows_usesDayRows_andRefusesHugePeriods(): void
    {
        Db::query('INSERT INTO ' . Schema::table(Schema::DAY) . ' (idtarget, day, source, samples, up_samples, bulk_samples,'
            . ' measured_seconds, up_seconds, ms_p50, ms_p95, ms_max, cert_not_after) VALUES (?, ?, ?, 1440, 1440, 0, 86400, 43200, 80, 90, 100, NULL)',
            [$this->web, '2026-03-14', StateStore::LOCAL]);
        $week = self::api('getTimeline', ['idSite' => 1, 'period' => 'week', 'date' => '2026-03-14']);
        $this->assertSame(['day', 'utc'], [$week['grain'], $week['days']]);
        $byDay = array_column($week['cells'], 'state', 'time');
        $this->assertSame('partial', $byDay['2026-03-14T00:00:00Z']);
        $this->assertSame('2026-03-14T00:00:00Z', $week['firstMeasured'], 'without hours: the start of the first UTC day');
        $this->assertBadRequest('getTimeline', ['idSite' => 1, 'period' => 'range', 'date' => '2024-01-01,2026-03-14'], "'period'");
    }

    /** A fixed axis (UI review D1): the whole day in hours and the whole week in days; what lies after now is future. */
    public function test_getTimeline_fixedAxis_withFutureCells(): void
    {
        // today: the hours before the current one are past, those after it future; at 23:xx UTC there is none after
        // it, so the test reads the clock instead of expecting a future last hour (it failed in CI at 23:32 UTC). A
        // call across midnight checks no hour: either day could be the one the API saw.
        $dayBefore = gmdate('Y-m-d');
        $hourBefore = (int) gmdate('G');
        $day = self::api('getTimeline', ['idSite' => 1, 'period' => 'day', 'date' => 'today']);
        $dayAfter = gmdate('Y-m-d');
        $hourAfter = (int) gmdate('G');
        $this->assertSame('hour', $day['grain']);
        $this->assertCount(24, $day['cells'], 'website 1 is in UTC: 24 hours');
        $states = array_column($day['cells'], 'state');
        if ($dayBefore === $dayAfter) {
            foreach ($states as $hour => $state) {
                if ($hour < $hourBefore) {
                    $this->assertNotSame('future', $state, "hour $hour is past");
                } elseif ($hour > $hourAfter) {
                    $this->assertSame('future', $state, "hour $hour is to come");
                }
            }
        }

        // the day after tomorrow: every hour is still to come, even when midnight passes during the test
        $later = self::api('getTimeline', ['idSite' => 1, 'period' => 'day', 'date' => gmdate('Y-m-d', time() + 2 * 86400)]);
        $this->assertCount(24, $later['cells']);
        $this->assertSame(['future'], array_values(array_unique(array_column($later['cells'], 'state'))));

        $week = self::api('getTimeline', ['idSite' => 1, 'period' => 'week', 'date' => '2026-03-11']);
        $this->assertSame(['day', 'local'], [$week['grain'], $week['days']], 'a past week: days, not hours');
        $this->assertCount(7, $week['cells']);
        $this->assertNotContains('future', array_column($week['cells'], 'state'));
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

    /**
     * With a cron every minute a result is stale after a few minutes; results checked from outside arrive when the
     * other plugin pulls them (hourly, and on a page view at most every 5 minutes): between two pulls they stay current.
     */
    public function test_status_outsideState_staysCurrentBetweenPulls(): void
    {
        $now = (int) strtotime('2026-03-14 12:00:00 UTC');
        $tracker = new IntervalTracker();
        foreach ([180, 120, 60] as $ago) {
            $tracker->recordCommandRun($now - $ago);
        }
        $at = static fn(int $ago): string => gmdate('Y-m-d H:i:s', $now - $ago);
        // the other plugin delivers: it reached its service a minute before the report's now
        self::outsideSource(true, $now - 60);
        (new StateStore())->upsertMany([new CheckResult($this->web, Outcome::UP, null, null, 200, ['total' => 120], null, $at(1200))], StateStore::LOCAL);
        (new ExternalResults())->setLatest([['idtarget' => $this->web, 'outcome' => Outcome::UP, 'error' => null, 'status' => 200,
            'ms_total' => 118, 'cert_not_after' => null, 'checked_at' => $at(1200)]]);

        $states = (new UptimeReport(static fn(): int => $now))->status(1, true)[0]['states'];
        $this->assertTrue($states['local']['stale'], 'a cron every minute: 20 minutes is no recent check');
        $this->assertFalse($states['external']['stale'], 'from outside: current until the next pull');

        (new ExternalResults())->setLatest([['idtarget' => $this->web, 'outcome' => Outcome::UP, 'error' => null, 'status' => 200,
            'ms_total' => 118, 'cert_not_after' => null, 'checked_at' => $at(ExternalResults::ACTIVE_WITHIN + 1800)]]);
        $states = (new UptimeReport(static fn(): int => $now))->status(1, true)[0]['states'];
        $this->assertTrue($states['external']['stale'], 'older than the other plugin stays active: no recent check');
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
        $this->assertSame([], self::api('getExternalSources'));
        self::outsideSource();
        $status = self::api('getStatus', ['idSite' => 1]);
        $this->assertSame(Outcome::DOWN, $status['targets'][0]['states']['external']['outcome']);
    }

    /**
     * B11 note: with no source that delivers (none registered, not set up, or stopped for more than 2 hours), getStatus
     * and getCertificates take no state and no certificate from old results checked from outside. While one delivers,
     * the certificate is the server's, else the one from outside.
     */
    public function test_getStatus_withoutActiveSource_ignoresOldResultsFromOutside(): void
    {
        $soon = gmdate('Y-m-d', time() + 2 * 86400);
        (new StateStore())->upsertMany([new CheckResult($this->web, Outcome::NOT_CHECKABLE, Outcome::CONNECT, null, null, [], null, gmdate('Y-m-d H:i:s'))], StateStore::LOCAL);
        self::outsideState($this->web, Outcome::DOWN, $soon);

        $read = static function (): array {
            $target = self::api('getStatus', ['idSite' => 1])['targets'][0];

            return [array_keys($target['states']), $target['certificate']['notAfter'] ?? null, count(self::api('getCertificates', ['idSite' => 1]))];
        };
        $this->assertSame([['local'], null, 0], $read(), 'no source registered');
        self::outsideSource(true, time() - ExternalResults::ACTIVE_WITHIN - 60);
        $this->assertSame([['local'], null, 0], $read(), 'its source stopped more than 2 hours ago');

        self::outsideSource();
        $this->assertSame([['local', 'external'], $soon, 1], $read(), 'while it delivers: both sides, the certificate from outside');

        (new StateStore())->upsertMany([new CheckResult($this->web, Outcome::UP, null, null, 200, [], '2099-01-01', gmdate('Y-m-d H:i:s'))], StateStore::LOCAL);
        $this->assertSame('2099-01-01', $read()[1], 'the server\'s own certificate first');
    }
}
