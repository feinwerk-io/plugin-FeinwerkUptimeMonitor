<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel;

use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\External\ExternalResults;
use Piwik\Plugins\FeinwerkUptimeMonitor\Report\UptimeReport;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\Freshness;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\IntervalTracker;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\IncidentStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\RollupStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;

/**
 * Everything the Sentinel checks read, loaded once per Sentinel run (Sentinel calls evaluate() per website): the
 * targets, their latest states, open outages, the check interval, thresholds, the tracker's response times of the
 * last hour and whether Pro checks from outside.
 */
final class StateCache
{
    private static ?string $runKey = null;
    private static ?self $current = null;

    /**
     * @param array{targets: array<int, Target[]>, states: array<int, array>, incidents: array<int, string>, interval: int, certWarningDays: int, slowTrackerMs: int, processing: array{samples: int, p50: ?int}, endpointMedian: ?int, proActive: bool} $data
     */
    public function __construct(private array $data)
    {
    }

    public static function forRun(string $runKey): self
    {
        if (self::$runKey !== $runKey || self::$current === null) {
            self::$current = new self(self::load());
            self::$runKey = $runKey;
        }

        return self::$current;
    }

    /**
     * @return Target[]
     */
    public function targets(int $idSite): array
    {
        return $this->data['targets'][$idSite] ?? [];
    }

    public function state(int $idTarget, string $source = StateStore::LOCAL): ?array
    {
        return $this->data['states'][$idTarget][$source] ?? null;
    }

    /** Start (UTC, Y-m-d H:i:s) of the open local outage of a target, or null. */
    public function openSince(int $idTarget): ?string
    {
        return $this->data['incidents'][$idTarget] ?? null;
    }

    public function interval(): int
    {
        return $this->data['interval'];
    }

    /**
     * Age after which a state no longer counts (unknown for Sentinel): two check intervals, but at least one interval
     * plus a run's time budget and the lock's margin, so that a slow run never makes every target unknown.
     */
    public function staleAfter(): int
    {
        return Freshness::staleAfter($this->data['interval'], $this->data['budget'] ?? 60);
    }

    public function certWarningDays(): int
    {
        return $this->data['certWarningDays'];
    }

    public function slowTrackerMs(): int
    {
        return $this->data['slowTrackerMs'];
    }

    /**
     * @return array{samples: int, p50: ?int}
     */
    public function processing(): array
    {
        return $this->data['processing'];
    }

    public function endpointMedian(): ?int
    {
        return $this->data['endpointMedian'];
    }

    public function proActive(): bool
    {
        return $this->data['proActive'];
    }

    private static function load(): array
    {
        $now = time();
        $byId = [];
        $bySite = [];
        foreach ((new TargetStore())->due() as $target) {
            $bySite[$target->idSite][] = $target;
            $byId[$target->id] = $target;
        }
        $incidents = [];
        foreach ((new IncidentStore())->openFor(array_keys($byId), StateStore::LOCAL) as $idTarget => $bySource) {
            $incidents[$idTarget] = (string) $bySource[StateStore::LOCAL]['started_at'];
        }
        $settings = UptimeReport::settings();

        // the last 60 minutes from the raw data (the newest hour row holds only the minutes since the full hour)
        $since = gmdate('Y-m-d H:i:s', $now - 3600);
        $rollups = new RollupStore();
        $last = $rollups->processingSince($since);
        $proc = ['samples' => $last['samples'], 'p50' => $last['p50']];
        $endpoint = null;
        foreach ($bySite[0] ?? [] as $target) {
            if ($target->kind === Kind::TRACKER) {
                $endpoint = $rollups->medianSince($target->id, $since);
            }
        }

        $proActive = false;
        foreach (ExternalResults::sources() as $source) {
            $reached = isset($source['reachedAt']) ? strtotime((string) $source['reachedAt']) : false;
            if (!empty($source['active']) && $reached !== false && $now - $reached < 7200) {
                $proActive = true;
            }
        }

        return [
            'targets' => $bySite,
            'states' => (new StateStore())->all(),
            'incidents' => $incidents,
            'interval' => (new IntervalTracker())->interval($now),
            'budget' => Freshness::budget(),
            'certWarningDays' => $settings['certWarningDays'],
            'slowTrackerMs' => $settings['slowTrackerMs'],
            'processing' => $proc,
            'endpointMedian' => $endpoint,
            'proActive' => $proActive,
        ];
    }
}
