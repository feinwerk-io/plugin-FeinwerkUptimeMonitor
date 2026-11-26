<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration\Store;

use Piwik\Db;
use Piwik\Option;
use Piwik\Piwik;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\External\ExternalResults;
use Piwik\Plugins\FeinwerkUptimeMonitor\FeinwerkUptimeMonitor;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\CheckStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\IncidentStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Retention;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\RollupStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Schema;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Tests\Framework\Fixture;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;

/**
 * The plugin's tables and stores against a real database (fixed times, no dependence on today).
 *
 * @group FeinwerkUptimeMonitor
 */
class StoresTest extends IntegrationTestCase
{
    public function setUp(): void
    {
        parent::setUp();
        (new FeinwerkUptimeMonitor())->install();
        foreach (Schema::tables() as $table) {
            Db::query('TRUNCATE TABLE ' . Schema::table($table));
        }
    }

    private static function spec(int $idSite, string $key, string $kind, string $url): array
    {
        return ['idSite' => $idSite, 'key' => $key, 'kind' => $kind, 'url' => $url, 'extra' => ['matomoHost' => 'm.example']];
    }

    private static function result(int $idTarget, string $outcome, string $at, ?string $error = null, int $ms = 100): CheckResult
    {
        return new CheckResult($idTarget, $outcome, $error, null, $outcome === Outcome::UP ? 200 : 500,
            ['dns' => 1, 'connect' => 2, 'tls' => 3, 'ttfb' => 4, 'total' => $ms], '2027-01-31', $at);
    }

    private static function tableExists(string $name): bool
    {
        return (bool) Db::fetchOne('SHOW TABLES LIKE ?', [Schema::table($name)]);
    }

    public function test_installCreatesAndUninstallDropsTables_andOptions(): void
    {
        foreach (Schema::tables() as $table) {
            $this->assertTrue(self::tableExists($table), $table);
        }
        Option::set('fw_uptimemonitor_test', '1');
        (new FeinwerkUptimeMonitor())->uninstall();
        foreach (Schema::tables() as $table) {
            $this->assertFalse(self::tableExists($table), $table);
        }
        $this->assertFalse(Option::get('fw_uptimemonitor_test'));
        (new FeinwerkUptimeMonitor())->install();
    }

    public function test_syncDefaults_neverOverwritesManual_andRetiresMissing(): void
    {
        $store = new TargetStore();
        $store->syncDefaults([self::spec(0, 'tracker', Kind::TRACKER, 'https://m.example/matomo.php'), self::spec(1, 'web:aa', Kind::WEB, 'https://a.example/')]);
        $store->setUrl(0, 'tracker', Kind::TRACKER, 'https://m.example/js/tracker.php', TargetStore::SOURCE_MANUAL);

        $store->syncDefaults([self::spec(0, 'tracker', Kind::TRACKER, 'https://m2.example/matomo.php')]);

        $this->assertSame('https://m.example/js/tracker.php', $store->get(0, 'tracker')->url);
        $this->assertSame(TargetStore::SOURCE_MANUAL, $store->get(0, 'tracker')->urlSource);
        $this->assertSame([], $store->forSite(1), 'the default of a deleted site is retired');

        $store->syncDefaults([self::spec(1, 'web:aa', Kind::WEB, 'https://a.example/')]);
        $this->assertCount(1, $store->forSite(1), 'and comes back');
    }

    public function test_syncDefaults_updatesDefaultUrl_andResetsFirstUp(): void
    {
        $store = new TargetStore();
        $store->syncDefaults([self::spec(1, 'web:aa', Kind::WEB, 'https://a.example/')]);
        $id = $store->get(1, 'web:aa')->id;
        $store->markChecked([self::result($id, Outcome::UP, '2026-03-14 10:00:00')]);
        $this->assertSame('2026-03-14 10:00:00', $store->get(1, 'web:aa')->firstUpAt);

        $store->syncDefaults([self::spec(1, 'web:aa', Kind::WEB, 'https://b.example/')]);
        $this->assertSame('https://b.example/', $store->get(1, 'web:aa')->url);
        $this->assertNull($store->get(1, 'web:aa')->firstUpAt, 'a new URL has no success yet');
    }

