<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration;

use Piwik\Config;
use Piwik\Db;
use Piwik\Option;
use Piwik\Plugins\FeinwerkUptimeMonitor\API;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\FeinwerkUptimeMonitor;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Capabilities;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\CheckStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\IncidentStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Schema;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\SystemSettings;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\DefaultTargets;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\DisabledFunctions;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\HttpFixtureServer;
use Piwik\Plugins\FeinwerkUptimeMonitor\Widgets\ScreenProps;
use Piwik\Tests\Framework\Fixture;
use Piwik\Tests\Framework\Mock\FakeAccess;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;
use Piwik\Tracker;

/**
 * The API on a server whose PHP disables functions (Capabilities from Matomo's container stands for php.ini's
 * disable_functions): a customer's host answered every "check now" with "Call to undefined function
 * ...\Http\curl_multi_exec()".
 *
 * @group FeinwerkUptimeMonitor
 */
class DisabledFunctionsTest extends IntegrationTestCase
{
    private static string $base;
    /** @var string[] the functions this test's PHP "disables" */
    private static array $disabled = [];
    /** the capability check itself fails (anything that throws inside the Tracker.end handler) */
    private static bool $broken = false;

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
        return [
            'Piwik\\Access' => new FakeAccess(),
            Capabilities::class => new Capabilities(static function (string $name): bool {
                if (self::$broken) {
                    throw new \RuntimeException('the capability check failed');
                }
                return DisabledFunctions::except(self::$disabled)($name);
            }),
        ];
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
        Option::delete('lastTrackerCronRun');
        Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Shop', self::$base . '/page-proxy');
        $settings = new SystemSettings();
        $settings->allowPrivate->setValue(true);
        $settings->save();
        // the fixture website lives on 127.0.0.1
        \Piwik\Config::getInstance()->FeinwerkUptimeMonitor = ['allowLoopbackForWebsites' => 1];
        (new TargetStore())->syncDefaults([
            ['idSite' => 1, 'key' => DefaultTargets::webKey(self::$base . '/page-proxy'), 'kind' => Kind::WEB, 'url' => self::$base . '/page-proxy', 'extra' => ['matomoHost' => 'matomo.example.com']],
        ]);
    }

    public function tearDown(): void
    {
        self::$disabled = [];
        self::$broken = false;
        Fixture::resetTranslations();
        parent::tearDown();
    }

    /** @return array<string, array> checkNow's results by target key */
    private static function checkNow(int $idSite): array
    {
        $answer = API::getInstance()->checkNow($idSite);
        self::assertFalse($answer['locked']);

        return array_column($answer['results'], null, 'targetKey');
    }

    public function test_checkNow_onTheCustomersHost_checksThroughCurlExec(): void
    {
        self::$disabled = DisabledFunctions::SHARED_HOST;
        $web = self::checkNow(1)[DefaultTargets::webKey(self::$base . '/page-proxy')];
        $this->assertSame([Outcome::UP, 200, null], [$web['outcome'], $web['httpStatus'], $web['note']]);
    }

    /**
     * Robustness part 2: without curl (here every curl function disabled) the checks go out through PHP's streams, and
     * getStatus and the admin page say so to super users, as a neutral line: no PHP function is missing.
     */
    public function test_checkNow_withoutCurl_checksThroughTheStreams_andSaysSo(): void
    {
        self::$disabled = DisabledFunctions::CURL;
        $web = self::checkNow(1)[DefaultTargets::webKey(self::$base . '/page-proxy')];
        $this->assertSame([Outcome::UP, 200, null], [$web['outcome'], $web['httpStatus'], $web['note']]);
        $status = API::getInstance()->getStatus(1);
        $this->assertSame(['streams', []], [$status['transport'], $status['disabledPhpFunctions']]);
        $this->assertSame('streams', ScreenProps::for(0, 'admin')['transport']);
        $this->assertNull(ScreenProps::for(1, 'page')['transport'], 'the admin page only');

        FakeAccess::clearAccess(false, [1], [1], 'admin');
        $this->assertNull(API::getInstance()->getStatus(1)['transport'], 'super users only: it is about the server');
    }

    /** Each way by its name: curl_exec where curl_multi_exec is disabled, none where nothing can send. */
    public function test_getStatus_namesTheWayTheChecksTake(): void
    {
        foreach (['curl_multi' => [], 'curl_exec' => DisabledFunctions::SHARED_HOST,
            'none' => array_merge(DisabledFunctions::CURL, ['stream_select'])] as $way => $disabled) {
            self::$disabled = $disabled;
            $this->assertSame($way, API::getInstance()->getStatus(0)['transport'], $way);
        }
    }

    public function test_checkNow_withoutAnyWayToSendRequests_isNotCheckable_neverAnError(): void
    {
        self::$disabled = array_merge(DisabledFunctions::SHARED_HOST, ['curl_exec', 'stream_socket_client']);
        $results = self::checkNow(1);
        $this->assertNotEmpty($results);
        foreach ($results as $key => $result) {
            $this->assertSame([Outcome::NOT_CHECKABLE, null, Outcome::PHP_DISABLED], [$result['outcome'], $result['error'], $result['note']], $key);
        }
        // reading the website's main page now cannot fail either: nothing found
        $found = API::getInstance()->detectTargets(1)['found'];
        $this->assertSame([null, null, []], [$found['trackerUrl'], $found['jsUrl'], $found['containerUrls']]);
    }

    public function test_checkNow_withoutTheLookups_namesAreNotCheckable_addressesStillAre(): void
    {
        self::$disabled = ['gethostbynamel', 'dns_get_record'];
        $byName = 'http://localhost:' . HttpFixtureServer::port() . '/ok';
        (new TargetStore())->setUrl(1, DefaultTargets::webKey($byName), Kind::WEB, $byName, TargetStore::SOURCE_MANUAL, ['matomoHost' => 'matomo.example.com']);
        $results = self::checkNow(1);
        $this->assertSame([Outcome::UP, null], [$results[DefaultTargets::webKey(self::$base . '/page-proxy')]['outcome'], $results[DefaultTargets::webKey(self::$base . '/page-proxy')]['note']]);
        $this->assertSame([Outcome::NOT_CHECKABLE, Outcome::PHP_DISABLED], [$results[DefaultTargets::webKey($byName)]['outcome'], $results[DefaultTargets::webKey($byName)]['note']]);
    }

    /**
     * The reason, once: getStatus (super users) and the admin page name the functions the latest check run missed,
     * from function_exists only; a run that has them all again clears it.
     */
    public function test_theMissingFunctions_areNamedUntilARunHasThemAgain(): void
    {
        $this->assertSame([], API::getInstance()->getStatus(1)['disabledPhpFunctions'], 'before any run');
        self::$disabled = array_merge(DisabledFunctions::SHARED_HOST, ['curl_exec', 'stream_socket_client']);
        self::checkNow(1);
        $this->assertSame(['curl_exec', 'curl_multi_exec', 'stream_socket_client'], API::getInstance()->getStatus(1)['disabledPhpFunctions']);
        $this->assertSame(['curl_exec', 'curl_multi_exec', 'stream_socket_client'], API::getInstance()->getStatus(0)['disabledPhpFunctions']);
        $this->assertSame(['curl_exec', 'curl_multi_exec', 'stream_socket_client'], ScreenProps::for(0, 'admin')['disabledPhpFunctions']);
        $this->assertNull(ScreenProps::for(1, 'page')['disabledPhpFunctions'], 'the admin page only');

        FakeAccess::clearAccess(false, [1], [1], 'admin');
        $this->assertSame([], API::getInstance()->getStatus(1)['disabledPhpFunctions'], 'super users only: it is about the server');
        FakeAccess::clearAccess(true);

        self::$disabled = DisabledFunctions::SHARED_HOST;
        Option::deleteLike('fw_uptimemonitor_now_%');
        self::checkNow(1);
        $this->assertSame([], API::getInstance()->getStatus(1)['disabledPhpFunctions'], 'checks run again');
    }

    /**
     * Review 5.3.1 #2: a run whose results have no php_disabled (a "check now" of another website, a run of only the
     * due addresses) keeps the reason while this PHP still misses the functions; only a run that misses none clears it.
     */
    public function test_theMissingFunctions_stayNamedAfterARunOfOtherWebsites_untilNoneIsMissing(): void
    {
        self::$disabled = ['gethostbynamel', 'dns_get_record'];
        $byName = 'http://localhost:' . HttpFixtureServer::port() . '/ok';
        (new TargetStore())->setUrl(1, DefaultTargets::webKey($byName), Kind::WEB, $byName, TargetStore::SOURCE_MANUAL, ['matomoHost' => 'matomo.example.com']);
        self::checkNow(1);
        $this->assertSame(['gethostbynamel', 'dns_get_record'], API::getInstance()->getStatus(1)['disabledPhpFunctions']);

        // a second website with one address that needs no lookup, set before its check: the run just synced, so no
        // default (a Tag Manager container where that plugin is active, by name) joins it
        Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Blog', self::$base . '/ok');
        $blog = DefaultTargets::webKey(self::$base . '/ok');
        (new TargetStore())->setUrl(2, $blog, Kind::WEB, self::$base . '/ok', TargetStore::SOURCE_MANUAL, ['matomoHost' => 'matomo.example.com']);
        $results = self::checkNow(2);
        $this->assertSame([$blog], array_keys($results), 'a run without any php_disabled result');
        $this->assertSame([Outcome::UP, null], [$results[$blog]['outcome'], $results[$blog]['note']]);
        $this->assertSame(['gethostbynamel', 'dns_get_record'], API::getInstance()->getStatus(1)['disabledPhpFunctions'],
            'website 1 still cannot be checked by name');

        self::$disabled = [];
        Option::deleteLike('fw_uptimemonitor_now_%');
        self::checkNow(2);
        $this->assertSame([], API::getInstance()->getStatus(1)['disabledPhpFunctions'], 'nothing is missing any more');
    }

    /** sleep disabled: the retry pause of a down address must not throw before the run stores its results */
    public function test_checkNow_withoutSleep_aDownAddressKeepsItsResult(): void
    {
        self::$disabled = ['sleep', 'usleep'];
        $down = self::$base . '/db-down';
        (new TargetStore())->setUrl(1, DefaultTargets::webKey($down), Kind::WEB, $down, TargetStore::SOURCE_MANUAL, ['matomoHost' => 'matomo.example.com']);
        $start = microtime(true);
        $results = self::checkNow(1);
        $this->assertLessThan(4.0, microtime(true) - $start, 'no pause of 5 seconds without sleep and usleep');
        $this->assertSame([Outcome::DOWN, 500], [$results[DefaultTargets::webKey($down)]['outcome'], $results[DefaultTargets::webKey($down)]['httpStatus']]);
        $stored = array_column(API::getInstance()->getStatus(1)['targets'], null, 'targetKey')[DefaultTargets::webKey($down)];
        $this->assertSame(Outcome::DOWN, $stored['states']['local']['outcome'], 'stored');
    }

    /**
     * Q1 (quick UI review before 5.4.0, decided under Peter's standing order): a run that sends nothing because the
     * server's PHP has no way to send requests ends an open outage, as while Matomo's internet features are off, at its
     * last check that found the address down: never open for as long as the functions stay disabled, never at the
     * minute of the run that sent nothing.
     */
    public function test_anOpenOutage_endsAtItsLastFailingCheck_whenNothingCanBeSent(): void
    {
        $key = DefaultTargets::webKey(self::$base . '/page-proxy');
        $idTarget = (new TargetStore())->get(1, $key)->id;
        $now = time();
        $first = gmdate('Y-m-d H:i:00', $now - 1200);
        $last = gmdate('Y-m-d H:i:00', $now - 600);
        foreach ([$first, $last] as $at) {
            $down = new CheckResult($idTarget, Outcome::DOWN, Outcome::TIMEOUT, null, null, [], null, $at);
            (new CheckStore())->insertMany([$down]);
            (new IncidentStore())->apply([$down]);
        }

        self::$disabled = array_merge(DisabledFunctions::SHARED_HOST, ['curl_exec', 'stream_socket_client']);
        $this->assertSame(Outcome::PHP_DISABLED, self::checkNow(1)[$key]['note']);

        $outage = array_values(array_filter(
            API::getInstance()->getIncidents(1, 'range', 'last2', 'all'),
            static fn(array $i): bool => $i['targetKey'] === $key
        ));
        $iso = static fn(string $at): string => str_replace(' ', 'T', $at) . 'Z';
        $this->assertSame([[$iso($first), $iso($last), false, 600]],
            array_map(static fn(array $i): array => [$i['start'], $i['end'], $i['open'], $i['durationSeconds']], $outage));
    }

    /**
     * Matomo posts Tracker.end outside its own try: the handler samples with mt_rand where random_int is disabled,
     * and nothing in it ever reaches the tracking response.
     */
    public function test_trackerEnd_withoutRandomInt_samples_andNeverThrows(): void
    {
        Config::getInstance()->FeinwerkUptimeMonitor = ['tracker_timing_sample' => 1];
        $saved = $_GET;
        $_GET = ['idsite' => '1', 'rec' => '1', 'action_name' => 'Start'];
        try {
            Tracker::getDatabase();
            self::$disabled = ['random_int'];
            (new FeinwerkUptimeMonitor())->onTrackerEnd();
            $samples = static fn(): int => (int) Db::fetchOne('SELECT COUNT(*) FROM ' . Schema::table(Schema::SAMPLE));
            $this->assertSame(1, $samples(), 'mt_rand instead');

            self::$broken = true;
            (new FeinwerkUptimeMonitor())->onTrackerEnd();
            $this->assertSame(1, $samples(), 'nothing thrown, nothing written');
        } finally {
            $_GET = $saved;
        }
    }
}
