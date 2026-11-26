<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration\External;

use Piwik\Db;
use Piwik\Piwik;
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
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\ContainerSource;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;

/**
 * The seam for results checked from outside, VERSION 2 (a shared interface): the targets as the runner checks them,
 * and the day rows that follow hour rows written for past days. Fixed times, no dependence on today.
 *
 * @group FeinwerkUptimeMonitor
 */
class ExternalResultsTest extends IntegrationTestCase
{
    /** "now" of the seam in these tests: 2026-03-17 12:00 UTC */
    private const NOW = 1773748800;

    private const CONTAINER_URL = 'https://m.example/js/container_AbC123.js';

    public function setUp(): void
    {
        parent::setUp();
        (new FeinwerkUptimeMonitor())->install();
        foreach (Schema::tables() as $table) {
            Db::query('TRUNCATE TABLE ' . Schema::table($table));
        }
    }

    private static function seam(?ContainerSource $containers = null, int $now = self::NOW): ExternalResults
    {
        return new ExternalResults(static fn(): int => $now, $containers);
    }

    /** Tag Manager active with these live containers */
    private static function tagManager(array $rows): ContainerSource
    {
        return new ContainerSource(static fn(): bool => true, static fn(): array => $rows);
    }

    private static function syncDefaults(): void
    {
        (new TargetStore())->syncDefaults([
            ['idSite' => 0, 'key' => Kind::UI, 'kind' => Kind::UI, 'url' => 'https://m.example/index.php?module=Login',
                'extra' => ['matomoHost' => 'm.example', 'loginHost' => 'sso.example']],
            ['idSite' => 1, 'key' => 'web:aa', 'kind' => Kind::WEB, 'url' => 'https://www.shop.example/',
                'extra' => ['matomoHost' => 'm.example', 'note' => 'not part of the seam']],
            ['idSite' => 1, 'key' => 'ctr:AbC123', 'kind' => Kind::CONTAINER, 'url' => self::CONTAINER_URL,
                'extra' => ['matomoHost' => 'm.example', 'idContainer' => 'AbC123', 'revision' => 3]],
        ]);
    }

    /** @return array<string, array> the seam's targets by key */
    private static function byKey(array $targets): array
    {
        return array_column($targets, null, 'key');
    }

    private static function hour(int $idTarget, string $hour, int $samples, int $up, ?int $max = 300, ?string $cert = null): array
    {
        return ['idtarget' => $idTarget, 'hour' => $hour, 'samples' => $samples, 'up_samples' => $up,
            'measured_seconds' => $samples * 60, 'up_seconds' => $up * 60, 'ms_p50' => 80, 'ms_p95' => 120,
            'ms_max' => $max, 'cert_not_after' => $cert];
    }

    public function test_version_is2(): void
    {
        $this->assertSame(2, ExternalResults::VERSION);
    }

    public function test_targets_listsEnabledAndDisabledWithLiveRevision(): void
    {
        self::syncDefaults();
        (new TargetStore())->setEnabled(1, 'web:aa', false);

        $targets = self::byKey(self::seam(self::tagManager([['idsite' => 1, 'idcontainer' => 'AbC123', 'revision' => '7']]))->targets());

        $this->assertSame(['ctr:AbC123', 'ui', 'web:aa'], self::sorted(array_keys($targets)));
        $ui = $targets['ui'];
        $this->assertSame(['idtarget', 'idsite', 'key', 'kind', 'url', 'url_source', 'extra', 'enabled', 'instanceAddress'], array_keys($ui));
        $this->assertIsInt($ui['idtarget']);
        $this->assertSame(0, $ui['idsite']);
        $this->assertSame(Kind::UI, $ui['kind']);
        $this->assertSame('https://m.example/index.php?module=Login', $ui['url']);
        $this->assertSame(TargetStore::SOURCE_DEFAULT, $ui['url_source']);
        $this->assertSame(['matomoHost' => 'm.example', 'loginHost' => 'sso.example'], $ui['extra']);
        $this->assertTrue($ui['enabled']);
        $this->assertTrue($ui['instanceAddress']);

        $this->assertSame(1, $targets['web:aa']['idsite']);
        $this->assertFalse($targets['web:aa']['enabled'], 'a switched-off address is listed, switched off');
        $this->assertFalse($targets['web:aa']['instanceAddress']);
        $this->assertSame(['matomoHost' => 'm.example'], $targets['web:aa']['extra'], 'only the four keys of the seam');

        $container = $targets['ctr:AbC123'];
        $this->assertSame(['matomoHost' => 'm.example', 'idContainer' => 'AbC123', 'revision' => 7], $container['extra'],
            'the revision that is live now, as an int, not the one of the last hourly sync');
        $this->assertTrue($container['instanceAddress'], 'a default container is served by Matomo');
    }