    public function test_retiredDisabledOrRemovedTargets_closeTheirOutages(): void
    {
        $store = new TargetStore();
        $store->syncDefaults([self::spec(1, 'web:aa', Kind::WEB, 'https://a.example/'), self::spec(1, 'web:bb', Kind::WEB, 'https://b.example/')]);
        $store->setUrl(1, 'proxy', Kind::PROXY, 'https://a.example/matomo.php', TargetStore::SOURCE_MANUAL);
        $ids = [$store->get(1, 'web:aa')->id, $store->get(1, 'web:bb')->id, $store->get(1, 'proxy')->id];
        $incidents = new IncidentStore();
        $incidents->apply(array_map(static fn(int $id) => self::result($id, Outcome::DOWN, '2026-03-14 10:00:00'), $ids));
        (new StateStore())->upsertMany([self::result($ids[2], Outcome::DOWN, '2026-03-14 10:00:00')], StateStore::LOCAL);

        $store->syncDefaults([self::spec(1, 'web:bb', Kind::WEB, 'https://b.example/')]); // web:aa retired
        $store->setEnabled(1, 'web:bb', false);
        $store->delete(1, 'proxy');

        $this->assertSame([], $incidents->openFor($ids), 'no outage stays open for ever');
        $this->assertArrayNotHasKey($ids[2], (new StateStore())->all(), 'a removed target has no state');
    }

    /** An outage from outside ends when its source says so: an address change closes only the server's own outage. */
    public function test_changedAddress_closesOnlyTheServersOutage(): void
    {
        $store = new TargetStore();
        $store->syncDefaults([self::spec(1, 'web:aa', Kind::WEB, 'https://a.example/'), self::spec(1, 'web:bb', Kind::WEB, 'https://b.example/')]);
        $ids = [$store->get(1, 'web:aa')->id, $store->get(1, 'web:bb')->id];
        $incidents = new IncidentStore();
        $incidents->apply(array_map(static fn(int $id) => self::result($id, Outcome::DOWN, '2026-03-14 10:00:00'), $ids));
        $incidents->upsert(array_map(static fn(int $id): array => ['idtarget' => $id, 'source' => StateStore::EXTERNAL,
            'kind' => IncidentStore::OUTAGE, 'started_at' => '2026-03-14 09:59:00', 'ended_at' => null, 'cause' => 'http_status',
            'detail' => 'HTTP 404', 'down_samples' => 2], $ids));

        $store->setUrl(1, 'web:aa', Kind::WEB, 'https://a.example/new', TargetStore::SOURCE_MANUAL);
        $store->syncDefaults([self::spec(1, 'web:aa', Kind::WEB, 'https://a.example/'), self::spec(1, 'web:bb', Kind::WEB, 'https://b2.example/')]);

        $this->assertSame([], $incidents->openFor($ids, StateStore::LOCAL), 'the server checks the new address from scratch');
        $this->assertCount(2, $incidents->openFor($ids, StateStore::EXTERNAL), 'the source closes its own outage after its next check');
    }

    public function test_removedTargets_closeTheOutagesFromOutsideToo(): void
    {
        $store = new TargetStore();
        $store->syncDefaults([self::spec(1, 'web:aa', Kind::WEB, 'https://a.example/'), self::spec(1, 'web:bb', Kind::WEB, 'https://b.example/')]);
        $store->setUrl(1, 'proxy', Kind::PROXY, 'https://a.example/matomo.php', TargetStore::SOURCE_MANUAL);
        $ids = [$store->get(1, 'web:aa')->id, $store->get(1, 'web:bb')->id, $store->get(1, 'proxy')->id];
        $incidents = new IncidentStore();
        $incidents->upsert(array_map(static fn(int $id): array => ['idtarget' => $id, 'source' => StateStore::EXTERNAL,
            'kind' => IncidentStore::OUTAGE, 'started_at' => '2026-03-14 09:59:00', 'ended_at' => null, 'cause' => null,
            'detail' => null, 'down_samples' => 2], $ids));

        $store->syncDefaults([self::spec(1, 'web:bb', Kind::WEB, 'https://b.example/')]); // web:aa retired
        $store->setEnabled(1, 'web:bb', false);
        $store->delete(1, 'proxy');

        // the source stops checking them and never reports an end: closed here
        $this->assertSame([], $incidents->openFor($ids));
    }

