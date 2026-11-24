<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Runner;

use Piwik\Option;

/**
 * The spacing of the checks (spec 6.3, 6.4): one hour with Matomo's hourly task, the observed cron spacing when the
 * console command runs from a system cron. The hourly task skips while the command ran in the last 50 minutes.
 */
final class IntervalTracker
{
    public const OPTION_RUNS = 'fw_uptimemonitor_command_runs';
    public const HOURLY = 3600;
    private const KEEP = 11;

    /** @var int[]|null */
    private ?array $runs = null;

    public function recordCommandRun(int $now): void
    {
        $runs = $this->runs();
        $runs[] = $now;
        $this->runs = array_slice($runs, -self::KEEP);
        Option::set(self::OPTION_RUNS, json_encode($this->runs));
    }

    public function commandRanWithin(int $now, int $seconds): bool
    {
        $runs = $this->runs();
        $last = $runs ? max($runs) : 0;

        return $last > 0 && $now - $last < $seconds;
    }

    /**
     * Whether the command runs from a cron: at least three completed runs in the last two hours, the last one within
     * twice their spacing plus a run's time. One or two runs by hand (a test) do not count.
     */
    public function cronActive(int $now): bool
    {
        $recent = array_values(array_filter($this->runs(), static fn(int $t): bool => $now - $t < 7200));
        if (count($recent) < 3) {
            return false;
        }

        return $now - max($recent) < 2 * $this->medianSpacing($recent) + 300;
    }

    /**
     * Seconds between expected checks: the median spacing of the command runs (60 to 3600) while a cron runs it,
     * else one hour (Matomo's hourly task).
     */
    public function interval(int $now): int
    {
        if (!$this->cronActive($now)) {
            return self::HOURLY;
        }
        $runs = array_values(array_filter($this->runs(), static fn(int $t): bool => $now - $t < 7200));

        return max(60, min(self::HOURLY, $this->medianSpacing($runs)));
    }

    /**
     * @param int[] $runs sorted
     */
    private function medianSpacing(array $runs): int
    {
        $diffs = [];
        for ($i = 1, $n = count($runs); $i < $n; $i++) {
            $diffs[] = $runs[$i] - $runs[$i - 1];
        }
        if ($diffs === []) {
            return self::HOURLY;
        }
        sort($diffs);

        return (int) $diffs[intdiv(count($diffs), 2)];
    }

    /**
     * @return int[]
     */
    private function runs(): array
    {
        if ($this->runs === null) {
            $decoded = json_decode((string) Option::get(self::OPTION_RUNS), true);
            $this->runs = is_array($decoded) ? array_values(array_map('intval', $decoded)) : [];
        }

        return $this->runs;
    }
}