    public function test_targets_containerRevision_followsTagManager(): void
    {
        self::syncDefaults();

        $withoutTagManager = self::byKey(self::seam(new ContainerSource(static fn(): bool => false))->targets());
        $this->assertSame(3, $withoutTagManager['ctr:AbC123']['extra']['revision'], 'nothing known: the stored revision');

        $notLive = self::byKey(self::seam(self::tagManager([]))->targets());
        $this->assertSame(['matomoHost' => 'm.example', 'idContainer' => 'AbC123'], $notLive['ctr:AbC123']['extra'],
            'no longer published: checked by its id only, as the runner does');
        $this->assertNotNull((new TargetStore())->get(1, 'ctr:AbC123'), 'reading the targets retires nothing');
    }

    public function test_targets_skipsProcessingAndRetired(): void
    {
        self::syncDefaults();
        $store = new TargetStore();
        $store->processingTargetId();
        // the website's address is no longer a default: retired
        $store->syncDefaults([
            ['idSite' => 0, 'key' => Kind::UI, 'kind' => Kind::UI, 'url' => 'https://m.example/index.php?module=Login',
                'extra' => ['matomoHost' => 'm.example']],
            ['idSite' => 1, 'key' => 'ctr:AbC123', 'kind' => Kind::CONTAINER, 'url' => self::CONTAINER_URL,
                'extra' => ['matomoHost' => 'm.example', 'idContainer' => 'AbC123', 'revision' => 3]],
        ]);
        $store->setUrl(1, 'proxy', Kind::PROXY, 'https://www.shop.example/stats/', TargetStore::SOURCE_MANUAL);

        $keys = self::sorted(array_column((new ExternalResults())->targets(), 'key'));

        $this->assertSame(['ctr:AbC123', 'proxy', 'ui'], $keys);
        $proxy = self::byKey((new ExternalResults())->targets())['proxy'];
        $this->assertSame(TargetStore::SOURCE_MANUAL, $proxy['url_source']);
        $this->assertSame([], $proxy['extra']);
    }

    public function test_writeHours_rerollsThePastExternalDays(): void
    {
        $rollup = new RollupStore();
        // three days before NOW: the free plugin's daily run has summed the hours it had
        $rollup->upsertHours([self::hour(9, '2026-03-14 10:00:00', 60, 60) + ['source' => StateStore::EXTERNAL]]);
        $rollup->rollDays('2026-03-14', '2026-03-15', 3600, (new TargetStore())->processingTargetId());
        $this->assertSame(60, (int) $rollup->days([9], '2026-03-14', '2026-03-15', StateStore::EXTERNAL)[0]['samples']);

        // Pro catches up after Matomo was down: more hours of that day, and of the next one
        self::seam()->writeHours([
            self::hour(9, '2026-03-14 11:00:00', 60, 58, 900, '2027-01-31'),
            self::hour(9, '2026-03-15 08:00:00', 30, 30),
        ]);

        $days = $rollup->days([9], '2026-03-14', '2026-03-16', StateStore::EXTERNAL);
        $this->assertCount(2, $days);
        $this->assertSame('2026-03-14', $days[0]['day']);
        $this->assertSame(120, (int) $days[0]['samples'], 'the day row is the sum of its hours');
        $this->assertSame(118, (int) $days[0]['up_samples']);
        $this->assertSame(7200, (int) $days[0]['measured_seconds']);
        $this->assertSame(7080, (int) $days[0]['up_seconds']);
        $this->assertSame(900, (int) $days[0]['ms_max']);
        $this->assertSame('2027-01-31', $days[0]['cert_not_after']);
        $this->assertSame(30, (int) $days[1]['samples']);
    }

    public function test_writeHours_ofToday_rollsNoDay(): void
    {
        self::seam()->writeHours([self::hour(9, '2026-03-17 09:00:00', 60, 60)]);

        $rollup = new RollupStore();
        $this->assertCount(1, $rollup->hours([9], '2026-03-17 00:00:00', '2026-03-18 00:00:00', StateStore::EXTERNAL));
        $this->assertSame([], $rollup->days([9], '2026-03-17', '2026-03-18', 'all'), 'today is summed once it is over');
    }

