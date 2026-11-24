<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Runner;

use Piwik\Concurrency\Lock;
use Piwik\Concurrency\LockBackend;
use Piwik\Container\StaticContainer;

/**
 * Only one run at a time (hourly task, console command from a system cron, "check now").
 */
class RunLock
{
    private Lock $lock;

    public function __construct()
    {
        $this->lock = new Lock(StaticContainer::get(LockBackend::class), 'FwUptimeMonitorRun');
    }

    public function acquire(int $ttlSeconds): bool
    {
        return $this->lock->acquireLock('main', $ttlSeconds);
    }

    /** Extends the held lock (a long run). */
    public function refresh(int $ttlSeconds): void
    {
        $this->lock->expireLock($ttlSeconds);
    }

    public function release(): void
    {
        $this->lock->unlock();
    }
}
