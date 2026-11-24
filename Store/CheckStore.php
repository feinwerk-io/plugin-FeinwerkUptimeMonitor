<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Store;

use Piwik\Db;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;

/**
 * Raw local checks (kept 14 days), written once per run in one statement.
 */
final class CheckStore
{
    /**
     * @param CheckResult[] $results
     */
    public function insertMany(array $results): void
    {
        $rows = [];
        foreach ($results as $r) {
            $t = $r->timings;
            $rows[] = [$r->idTarget, $r->checkedAt, $r->outcome, $r->error, $r->note, $r->status,
                (int) ($t['dns'] ?? 0), (int) ($t['connect'] ?? 0), (int) ($t['tls'] ?? 0), (int) ($t['ttfb'] ?? 0),
                (int) ($t['total'] ?? 0), $r->certNotAfter];
        }
        Sql::insertRows(
            Schema::table(Schema::CHECK),
            ['idtarget', 'checked_at', 'outcome', 'error', 'note', 'status', 'ms_dns', 'ms_connect', 'ms_tls', 'ms_ttfb', 'ms_total', 'cert_not_after'],
            $rows
        );
    }

    /**
     * Checks between $from and $to (UTC), plus the checks of the $lookbackSeconds before $from (two check intervals),
     * so that the last one before the window reaches into it. All targets or the given ones.
     *
     * @return array<int, list<array{checked_at: string, outcome: string, ms_total: int, cert_not_after: ?string}>> by idtarget
     */
    public function between(string $from, string $to, int $lookbackSeconds = 7200, ?array $idTargets = null): array
    {
        $table = Schema::table(Schema::CHECK);
        $sql = "SELECT idtarget, checked_at, outcome, ms_total, cert_not_after FROM $table
             WHERE checked_at >= DATE_SUB(?, INTERVAL ? SECOND) AND checked_at < ?";
        $bind = [$from, $lookbackSeconds, $to];
        if ($idTargets !== null) {
            if ($idTargets === []) {
                return [];
            }
            $sql .= ' AND idtarget IN (' . Sql::placeholders($idTargets) . ')';
            $bind = array_merge($bind, $idTargets);
        }
        $rows = Db::fetchAll($sql . ' ORDER BY idtarget, checked_at', $bind);
        $byTarget = [];
        foreach ($rows as $row) {
            $byTarget[(int) $row['idtarget']][] = [
                'checked_at' => (string) $row['checked_at'],
                'outcome' => (string) $row['outcome'],
                'ms_total' => (int) $row['ms_total'],
                'cert_not_after' => $row['cert_not_after'] !== null ? (string) $row['cert_not_after'] : null,
            ];
        }

        return $byTarget;
    }

    /**
     * @return int[] ids of the targets with checks between $from and $to, one query
     */
    public function targetsBetween(string $from, string $to): array
    {
        $rows = Db::fetchAll(
            'SELECT DISTINCT idtarget FROM ' . Schema::table(Schema::CHECK) . ' WHERE checked_at >= ? AND checked_at < ?',
            [$from, $to]
        );

        return array_map('intval', array_column($rows, 'idtarget'));
    }

    /**
     * Time of the newest check of any target, or null.
     */
    public function lastCheckAt(): ?string
    {
        $value = Db::fetchOne('SELECT MAX(checked_at) FROM ' . Schema::table(Schema::CHECK));

        return $value ? (string) $value : null;
    }
}
