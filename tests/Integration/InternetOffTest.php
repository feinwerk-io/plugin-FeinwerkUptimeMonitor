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
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\CheckRunner;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\DetectionJob;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\CheckStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\IncidentStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Schema;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\SystemSettings;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\DefaultTargets;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\HttpFixtureServer;
use Piwik\Plugins\FeinwerkUptimeMonitor\Widgets\ScreenProps;
use Piwik\Tests\Framework\Fixture;
use Piwik\Tests\Framework\Mock\FakeAccess;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;

/**
 * Peter, 2026-11-26, "2a": Matomo's [General] enable_internet_features = 0 is honoured. No check goes out, the results
 * are not checkable with the note internet_off, the screens and getStatus say why, and
 * [FeinwerkUptimeMonitor] checkWithInternetFeaturesOff = 1 lets the checks run anyway.
 *
 * @group FeinwerkUptimeMonitor
 */
class InternetOffTest extends IntegrationTestCase
{
    private static string $base;
    private array $general = [];

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
        $this->general = Config::getInstance()->General;
        Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Shop', self::$base . '/ok');
        $settings = new SystemSettings();
        $settings->allowPrivate->setValue(true);
        $settings->save();
        // the fixture website lives on 127.0.0.1
        Config::getInstance()->FeinwerkUptimeMonitor = ['allowLoopbackForWebsites' => 1];
        (new TargetStore())->syncDefaults([
            ['idSite' => 1, 'key' => self::webKey(), 'kind' => Kind::WEB, 'url' => self::$base . '/ok', 'extra' => ['matomoHost' => 'matomo.example.com']],
        ]);
    }

    public function tearDown(): void
    {
        Config::getInstance()->General = $this->general;
        Fixture::resetTranslations();
        parent::tearDown();
    }

    private static function webKey(): string
    {
        return DefaultTargets::webKey(self::$base . '/ok');
    }

    private static function internetFeatures(bool $on): void
    {
        $general = Config::getInstance()->General;
        $general['enable_internet_features'] = $on ? 1 : 0;
        Config::getInstance()->General = $general;
    }

    /** @return array<string, array> checkNow's results by target key */
    private static function checkNow(int $idSite): array
    {
        Option::deleteLike('fw_uptimemonitor_now_%');
        $answer = API::getInstance()->checkNow($idSite);
        self::assertFalse($answer['locked']);

        return array_column($answer['results'], null, 'targetKey');
    }

    public function test_internetFeaturesOff_noCheckGoesOut_theNoteSaysWhy(): void
    {
        $before = self::checkNow(1)[self::webKey()];
        $this->assertSame([Outcome::UP, null], [$before['outcome'], $before['note']], 'reachable before');

        self::internetFeatures(false);
        $results = self::checkNow(1);
        $this->assertArrayHasKey(self::webKey(), $results);
        foreach ($results as $key => $result) {
            $this->assertSame([Outcome::NOT_CHECKABLE, null, Outcome::INTERNET_OFF, null],
                [$result['outcome'], $result['error'], $result['note'], $result['httpStatus']], $key);
        }
        $state = array_column(API::getInstance()->getStatus(1)['targets'], null, 'targetKey')[self::webKey()]['states']['local'];
        $this->assertSame([Outcome::NOT_CHECKABLE, Outcome::INTERNET_OFF], [$state['outcome'], $state['note']], 'stored');
        $this->assertFalse(CheckRunner::capabilities()->internetAllowed());
    }

    public function test_theReason_isNamedInGetStatusAndOnTheScreens_whileTheSwitchIsOff(): void
    {
        $this->assertFalse(API::getInstance()->getStatus(1)['internetFeaturesOff']);
        $this->assertFalse(ScreenProps::for(1, 'page')['internetOff']);

        self::internetFeatures(false);
        $this->assertTrue(API::getInstance()->getStatus(1)['internetFeaturesOff']);
        $this->assertTrue(API::getInstance()->getStatus(0)['internetFeaturesOff']);
        $this->assertTrue(ScreenProps::for(1, 'page')['internetOff'], 'the uptime page');
        $this->assertTrue(ScreenProps::for(0, 'admin')['internetOff'], 'the admin page');
        FakeAccess::clearAccess(false, [1]);
        $this->assertTrue(API::getInstance()->getStatus(1)['internetFeaturesOff'], 'every viewer: it explains their addresses');
    }

    public function test_theOptIn_letsTheChecksRunAnyway(): void
    {
        self::internetFeatures(false);
        Config::getInstance()->FeinwerkUptimeMonitor = ['allowLoopbackForWebsites' => 1, 'checkWithInternetFeaturesOff' => 1];
        $web = self::checkNow(1)[self::webKey()];
        $this->assertSame([Outcome::UP, null], [$web['outcome'], $web['note']]);
        $this->assertFalse(API::getInstance()->getStatus(1)['internetFeaturesOff'], 'nothing to explain');
        $this->assertTrue(CheckRunner::capabilities()->internetAllowed());
    }

    /** reading the main page for the detection sends nothing either, and says why nothing was read */
    public function test_detectTargets_readsNothing_andSaysWhy(): void
    {
        $this->assertNull(API::getInstance()->detectTargets(1)['readError'], 'read');
        self::internetFeatures(false);
        $answer = API::getInstance()->detectTargets(1);
        $this->assertSame(Outcome::INTERNET_OFF, $answer['readError']);
        $this->assertSame([null, null, []], [$answer['found']['trackerUrl'], $answer['found']['jsUrl'], $answer['found']['containerUrls']]);
    }

    /**
     * L8 review of 5.4.0, NIT 8: with apply=1, a main page that could not be read changes nothing (the stored
     * suggestions stay) and the answer says applied false.
     */
    public function test_detectTargets_applyWhileNothingWasRead_changesNothing(): void
    {
        $stored = json_encode([1 => [['idSite' => 1, 'key' => 'proxy', 'kind' => Kind::PROXY, 'url' => 'https://elsewhere.example/p.php']]]);
        Option::set(DetectionJob::OPTION_SUGGESTIONS, $stored);
        self::internetFeatures(false);
        $answer = API::getInstance()->detectTargets(1, 1);
        $this->assertSame([Outcome::INTERNET_OFF, false], [$answer['readError'], $answer['applied']]);
        $this->assertSame($stored, Option::get(DetectionJob::OPTION_SUGGESTIONS), 'the suggestions stay');
    }

    /** the latest result of the website's address, as a run stores it (a result that sent nothing has no date) */
    private static function state(?string $note, ?string $certNotAfter): void
    {
        $id = (new TargetStore())->get(1, self::webKey())->id;
        (new StateStore())->upsertMany([new CheckResult($id, $note === null ? Outcome::UP : Outcome::NOT_CHECKABLE, null, $note,
            $note === null ? 200 : null, ['total' => 50], $certNotAfter, gmdate('Y-m-d H:i:s'))], StateStore::LOCAL);
    }

    /** @return array the website's row of getSitesOverview */
    private static function overviewRow(): array
    {
        return array_column(API::getInstance()->getSitesOverview(), null, 'idSite')[1];
    }

    /**
     * L8 review of 5.4.0, SHOULD 3: while nothing is sent (internet features off, PHP functions disabled, a name only
     * intl converts), the stored certificate date is not confirmed by any check and could be renewed long since. The
     * screens and the API do not judge it, as Sentinel's U03 answers unknown: no certificate, never "expired".
     */
    public function test_aStoredCertificateDate_isNotJudged_whileNothingIsSent(): void
    {
        $expired = gmdate('Y-m-d', time() - 10 * 86400);
        foreach (Outcome::NOTHING_SENT as $note) {
            self::state(null, $expired);
            $certificate = fn(): ?array => array_column(API::getInstance()->getStatus(1)['targets'], null, 'targetKey')[self::webKey()]['certificate'];
            $this->assertSame('expired', $certificate()['level'] ?? null, "$note: confirmed by a check");
            $this->assertSame('expired', self::overviewRow()['certificateLevel'], $note);

            self::state($note, null);
            $this->assertNull($certificate(), "$note: the date stays stored, but no check confirms it");
            $this->assertSame([], API::getInstance()->getCertificates(1), $note);
            $row = self::overviewRow();
            $this->assertSame([null, null], [$row['certificateDaysLeft'], $row['certificateLevel']], $note);
        }
    }

    /**
     * UI review of 5.4.0, B2: a result that sent nothing is no check. The admin page's "Last check" does not name it, so
     * an address that was never checked does not read as checked a minute ago.
     */
    public function test_aResultThatSentNothing_isNoCheck_onTheAdminPage(): void
    {
        self::state(null, null);
        $this->assertNotNull(self::overviewRow()['lastCheckedAt'], 'a check');
        self::state(Outcome::INTERNET_OFF, null);
        $this->assertNull(self::overviewRow()['lastCheckedAt'], 'nothing was sent');
    }

    /**
     * An outage that was open when the checks stopped ends there (as for an address that is no longer checked),
     * instead of growing for as long as the switch stays off.
     */
    public function test_anOpenOutage_endsWhenTheChecksStop(): void
    {
        $down = self::$base . '/db-down';
        (new TargetStore())->setUrl(1, DefaultTargets::webKey($down), Kind::WEB, $down, TargetStore::SOURCE_MANUAL, ['matomoHost' => 'matomo.example.com']);
        $this->assertSame(Outcome::DOWN, self::checkNow(1)[DefaultTargets::webKey($down)]['outcome']);
        $open = static fn(): array => array_values(array_filter(
            API::getInstance()->getIncidents(1, 'day', 'today', 'open'),
            static fn(array $i): bool => $i['targetKey'] === DefaultTargets::webKey($down)
        ));
        $this->assertCount(1, $open(), 'open');

        self::internetFeatures(false);
        self::checkNow(1);
        $this->assertSame([], $open(), 'ended when the checks stopped');
    }

    /**
     * Q1 (quick UI review before 5.4.0, decided under Peter's standing order): a run that sends nothing never moves an
     * outage's end. The outage ends at its last check that found the address down, not at the minute of the run that
     * sent nothing; getIncidents says so in `end`.
     */
    public function test_anOpenOutage_endsAtItsLastFailingCheck_notAtTheRunThatSentNothing(): void
    {
        $idTarget = (new TargetStore())->get(1, self::webKey())->id;
        $now = time();
        $first = gmdate('Y-m-d H:i:00', $now - 1200);
        $last = gmdate('Y-m-d H:i:00', $now - 600);
        foreach ([$first, $last] as $at) {
            $down = new CheckResult($idTarget, Outcome::DOWN, Outcome::HTTP_STATUS, null, 502, [], null, $at);
            (new CheckStore())->insertMany([$down]);
            (new IncidentStore())->apply([$down]);
        }

        self::internetFeatures(false);
        $this->assertSame(Outcome::INTERNET_OFF, self::checkNow(1)[self::webKey()]['note']);

        $outage = array_values(array_filter(
            API::getInstance()->getIncidents(1, 'range', 'last2', 'all'),
            static fn(array $i): bool => $i['targetKey'] === self::webKey()
        ));
        $iso = static fn(string $at): string => str_replace(' ', 'T', $at) . 'Z';
        $this->assertSame([[$iso($first), $iso($last), false, 600]],
            array_map(static fn(array $i): array => [$i['start'], $i['end'], $i['open'], $i['durationSeconds']], $outage));
    }
}