    public function test_targetsChanged_isPostedForEveryRealChange_only(): void
    {
        $posted = 0;
        Piwik::addAction(ExternalResults::EVENT_TARGETS_CHANGED, static function () use (&$posted): void {
            $posted++;
        });
        $count = static function (callable $change) use (&$posted): int {
            $before = $posted;
            $change();

            return $posted - $before;
        };
        $idSite = Fixture::createWebsite('2026-01-01 00:00:00', 0, 'A', 'https://a.example/');
        $store = new TargetStore();
        $specs = [self::spec(0, 'ui', Kind::UI, 'https://m.example/'), self::spec($idSite, 'web:aa', Kind::WEB, 'https://a.example/')];

        $this->assertSame(1, $count(fn() => $store->syncDefaults($specs)), 'new defaults');
        $this->assertSame(0, $count(fn() => $store->syncDefaults($specs)), 'the hourly sync without a change');
        $specs[1]['url'] = 'https://a2.example/';
        $this->assertSame(1, $count(fn() => $store->syncDefaults($specs)), 'a website address changed');
        $specs[1]['extra'] = ['matomoHost' => 'm2.example'];
        $this->assertSame(1, $count(fn() => $store->syncDefaults($specs)), 'what the check reads changed');
        $this->assertSame(1, $count(fn() => $store->syncDefaults([$specs[0]])), 'a default retired');
        $this->assertSame(1, $count(fn() => $store->syncDefaults($specs)), 'and back');
        $setProxy = fn() => $store->setUrl($idSite, 'proxy', Kind::PROXY, 'https://a.example/m.php', TargetStore::SOURCE_MANUAL);
        $this->assertSame(1, $count($setProxy));
        // L8 review finding 2: Save in the address editor without a change, or addTarget with the stored address
        $this->assertSame(0, $count($setProxy), 'the same address again');
        $this->assertSame(1, $count(fn() => $store->setEnabled($idSite, 'proxy', false)));
        $this->assertSame(0, $count(fn() => $store->setEnabled($idSite, 'proxy', false)), 'already off');
        $this->assertSame(1, $count(fn() => $store->setEnabled($idSite, 'proxy', true)));
        $proxy = $store->get($idSite, 'proxy')->id;
        $this->assertSame(1, $count(fn() => $store->retire([$proxy])), 'detection retires a container');
        $this->assertSame(0, $count(fn() => $store->retire([$proxy])), 'already retired');
        $this->assertSame(1, $count($setProxy), 'the same address brings a retired target back');
        $this->assertSame(1, $count(fn() => $store->delete($idSite, 'proxy')));
        $this->assertSame(0, $count(fn() => $store->delete($idSite, 'proxy')), 'nothing to delete');
        $this->assertSame(1, $count(fn() => $store->deleteSite($idSite)));
        $this->assertSame(0, $count(fn() => $store->deleteSite($idSite)), 'nothing left');
        $this->assertSame(0, $count(fn() => $store->markChecked([self::result($store->get(0, 'ui')->id, Outcome::UP, '2026-03-14 10:00:00')])),
            'a check changes no target');
    }

    public function test_targetsChanged_aListenerThatFailsNeverStopsAChange(): void
    {
        Piwik::addAction(ExternalResults::EVENT_TARGETS_CHANGED, static function (): void {
            throw new \RuntimeException('listener failed');
        });
        $store = new TargetStore();
        $store->setUrl(1, 'proxy', Kind::PROXY, 'https://a.example/m.php', TargetStore::SOURCE_MANUAL);
        $this->assertSame('https://a.example/m.php', $store->get(1, 'proxy')->url);
    }

    public function test_changedAddress_forgetsStateAndCertificate(): void
    {
        $store = new TargetStore();
        $store->syncDefaults([self::spec(1, 'web:aa', Kind::WEB, 'https://a.example/')]);
        $id = $store->get(1, 'web:aa')->id;
        (new StateStore())->upsertMany([self::result($id, Outcome::UP, '2026-03-14 10:00:00')], StateStore::LOCAL);
        $store->setUrl(1, 'web:aa', Kind::WEB, 'http://a.example/', TargetStore::SOURCE_MANUAL);
        $this->assertArrayNotHasKey($id, (new StateStore())->all());
    }

    public function test_disabledTarget_staysDisabledThroughSync(): void
    {
        $store = new TargetStore();
        $store->syncDefaults([self::spec(1, 'web:aa', Kind::WEB, 'https://a.example/')]);
        $store->setEnabled(1, 'web:aa', false);
        $store->syncDefaults([self::spec(1, 'web:aa', Kind::WEB, 'https://a.example/')]);
        $this->assertFalse($store->get(1, 'web:aa')->enabled);
        $this->assertSame([], $store->due());
    }

