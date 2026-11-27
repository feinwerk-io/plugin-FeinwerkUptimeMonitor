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
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;

/**
 * The latest state per target and source (`local` from this server, `external` from Pro), so that pages and the
 * Sentinel checks never have to find the newest row in the raw table.
 */
final class StateStore
{
    public const LOCAL = 'local';
    public const EXTERNAL = 'external';

    /**
     * @param CheckResult[] $results
     */
    public function upsertMany(array $results, string $source): void
    {
        $rows = [];
        foreach ($results as $r) {
            $rows[$r->idTarget] = [$r->idTarget, $source, $r->outcome, $r->error, $r->note, $r->status,
                (int) ($r->timings['total'] ?? 0), $r->certNotAfter, $r->checkedAt];
        }
        Sql::insertRows(
            Schema::table(Schema::STATE),
            ['idtarget', 'source', 'outcome', 'error', 'note', 'status', 'ms_total', 'cert_not_after', 'checked_at'],
            array_values($rows),
            'outcome = VALUES(outcome), error = VALUES(error), note = VALUES(note), status = VALUES(status),'
            . ' ms_total = VALUES(ms_total), cert_not_after = COALESCE(VALUES(cert_not_after), cert_not_after),'
            . ' checked_at = VALUES(checked_at)'
        );
    }

    /**
     * Like all(), for the given targets only.
     *
     * @param int[] $idTargets
     */
    public function forTargets(array $idTargets): array
    {
        if ($idTargets === []) {
            return [];
        }
        $states = [];
        foreach (Db::fetchAll('SELECT * FROM ' . Schema::table(Schema::STATE) . ' WHERE idtarget IN (' . Sql::placeholders($idTargets) . ')', $idTargets) as $row) {
            $states[(int) $row['idtarget']][(string) $row['source']] = self::state($row);
        }

        return $states;
    }

    /**
     * Forgets the latest state of targets whose address changed or that were removed (also their certificate date).
     * With $source only that source's state, and with $keepOutcomes not a state of those outcomes.
     *
     * @param int[] $idTargets
     * @param string|null $source self::LOCAL or self::EXTERNAL; null: every source
     * @param string[] $keepOutcomes e.g. [Outcome::NOT_CHECKABLE]: such states stay
     */
    public function forget(array $idTargets, ?string $source = null, array $keepOutcomes = []): void
    {
        if ($idTargets === []) {
            return;
        }
        $sql = 'DELETE FROM ' . Schema::table(Schema::STATE) . ' WHERE idtarget IN (' . Sql::placeholders($idTargets) . ')';
        $bind = $idTargets;
        if ($source !== null) {
            $sql .= ' AND source = ?';
            $bind[] = $source;
        }
        if ($keepOutcomes !== []) {
            $sql .= ' AND outcome NOT IN (' . Sql::placeholders($keepOutcomes) . ')';
            $bind = array_merge($bind, array_values($keepOutcomes));
        }
        Db::query($sql, $bind);
    }

    /**
     * @return array<int, array<string, array{outcome: string, error: ?string, note: ?string, status: ?int, ms_total: ?int, cert_not_after: ?string, checked_at: string}>>
     *         by idtarget and source, one query
     */
    public function all(): array
    {
        $rows = Db::fetchAll('SELECT * FROM ' . Schema::table(Schema::STATE));
        $states = [];
        foreach ($rows as $row) {
            $states[(int) $row['idtarget']][(string) $row['source']] = self::state($row);
        }

        return $states;
    }

    /**
     * Whether one of Matomo's own addresses (idSite 0, and the Tag Manager containers on Matomo's default address, whose
     * file the Matomo server serves; Target::isInstanceAddress()) has the note in its latest state from this source. One
     * query, without reading every website's targets (L8 review of 5.4.0, NIT 11).
     */
    public function instanceAddressHasNote(string $note, string $source = self::LOCAL): bool
    {
        return (bool) Db::fetchOne('SELECT 1 FROM ' . Schema::table(Schema::STATE) . ' s JOIN ' . Schema::table(Schema::TARGET)
            . ' t ON t.idtarget = s.idtarget WHERE s.note = ? AND s.source = ?'
            . " AND (t.idsite = 0 OR (t.kind = ? AND t.url_source = 'default')) LIMIT 1", [$note, $source, Kind::CONTAINER]);
    }

    private static function state(array $row): array
    {
        return [
            'outcome' => (string) $row['outcome'],
            'error' => $row['error'] !== null ? (string) $row['error'] : null,
            'note' => $row['note'] !== null ? (string) $row['note'] : null,
            'status' => $row['status'] !== null ? (int) $row['status'] : null,
            'ms_total' => $row['ms_total'] !== null ? (int) $row['ms_total'] : null,
            'cert_not_after' => $row['cert_not_after'] !== null ? (string) $row['cert_not_after'] : null,
            'checked_at' => (string) $row['checked_at'],
        ];
    }
}
