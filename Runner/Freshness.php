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
    /** results from outside are probed once a minute, so a probe time stands for up to a minute of checking */
    public const PROBE_SECONDS = 60;

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
     * Review of the 5.3.0 fixes, SHOULD 2: how much newer (seconds) one side's result must be than the start of the
     * other side's failure to say anything about it (UptimeReport::aloneDown(), vue/src/sides.ts aloneDown()). The
     * server stamps every result of a run with the run's start while its probes run up to the run budget later, and a
     * result from outside stands for up to one probe minute: the run budget plus PROBE_SECONDS, 120 s by default. The
     * screens get the same value (ScreenProps external.sidesMargin; sides.ts SIDES_MARGIN_SECONDS without it).
     */
    public static function sidesMargin(): int
    {
        return self::budget() + self::PROBE_SECONDS;
    }

    /**
     * Seconds after which a result is stale now.
     */
    public static function now(int $now): int
    {
        return self::staleAfter((new IntervalTracker())->interval($now), self::budget());
    }
}