    public function test_due_neverCheckedFirst(): void
    {
        Fixture::createWebsite('2026-01-01 00:00:00', 0, 'A', 'https://a.example/');
        $store = new TargetStore();
        $store->syncDefaults([self::spec(1, 'web:aa', Kind::WEB, 'https://a.example/'), self::spec(1, 'web:bb', Kind::WEB, 'https://b.example/')]);
        $store->markChecked([self::result($store->get(1, 'web:aa')->id, Outcome::UP, '2026-03-14 10:00:00')]);
        $this->assertSame(['web:bb', 'web:aa'], array_map(static fn($t) => $t->key, $store->due()));
    }

    /** Review L8 #4: a deleted website's targets are neither checked nor kept. */
    public function test_deletedWebsite_targetsAreNotDue_andGoWithTheSite(): void
    {
        $idSite = Fixture::createWebsite('2026-01-01 00:00:00', 0, 'A', 'https://a.example/');
        $store = new TargetStore();
        $store->syncDefaults([self::spec(0, 'ui', Kind::UI, 'https://m.example/'), self::spec($idSite, 'web:aa', Kind::WEB, 'https://a.example/'),
            self::spec(999, 'web:zz', Kind::WEB, 'https://gone.example/')]);
        $store->setUrl($idSite, 'proxy', Kind::PROXY, 'https://a.example/m.php', TargetStore::SOURCE_MANUAL);
        $this->assertSame(['ui', 'web:aa', 'proxy'], array_map(static fn($t) => $t->key, $store->due()), 'website 999 does not exist');

        $proxy = $store->get($idSite, 'proxy')->id;
        (new IncidentStore())->apply([self::result($proxy, Outcome::DOWN, '2026-03-14 10:00:00', Outcome::TIMEOUT)], StateStore::LOCAL);
        (new FeinwerkUptimeMonitor())->onSiteDeleted($idSite);
        $this->assertSame([], $store->forSite($idSite));
        $this->assertSame(0, (int) Db::fetchOne('SELECT COUNT(*) FROM ' . Schema::table(Schema::INCIDENT) . ' WHERE ended_at IS NULL'));
        $this->assertNotNull($store->get(0, 'ui'), 'Matomo itself stays');
    }

    public function test_processingSince_countsAll_percentilesFromTheNewest(): void
    {
        $rows = [];
        for ($i = 0; $i < 1000; $i++) {
            $rows[] = ['2026-03-14 10:00:' . sprintf('%02d', $i % 60), 1000, 0];
        }
        for ($i = 0; $i < RollupStore::PERCENTILE_SAMPLES; $i++) {
            $rows[] = ['2026-03-14 10:30:' . sprintf('%02d', $i % 60), 10, 0];
        }
        $rows[] = ['2026-03-14 10:45:00', 5000, 1]; // bulk: not part of the processing time
        foreach (array_chunk($rows, 1000) as $chunk) {
            Db::query('INSERT INTO ' . Schema::table(Schema::SAMPLE) . ' (sampled_at, ms, is_bulk) VALUES '
                . implode(',', array_fill(0, count($chunk), '(?, ?, ?)')), array_merge(...$chunk));
        }
        $last = (new RollupStore())->processingSince('2026-03-14 09:59:00');
        $this->assertSame(1000 + RollupStore::PERCENTILE_SAMPLES, $last['samples']);
        $this->assertSame(10, $last['p50'], 'the newest samples');
        $this->assertSame(1000, $last['max'], 'the maximum over all of them');
    }

    public function test_state_upsertKeepsOneRowPerTargetAndSource(): void
    {
        $states = new StateStore();
        $states->upsertMany([self::result(5, Outcome::UP, '2026-03-14 10:00:00')], StateStore::LOCAL);
        $states->upsertMany([self::result(5, Outcome::DOWN, '2026-03-14 11:00:00', Outcome::TIMEOUT)], StateStore::LOCAL);
        $states->upsertMany([self::result(5, Outcome::UP, '2026-03-14 11:01:00')], StateStore::EXTERNAL);

        $all = $states->all();
        $this->assertSame(Outcome::DOWN, $all[5][StateStore::LOCAL]['outcome']);
        $this->assertSame(Outcome::TIMEOUT, $all[5][StateStore::LOCAL]['error']);
        $this->assertSame(Outcome::UP, $all[5][StateStore::EXTERNAL]['outcome']);
        $this->assertSame(2, (int) Db::fetchOne('SELECT COUNT(*) FROM ' . Schema::table(Schema::STATE)));
    }