    public function test_writeHours_rerollsOnlyTheTouchedDaysAndTargets(): void
    {
        $rollup = new RollupStore();
        // a day row the seam must not touch: another target, and another day of the same target
        Db::query('INSERT INTO ' . Schema::table(Schema::DAY) . ' (idtarget, day, source, samples) VALUES'
            . " (8, '2026-03-14', 'external', 1440), (9, '2026-03-13', 'external', 1440)");

        self::seam()->writeHours([self::hour(9, '2026-03-14 11:00:00', 60, 60)]);

        $this->assertSame(1440, (int) $rollup->days([8], '2026-03-14', '2026-03-15', StateStore::EXTERNAL)[0]['samples']);
        $this->assertSame(1440, (int) $rollup->days([9], '2026-03-13', '2026-03-14', StateStore::EXTERNAL)[0]['samples']);
        $this->assertSame(60, (int) $rollup->days([9], '2026-03-14', '2026-03-15', StateStore::EXTERNAL)[0]['samples']);
    }

    /** A day partly past the hour rows' 90 days would be summed from the hours left and shrink: it keeps its row. */
    public function test_writeHours_leavesDaysOlderThanTheHourRows(): void
    {
        Db::query('INSERT INTO ' . Schema::table(Schema::DAY) . ' (idtarget, day, source, samples) VALUES'
            . " (9, '2026-03-14', 'external', 1440)");
        $now = (int) strtotime('2026-06-12 12:00:00 UTC');

        self::seam(null, $now)->writeHours([self::hour(9, '2026-03-14 23:00:00', 60, 60)]);

        $this->assertSame(1440, (int) (new RollupStore())->days([9], '2026-03-14', '2026-03-15', StateStore::EXTERNAL)[0]['samples']);
    }

