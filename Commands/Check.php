<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Commands;

use Piwik\Access;
use Piwik\Plugin\ConsoleCommand;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\CheckRunner;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\IntervalTracker;

/**
 * Runs the checks now. Meant for a system cron every 1 to 5 minutes (spec 6.3); the hourly task then pauses.
 */
class Check extends ConsoleCommand
{
    protected function configure()
    {
        $this->setName('feinwerkuptimemonitor:check');
        $this->setDescription('Runs the uptime checks now; for a system cron every 1 to 5 minutes.');
        $this->addRequiredValueOption('idsite', null, 'Only the targets of this website (0: the Matomo targets).');
        $this->addRequiredValueOption('budget', null, 'Time budget in seconds (default: run_budget_seconds, 60).');
    }

    protected function doExecute(): int
    {
        $input = $this->getInput();
        $output = $this->getOutput();
        $idSite = $input->getOption('idsite');
        $budget = $input->getOption('budget');
        $onlyIdSite = $idSite === null || $idSite === '' ? null : (int) $idSite;

        $report = null;
        Access::doAsSuperUser(static function () use (&$report, $budget, $onlyIdSite): void {
            $report = CheckRunner::create($budget === null || $budget === '' ? null : max(5, (int) $budget))->run('command', $onlyIdSite);
        });

        // only runs that really checked count towards the cron's spacing (a run that met the lock did nothing)
        if (!$report->locked && $onlyIdSite === null) {
            (new IntervalTracker())->recordCommandRun(time());
        }
        if ($report->locked) {
            // a run is still going (an overlapping cron call): nothing to do, and no error for the cron mail
            $output->writeln('Another check run is still going, nothing done.');
            return self::SUCCESS;
        }
        $output->writeln(sprintf('Checked %d targets, %d not measured (time budget).', $report->checked, $report->notMeasured));

        return self::SUCCESS;
    }
}
