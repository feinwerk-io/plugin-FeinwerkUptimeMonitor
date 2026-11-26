<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Runner;

use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Capabilities;

/**
 * The PHP runtime functions of a check run (the retry pause, the time limit), called only where the host has them: a
 * disabled function throws \Error in PHP 8, and the run would lose its results.
 */
final class Runtime
{
    /** Waits $seconds: sleep, else usleep, else no pause at all. */
    public static function pause(Capabilities $capabilities, int $seconds): void
    {
        if ($seconds <= 0) {
            return;
        }
        if ($capabilities->has('sleep')) {
            sleep($seconds);
        } elseif ($capabilities->has('usleep')) {
            usleep($seconds * 1000000);
        }
    }

    /**
     * Raises PHP's time limit to $seconds when it is lower, as Matomo's SettingsServer::setMaxExecutionTime does
     * with the functions there are: none (0) or a higher limit stays, and without ini_get the limit is unknown and
     * stays too (setting one could cap a console run that has none).
     *
     * @param \Closure|null $current (): string|false, default ini_get('max_execution_time') (tests)
     * @param \Closure|null $set (int $seconds): void, default set_time_limit (tests)
     * @return bool whether it was raised
     */
    public static function raiseTimeLimit(Capabilities $capabilities, int $seconds, ?\Closure $current = null, ?\Closure $set = null): bool
    {
        if (!$capabilities->has('ini_get') || !$capabilities->has('set_time_limit')) {
            return false;
        }
        $limit = (int) ($current ?? static fn() => ini_get('max_execution_time'))();
        if ($limit === 0 || $limit >= $seconds) {
            return false;
        }
        ($set ?? static function (int $s): void {
            @set_time_limit($s);
        })($seconds);

        return true;
    }
}