    public function test_writeHours_stillRefusesLocalRows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        self::seam()->writeHours([self::hour(9, '2026-03-14 10:00:00', 60, 60) + ['source' => StateStore::LOCAL]]);
    }

    /**
     * The source stops checking a target (its address became unreachable from outside, switched off there, stopped): it
     * reports no end for that outage, so it ends it here. Only its own outages of those targets.
     */
    public function test_endOutages_closesTheOutsideOutagesOfThoseTargets(): void
    {
        self::syncDefaults();
        $store = new TargetStore();
        $ids = [$store->get(0, Kind::UI)->id, $store->get(1, 'web:aa')->id];
        $incidents = new IncidentStore();
        (new ExternalResults())->writeIncidents(array_map(static fn(int $id): array => ['idtarget' => $id,
            'started_at' => '2026-03-17 10:00:00', 'ended_at' => null, 'cause' => 'http_status', 'detail' => 'HTTP 404',
            'down_samples' => 2], $ids));
        $incidents->upsert([['idtarget' => $ids[1], 'source' => StateStore::LOCAL, 'kind' => IncidentStore::OUTAGE,
            'started_at' => '2026-03-17 10:00:00', 'ended_at' => null, 'cause' => null, 'detail' => null, 'down_samples' => 2]]);

        (new ExternalResults())->endOutages([$ids[1]], '2026-03-17 11:30:00');
        (new ExternalResults())->endOutages([], '2026-03-17 11:30:00');

        $this->assertSame([$ids[0]], array_keys($incidents->openFor($ids, StateStore::EXTERNAL)));
        $this->assertCount(1, $incidents->openFor([$ids[1]], StateStore::LOCAL), 'the server\'s own outage stays');
    }

    /**
     * L8 review finding 1: a target the source no longer checks also loses its latest state from outside, so its row,
     * the answer line and the overview stop saying "down from outside" once its outage ended. The source's marker that
     * it cannot check the address (not_checkable, written just before) stays, and the server's state is untouched.
     */
    public function test_endOutages_alsoForgetsTheLatestStateFromOutside_exceptNotCheckable(): void
    {
        self::syncDefaults();
        $store = new TargetStore();
        $ui = $store->get(0, Kind::UI)->id;
        $web = $store->get(1, 'web:aa')->id;
        $states = new StateStore();
        $states->upsertMany([new CheckResult($web, Outcome::UP, null, null, 200, ['total' => 90], null, '2026-03-17 11:00:00')], StateStore::LOCAL);
        (new ExternalResults())->setLatest([
            ['idtarget' => $web, 'outcome' => Outcome::DOWN, 'error' => Outcome::HTTP_STATUS, 'status' => 403, 'ms_total' => 80,
                'cert_not_after' => null, 'checked_at' => '2026-03-17 11:00:00'],
            ['idtarget' => $ui, 'outcome' => Outcome::NOT_CHECKABLE, 'error' => Outcome::BLOCKED, 'status' => null, 'ms_total' => null,
                'cert_not_after' => null, 'checked_at' => '2026-03-17 11:00:00'],
        ]);

        (new ExternalResults())->endOutages([$web, $ui], '2026-03-17 11:30:00');

        $after = $states->forTargets([$web, $ui]);
        $this->assertArrayNotHasKey(StateStore::EXTERNAL, $after[$web] ?? [], 'no longer down from outside');
        $this->assertSame(Outcome::UP, $after[$web][StateStore::LOCAL]['outcome'], 'the server\'s state stays');
        $this->assertSame(Outcome::NOT_CHECKABLE, $after[$ui][StateStore::EXTERNAL]['outcome'], 'the marker stays');
    }

    /** L8 review finding 3a: an end before the start (the source's clock ahead of Matomo's) ends it at its start. */
    public function test_endOutages_neverEndsBeforeTheStart(): void
    {
        self::syncDefaults();
        $web = (new TargetStore())->get(1, 'web:aa')->id;
        (new ExternalResults())->writeIncidents([['idtarget' => $web, 'started_at' => '2026-03-17 10:00:00', 'ended_at' => null,
            'cause' => 'timeout', 'detail' => null, 'down_samples' => 1]]);

        (new ExternalResults())->endOutages([$web], '2026-03-17 09:58:00');

        $this->assertSame(['2026-03-17 10:00:00'], array_column(self::outages($web), 'ended_at'));
    }

    /**
     * L8 review finding 3b: an outage that the free plugin ended (switched off, retired, endOutages()) is never opened
     * again by a later pull that still carries it open; a reported end still replaces the one set here.
     */
    public function test_writeIncidents_neverReopensAnEndedOutage(): void
    {
        self::syncDefaults();
        $web = (new TargetStore())->get(1, 'web:aa')->id;
        $open = ['idtarget' => $web, 'started_at' => '2026-03-17 10:00:00', 'ended_at' => null, 'cause' => 'timeout',
            'detail' => null, 'down_samples' => 1];
        $seam = new ExternalResults();
        $seam->writeIncidents([$open]);
        $seam->endOutages([$web], '2026-03-17 10:30:00');

        $seam->writeIncidents([['down_samples' => 40] + $open]);
        $this->assertSame([['2026-03-17 10:30:00', '40']], array_map(static fn(array $r): array => [$r['ended_at'], (string) $r['down_samples']],
            self::outages($web)), 'still ended, the rest updated');

        $seam->writeIncidents([['ended_at' => '2026-03-17 10:45:00'] + $open]);
        $this->assertSame(['2026-03-17 10:45:00'], array_column(self::outages($web), 'ended_at'), 'the end the source reports');
    }

    /** L8 review finding 3c: a source that claims to have reached its service in the future does not count. */
    public function test_isActive_refusesAReachFarInTheFuture(): void
    {
        $source = ['name' => 'Outside checks', 'active' => true, 'reachedAt' => gmdate('Y-m-d\TH:i:s\Z', self::NOW + 120)];

        $this->assertTrue(ExternalResults::isActive($source, self::NOW), 'two minutes ahead: clocks differ a little');
        $this->assertFalse(ExternalResults::isActive(['reachedAt' => gmdate('Y-m-d\TH:i:s\Z', self::NOW + 600)] + $source, self::NOW));
    }

    /** L8 review finding 9: the one rule as a function of a list, for callers that already hold sources(). */
    public function test_activeOf_theFirstThatDeliversOfAList(): void
    {
        $reached = gmdate('Y-m-d\TH:i:s\Z', self::NOW - 60);
        $sources = [
            ['name' => 'Not set up', 'active' => false, 'reachedAt' => $reached],
            ['name' => 'Delivering', 'active' => true, 'reachedAt' => $reached],
            ['name' => 'Also delivering', 'active' => true, 'reachedAt' => $reached],
        ];

        $this->assertSame('Delivering', ExternalResults::activeOf($sources, self::NOW)['name']);
        $this->assertNull(ExternalResults::activeOf([$sources[0]], self::NOW));
        $this->assertNull(ExternalResults::activeOf([], self::NOW));
    }

    /** @return list<array> the outages from outside of one target */
    private static function outages(int $idTarget): array
    {
        return Db::fetchAll('SELECT started_at, ended_at, down_samples FROM ' . Schema::table(Schema::INCIDENT)
            . ' WHERE idtarget = ? AND source = ? ORDER BY started_at', [$idTarget, StateStore::EXTERNAL]);
    }

    public function test_sources_keepsSettingsUrl(): void
    {
        Piwik::addAction(ExternalResults::EVENT_SOURCES, static function (&$sources): void {
            $sources[] = ['name' => 'Outside checks', 'active' => 1, 'reachedAt' => '2026-03-17T11:58:00Z',
                'settingsUrl' => 'index.php?module=Outside&action=index&idSite=1&period=day&date=yesterday', 'alerts' => true,
                'resultsAt' => '2026-03-17T11:05:00Z'];
            $sources[] = ['name' => 'Script', 'active' => false, 'settingsUrl' => 'javascript:alert(1)', 'alerts' => 'yes', 'resultsAt' => 1773745500];
            $sources[] = ['name' => 'Elsewhere', 'active' => false, 'reachedAt' => '', 'settingsUrl' => 'https://elsewhere.example/'];
            $sources[] = ['active' => true];
            $sources[] = 'not an entry';
        });

        $sources = ExternalResults::sources();

        $this->assertSame([
            ['name' => 'Outside checks', 'active' => true, 'reachedAt' => '2026-03-17T11:58:00Z',
                'settingsUrl' => 'index.php?module=Outside&action=index&idSite=1&period=day&date=yesterday', 'alerts' => true,
                'resultsAt' => '2026-03-17T11:05:00Z'],
            ['name' => 'Script', 'active' => false, 'reachedAt' => null, 'settingsUrl' => null, 'alerts' => false, 'resultsAt' => null],
            ['name' => 'Elsewhere', 'active' => false, 'reachedAt' => null, 'settingsUrl' => null, 'alerts' => false, 'resultsAt' => null],
        ], $sources, 'only a relative address of this Matomo is a link; alerts only when it says true; resultsAt only a time');
    }

    public function test_activeSource_theFirstThatDelivers(): void
    {
        $this->assertNull(ExternalResults::activeSource(self::NOW), 'without a source');
        Piwik::addAction(ExternalResults::EVENT_SOURCES, static function (&$sources): void {
            $sources[] = ['name' => 'Stopped', 'active' => true, 'reachedAt' => gmdate('Y-m-d\TH:i:s\Z', self::NOW - 7300)];
            $sources[] = ['name' => 'Not set up', 'active' => false, 'reachedAt' => gmdate('Y-m-d\TH:i:s\Z', self::NOW - 60)];
        });
        $this->assertNull(ExternalResults::activeSource(self::NOW), 'registered, but none delivers');

        Piwik::addAction(ExternalResults::EVENT_SOURCES, static function (&$sources): void {
            $sources[] = ['name' => 'Delivering', 'active' => true, 'reachedAt' => gmdate('Y-m-d\TH:i:s\Z', self::NOW - 60), 'alerts' => true];
        });
        $active = ExternalResults::activeSource(self::NOW);
        $this->assertSame(['Delivering', true], [$active['name'], $active['alerts']]);
    }

    public function test_isActive_needsAReachWithinTwoHours(): void
    {
        $source = ['name' => 'Outside checks', 'active' => true, 'reachedAt' => gmdate('Y-m-d\TH:i:s\Z', self::NOW - 7000), 'settingsUrl' => null];

        $this->assertTrue(ExternalResults::isActive($source, self::NOW));
        $this->assertFalse(ExternalResults::isActive(['reachedAt' => gmdate('Y-m-d\TH:i:s\Z', self::NOW - 7300)] + $source, self::NOW));
        $this->assertFalse(ExternalResults::isActive(['active' => false] + $source, self::NOW));
        $this->assertFalse(ExternalResults::isActive(['reachedAt' => null] + $source, self::NOW));
    }

    private static function sorted(array $values): array
    {
        sort($values, SORT_STRING);

        return $values;
    }
}