    public function test_incident_opensCountsAndCloses(): void
    {
        $incidents = new IncidentStore();
        $incidents->apply([self::result(5, Outcome::DOWN, '2026-03-14 10:00:00', Outcome::HTTP_STATUS)]);
        $incidents->apply([self::result(5, Outcome::DOWN, '2026-03-14 11:00:00', Outcome::HTTP_STATUS)]);
        $open = $incidents->openFor([5]);
        $this->assertSame('2026-03-14 10:00:00', $open[5]['local']['started_at']);
        $this->assertSame(2, (int) $open[5]['local']['down_samples']);
        $this->assertSame('HTTP 500', $open[5]['local']['detail']);

        $incidents->apply([self::result(5, Outcome::UP, '2026-03-14 12:00:00')]);
        $this->assertSame([], $incidents->openFor([5]));
        $row = Db::fetchRow('SELECT * FROM ' . Schema::table(Schema::INCIDENT));
        $this->assertSame('2026-03-14 12:00:00', $row['ended_at']);
    }

    public function test_notCheckable_opensNothing(): void
    {
        (new IncidentStore())->apply([self::result(5, Outcome::NOT_CHECKABLE, '2026-03-14 10:00:00', Outcome::CONNECT)]);
        $this->assertSame(0, (int) Db::fetchOne('SELECT COUNT(*) FROM ' . Schema::table(Schema::INCIDENT)));
    }

    public function test_find_bySiteStateAndWindow_withGapsOnTheInstance(): void
    {
        $targets = new TargetStore();
        $targets->syncDefaults([self::spec(0, 'ui', Kind::UI, 'https://m.example/'), self::spec(1, 'web:aa', Kind::WEB, 'https://a.example/')]);
        $ui = $targets->get(0, 'ui')->id;
        $web = $targets->get(1, 'web:aa')->id;
        $incidents = new IncidentStore();
        $incidents->apply([self::result($ui, Outcome::DOWN, '2026-03-14 10:00:00'), self::result($web, Outcome::DOWN, '2026-03-14 10:00:00')]);
        $incidents->apply([self::result($web, Outcome::UP, '2026-03-14 11:00:00')]);
        $incidents->recordGap('2026-03-13 01:00:00', '2026-03-13 05:00:00');

        $site = $incidents->find(1, '2026-03-14 00:00:00', '2026-03-15 00:00:00', 'all', 100);
        $this->assertCount(1, $site);
        $this->assertSame('web:aa', $site[0]['target_key']);
        $this->assertCount(0, $incidents->find(1, '2026-03-14 00:00:00', '2026-03-15 00:00:00', 'open', 100));

        $instance = $incidents->find(0, '2026-03-13 00:00:00', '2026-03-15 00:00:00', 'all', 100);
        $this->assertSame([IncidentStore::OUTAGE, IncidentStore::GAP], array_column($instance, 'kind'));
    }

    public function test_rollHours_percentilesCoverageAndProcessing(): void
    {
        $checks = new CheckStore();
        $results = [];
        for ($m = 0; $m < 60; $m += 10) {
            $results[] = self::result(5, $m === 30 ? Outcome::DOWN : Outcome::UP, sprintf('2026-03-14 10:%02d:00', $m), null, 100 + $m);
        }
        $checks->insertMany($results);
        Db::query('INSERT INTO ' . Schema::table(Schema::SAMPLE) . ' (sampled_at, ms, is_bulk) VALUES (?, 40, 0), (?, 60, 0), (?, 900, 1)',
            ['2026-03-14 10:05:00', '2026-03-14 10:15:00', '2026-03-14 10:20:00']);
        $processing = (new TargetStore())->processingTargetId();

        $rollup = new RollupStore();
        $rollup->rollHours('2026-03-14 10:00:00', '2026-03-14 11:00:00', 600, $processing);

        $row = $rollup->hours([5], '2026-03-14 00:00:00', '2026-03-15 00:00:00')[0];
        $this->assertSame('2026-03-14 10:00:00', $row['hour']);
        $this->assertSame(6, (int) $row['samples']);
        $this->assertSame(5, (int) $row['up_samples']);
        $this->assertSame(3600, (int) $row['measured_seconds']);
        $this->assertSame(3000, (int) $row['up_seconds']);
        $this->assertSame(120, (int) $row['ms_p50']); // nearest rank of 100, 110, 120, 140, 150
        $this->assertSame(150, (int) $row['ms_max']);
        $this->assertSame('2027-01-31', $row['cert_not_after']);

        $p = $rollup->hours([$processing], '2026-03-14 00:00:00', '2026-03-15 00:00:00')[0];
        $this->assertSame(2, (int) $p['samples']);
        $this->assertSame(1, (int) $p['bulk_samples']);
        $this->assertSame(40, (int) $p['ms_p50']);
        $this->assertSame(60, (int) $p['ms_max']);

        // idempotent
        $rollup->rollHours('2026-03-14 10:00:00', '2026-03-14 11:00:00', 600, $processing);
        $this->assertCount(1, $rollup->hours([5], '2026-03-14 00:00:00', '2026-03-15 00:00:00'));
    }

