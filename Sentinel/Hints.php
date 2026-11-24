<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel;

use Piwik\Common;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\IncidentStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;

/**
 * A cause hint for Feinwerk Sentinel's "No visits" and "Drop in visits" (its event FeinwerkSentinel.incidentOpened,
 * shared interface, see Sentinel's README): when the website or its tracking path is down, the alarm says so. Only
 * Sentinel's translation-key hints are written; hints of other plugins stay.
 */
final class Hints
{
    public const CHECKS = ['S01', 'S02'];
    public const PREFIX = 'FeinwerkUptimeMonitor_';
    private const STORE = '\\Piwik\\Plugins\\FeinwerkSentinel\\Incident\\DbIncidentStore';

    /**
     * The hint lines. Pure.
     *
     * @param string|null $downSince UTC Y-m-d H:i:s of the oldest open outage of the website's targets
     * @return array<array{key: string, params: array}>
     */
    public static function hints(?string $downSince): array
    {
        if ($downSince === null) {
            return [];
        }

        return [['key' => self::PREFIX . 'HintSiteDown', 'params' => [substr($downSince, 0, 16) . ' UTC']]];
    }

    /** Adds the own hints, replacing own hints of an earlier run. Pure. */
    public static function merge(array $existing, array $own): array
    {
        $kept = array_values(array_filter($existing, static fn($hint): bool =>
            !is_array($hint) || !str_starts_with((string) ($hint['key'] ?? ''), self::PREFIX)));

        return array_merge($kept, $own);
    }

    /** Never throws: a failing hint must not hold up Sentinel's alarm. */
    public function addTo(array $incident): void
    {
        try {
            $idSite = (int) ($incident['idsite'] ?? 0);
            $check = (string) ($incident['check'] ?? '');
            if ($idSite <= 0 || !in_array($check, self::CHECKS, true) || !class_exists(self::STORE)) {
                return;
            }
            $ids = array_map(static fn(Target $t): int => $t->id, array_filter(
                (new TargetStore())->forSite($idSite),
                static fn(Target $t): bool => in_array($t->kind, Kind::SITE, true) && $t->enabled
            ));
            $since = null;
            foreach ((new IncidentStore())->openFor($ids, StateStore::LOCAL) as $bySource) {
                $start = (string) $bySource[StateStore::LOCAL]['started_at'];
                $since = $since === null ? $start : min($since, $start);
            }
            $hints = self::hints($since);
            if ($hints === []) {
                return;
            }
            $storeClass = self::STORE;
            $store = new $storeClass();
            $open = $store->findOpen($idSite, $check, (string) ($incident['subject'] ?? ''));
            if ($open === null) {
                return;
            }
            $open->details['hints'] = self::merge((array) ($open->details['hints'] ?? []), $hints);
            $store->update($open);
        } catch (\Throwable $e) {
            Common::printDebug('FeinwerkUptimeMonitor: Sentinel hint skipped: ' . $e->getMessage());
        }
    }
}
