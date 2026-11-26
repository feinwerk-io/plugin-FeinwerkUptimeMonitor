<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor;

use Piwik\Access;
use Piwik\ArchiveProcessor\Rules;
use Piwik\Log;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\CheckRunner;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\IntervalTracker;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\Runtime;

class Tasks extends \Piwik\Plugin\Tasks
{
    /** The hourly task leaves the checks to the console command while that ran in the last 50 minutes. */
    public const COMMAND_GRACE = 3000;

    public function schedule()
    {
        $this->hourly('runChecks', null, self::LOWEST_PRIORITY);
    }

    /**
     * The hourly checks from the Matomo server. Needs Matomo's cron (core:archive) or browser-triggered tasks.
     */
    public function runChecks(): void
    {
        $interval = new IntervalTracker();
        if ($interval->cronActive(time()) && $interval->commandRanWithin(time(), self::COMMAND_GRACE)) {
            return;
        }
        try {
            Access::doAsSuperUser(static function (): void {
                // with browser-triggered archiving a visitor's tracking request may wait for the scheduled tasks
                $runner = CheckRunner::create(null, Rules::isBrowserTriggerEnabled());
                // only with the functions the host has (ini_get, set_time_limit)
                Runtime::raiseTimeLimit(CheckRunner::capabilities(), $runner->budget() + CheckRunner::LOCK_MARGIN);
                $runner->run('task');
            });
        } catch (\Throwable $e) {
            Log::warning('FeinwerkUptimeMonitor: the checks failed: ' . $e->getMessage());
        }
    }
}
