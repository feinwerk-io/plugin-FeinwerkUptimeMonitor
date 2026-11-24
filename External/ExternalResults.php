<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\External;

use Piwik\Piwik;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\IncidentStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\RollupStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;

/**
 * The seam for results checked from outside (spec 9): the paid Pro plugin writes hour rows, outages with their exact
 * start and end, and the latest state per target, always with source `external`. The free plugin itself never calls
 * the outside service. A shared interface once Pro exists: change only with VERSION and an announcement.
 */
final class ExternalResults
{
    public const VERSION = 1;
    public const EVENT_SOURCES = 'FeinwerkUptimeMonitor.externalSource';

    /**
     * @param list<array{idtarget: int, hour: string, samples: int, up_samples: int, measured_seconds: int, up_seconds: int, ms_p50: ?int, ms_p95: ?int, ms_max: ?int, cert_not_after: ?string, source?: string}> $rows
     */
    public function writeHours(array $rows): void
    {
        (new RollupStore())->upsertHours(array_map([self::class, 'external'], $rows));
    }

    /**
     * @param list<array{idtarget: int, started_at: string, ended_at: ?string, cause: ?string, detail: ?string, down_samples: int, source?: string}> $rows
     */
    public function writeIncidents(array $rows): void
    {
        $rows = array_map(static fn(array $row): array => self::external($row) + ['kind' => IncidentStore::OUTAGE], $rows);
        (new IncidentStore())->upsert($rows);
    }

    /**
     * @param list<array{idtarget: int, outcome: string, error: ?string, status: ?int, ms_total: ?int, cert_not_after: ?string, checked_at: string, source?: string}> $states
     */
    public function setLatest(array $states): void
    {
        $results = [];
        foreach ($states as $state) {
            $state = self::external($state);
            if (!in_array($state['outcome'], [Outcome::UP, Outcome::DOWN, Outcome::NOT_CHECKABLE], true)) {
                throw new \InvalidArgumentException('outcome must be up, down or not_checkable');
            }
            $results[] = new CheckResult((int) $state['idtarget'], $state['outcome'], $state['error'] ?? null, null,
                $state['status'] ?? null, ['total' => (int) ($state['ms_total'] ?? 0)], $state['cert_not_after'] ?? null,
                (string) $state['checked_at']);
        }
        (new StateStore())->upsertMany($results, StateStore::EXTERNAL);
    }

    /**
     * The registered outside sources, e.g. Pro: name, whether it is licensed and working, when it last reached the
     * service (ISO 8601 UTC or null).
     *
     * @return list<array{name: string, active: bool, reachedAt: ?string}>
     */
    public static function sources(): array
    {
        $sources = [];
        try {
            /**
             * Lets a plugin that writes results checked from outside (FeinwerkUptimeMonitorPro) say that it is there.
             *
             * @param array &$sources append ['name' => string, 'active' => bool, 'reachedAt' => ?string]
             */
            Piwik::postEvent(self::EVENT_SOURCES, [&$sources]);
        } catch (\Throwable $e) {
            return [];
        }

        return array_values(array_filter($sources, static fn($s): bool => is_array($s) && isset($s['name'])));
    }

    private static function external(array $row): array
    {
        if (($row['source'] ?? StateStore::EXTERNAL) !== StateStore::EXTERNAL) {
            throw new \InvalidArgumentException('ExternalResults writes source external only');
        }

        return ['source' => StateStore::EXTERNAL] + $row;
    }
}
