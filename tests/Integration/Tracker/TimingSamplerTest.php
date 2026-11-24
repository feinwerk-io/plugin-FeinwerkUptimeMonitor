<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration\Tracker;

use Piwik\Config;
use Piwik\Db;
use Piwik\Option;
use Piwik\Plugin\Manager;
use Piwik\Plugins\FeinwerkUptimeMonitor\FeinwerkUptimeMonitor;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\RollupStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Schema;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;
use Piwik\Tracker;

/**
 * The sampler on Matomo's real tracker (in-process).
 *
 * @group FeinwerkUptimeMonitor
 */
class TimingSamplerTest extends IntegrationTestCase
{
    public function setUp(): void
    {
        parent::setUp();
        (new FeinwerkUptimeMonitor())->install();
        Db::query('TRUNCATE TABLE ' . Schema::table(Schema::SAMPLE));
        Option::delete('lastTrackerCronRun');
    }

    private array $savedGet = [];

    public function tearDown(): void
    {
        $_GET = $this->savedGet;
        parent::tearDown();
    }

    /**
     * Matomo's in-process test tracker hands requests over without $_GET, so the hook is called the way the tracker
     * calls it at the end of a real request: with the request's parameters in $_GET.
     */
    private function endOfTrackingRequest(int $rate, bool $connected): void
    {
        $this->savedGet = $_GET;
        Config::getInstance()->FeinwerkUptimeMonitor = ['tracker_timing_sample' => $rate];
        $_GET = ['idsite' => '1', 'rec' => '1', 'action_name' => 'Start'];
        if ($connected) {
            Tracker::getDatabase();
        } else {
            Tracker::disconnectCachedDbConnection();
        }
        (new FeinwerkUptimeMonitor())->onTrackerEnd();
    }

    private static function samples(): int
    {
        return (int) Db::fetchOne('SELECT COUNT(*) FROM ' . Schema::table(Schema::SAMPLE));
    }

    public function test_pluginLoadsInTrackerMode(): void
    {
        $plugin = new FeinwerkUptimeMonitor();
        $this->assertTrue(Manager::getInstance()->isTrackerPlugin($plugin));
    }

    public function test_trackedRequest_writesOneSample(): void
    {
        $this->endOfTrackingRequest(1, true);
        $this->assertSame(1, self::samples());
    }

    public function test_requestThatRanTheScheduledTasks_writesNothing(): void
    {
        Option::set('lastTrackerCronRun', (string) time());
        $this->endOfTrackingRequest(1, true);
        $this->assertSame(0, self::samples(), 'the tasks\' time is no tracking time');
    }

    public function test_noTrackerConnection_writesNothing(): void
    {
        $this->endOfTrackingRequest(1, false);
        $this->assertSame(0, self::samples());
    }

    public function test_rateZero_writesNothing(): void
    {
        $this->endOfTrackingRequest(0, true);
        $this->assertSame(0, self::samples());
    }

    public function test_rollHours_putsProcessingIntoHour(): void
    {
        Db::query('INSERT INTO ' . Schema::table(Schema::SAMPLE) . ' (sampled_at, ms, is_bulk) VALUES (?, 80, 0), (?, 120, 0)',
            ['2026-03-14 10:10:00', '2026-03-14 10:20:00']);
        $processing = (new TargetStore())->processingTargetId();
        (new RollupStore())->rollHours('2026-03-14 10:00:00', '2026-03-14 11:00:00', 3600, $processing);
        $row = (new RollupStore())->hours([$processing], '2026-03-14 00:00:00', '2026-03-15 00:00:00')[0];
        $this->assertSame(2, (int) $row['samples']);
        $this->assertSame(80, (int) $row['ms_p50']);
        $this->assertSame(120, (int) $row['ms_p95']);
    }
}