    public function test_rollDays_sumsExternalHours(): void
    {
        $rollup = new RollupStore();
        $rollup->upsertHours([
            ['idtarget' => 9, 'hour' => '2026-03-14 10:00:00', 'source' => StateStore::EXTERNAL, 'samples' => 60, 'up_samples' => 60,
                'measured_seconds' => 3600, 'up_seconds' => 3600, 'ms_p50' => 80, 'ms_p95' => 120, 'ms_max' => 300, 'cert_not_after' => null],
            ['idtarget' => 9, 'hour' => '2026-03-14 11:00:00', 'source' => StateStore::EXTERNAL, 'samples' => 60, 'up_samples' => 58,
                'measured_seconds' => 3600, 'up_seconds' => 3480, 'ms_p50' => 90, 'ms_p95' => 200, 'ms_max' => 500, 'cert_not_after' => '2027-01-31'],
        ]);
        $rollup->rollDays('2026-03-14', '2026-03-15', 3600, (new TargetStore())->processingTargetId());
        $day = $rollup->days([9], '2026-03-14', '2026-03-15', StateStore::EXTERNAL)[0];
        $this->assertSame(120, (int) $day['samples']);
        $this->assertSame(7080, (int) $day['up_seconds']);
        $this->assertSame(500, (int) $day['ms_max']);
        $this->assertSame('2027-01-31', $day['cert_not_after']);
    }

    public function test_rollDays_processingFromHourRows(): void
    {
        $processing = (new TargetStore())->processingTargetId();
        Db::query('INSERT INTO ' . Schema::table(Schema::HOUR) . ' (idtarget, hour, source, samples, bulk_samples, ms_p50, ms_p95, ms_max)'
            . " VALUES (?, '2026-03-14 10:00:00', 'local', 30, 2, 40, 90, 200), (?, '2026-03-14 11:00:00', 'local', 10, 0, 60, 120, 400)",
            [$processing, $processing]);
        (new RollupStore())->rollDays('2026-03-14', '2026-03-15', 3600, $processing);
        $day = (new RollupStore())->days([$processing], '2026-03-14', '2026-03-15')[0];
        $this->assertSame(40, (int) $day['samples']);
        $this->assertSame(2, (int) $day['bulk_samples']);
        $this->assertSame(400, (int) $day['ms_max']);
        $this->assertSame(40, (int) $day['ms_p50']);
    }

    public function test_retention_deletesInChunks_keepsOpenIncidents(): void
    {
        $checks = new CheckStore();
        $rows = [];
        for ($i = 0; $i < 7; $i++) {
            $rows[] = self::result(5, Outcome::UP, '2026-01-01 00:0' . $i . ':00');
        }
        $rows[] = self::result(5, Outcome::UP, '2026-03-14 10:00:00');
        $checks->insertMany($rows);
        (new IncidentStore())->apply([self::result(6, Outcome::DOWN, '2024-01-01 00:00:00')]);

        $deleted = (new Retention())->run(new \DateTimeImmutable('2026-03-15 00:00:00', new \DateTimeZone('UTC')), 3);

        $this->assertSame(7, $deleted);
        $this->assertSame(1, (int) Db::fetchOne('SELECT COUNT(*) FROM ' . Schema::table(Schema::CHECK)));
        $this->assertSame(1, (int) Db::fetchOne('SELECT COUNT(*) FROM ' . Schema::table(Schema::INCIDENT)), 'open incidents stay');
    }
}
