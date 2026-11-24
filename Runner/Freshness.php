<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Runner;

use Piwik\Config;

/**
 * When a result no longer counts as current: older than two check intervals, but at least one interval plus a run's
 * time budget and the lock's margin, so that a slow run never makes every target "no recent check". The same rule
 * for the page, the API and the Sentinel checks.
 */
final class Freshness
{
    public static function staleAfter(int $interval, int $budget): int
    {
        return max(2 * $interval, $interval + $budget + CheckRunner::LOCK_MARGIN);
    }

    public static function budget(): int
    {
        $section = Config::getInstance()->FeinwerkUptimeMonitor;

        return is_array($section) && isset($section['run_budget_seconds'])
            ? max(10, (int) $section['run_budget_seconds'])
            : CheckRunner::DEFAULT_BUDGET;
    }

    /**
     * Seconds after which a result is stale now.
     */
    public static function now(int $now): int
    {
        return self::staleAfter((new IntervalTracker())->interval($now), self::budget());
    }
}
