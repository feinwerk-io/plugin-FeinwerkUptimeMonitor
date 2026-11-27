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
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;

/**
 * Outages (per target and source) and gaps without any measurement (instance wide, idtarget 0). An outage opens on
 * the first `down` and closes on the next `up`; `not_checkable` neither opens nor closes one, except a result of the
 * server that sent nothing: the server's open outage then ends at its last failing check (endAtLastFailure()).
 */
final class IncidentStore
{
    public const OUTAGE = 'outage';
    public const GAP = 'gap';

    private static function table(): string
    {
        return Schema::table(Schema::INCIDENT);
    }

    /**
     * @param CheckResult[] $results
     */
    public function apply(array $results, string $source = StateStore::LOCAL): void
    {
        $ids = array_values(array_unique(array_map(static fn(CheckResult $r): int => $r->idTarget, $results)));
        if ($ids === []) {
            return;
        }
        $open = $this->openFor($ids, $source);

        $insert = [];
        $close = [];
        $stillDown = [];
        foreach ($results as $r) {
            $incident = $open[$r->idTarget][$source] ?? null;
            if ($r->outcome === Outcome::DOWN) {
                if ($incident === null) {
                    $insert[] = [$r->idTarget, $source, self::OUTAGE, $r->checkedAt, null, $r->error,
                        $r->status !== null ? 'HTTP ' . $r->status : null, 1];
                } else {
                    $stillDown[] = (int) $incident['idincident'];
                }
            } elseif ($r->outcome === Outcome::UP && $incident !== null) {
                $close[(int) $incident['idincident']] = $r->checkedAt;
            }
        }

        Sql::insertRows(
            self::table(),
            ['idtarget', 'source', 'kind', 'started_at', 'ended_at', 'cause', 'detail', 'down_samples'],
            $insert,
            'down_samples = down_samples'
        );
        if ($insert) {
            // two overlapping runs could both open an outage: keep the older one only
            $opened = array_values(array_unique(array_column($insert, 0)));
            Db::query(
                'DELETE newer FROM ' . self::table() . ' newer JOIN ' . self::table() . ' older'
                . ' ON older.idtarget = newer.idtarget AND older.source = newer.source AND older.kind = newer.kind'
                . ' AND older.ended_at IS NULL AND newer.ended_at IS NULL AND older.started_at < newer.started_at'
                . ' WHERE newer.kind = ? AND newer.idtarget IN (' . Sql::placeholders($opened) . ')',
                array_merge([self::OUTAGE], $opened)
            );
        }
        if ($stillDown) {
            Db::query(
                'UPDATE ' . self::table() . ' SET down_samples = down_samples + 1 WHERE idincident IN (' . Sql::placeholders($stillDown) . ')',
                $stillDown
            );
        }
        if ($close) {
            $case = '';
            $bind = [];
            foreach ($close as $id => $at) {
                $case .= ' WHEN ? THEN ?';
                $bind[] = $id;
                $bind[] = $at;
            }
            $ids = array_keys($close);
            Db::query(
                'UPDATE ' . self::table() . ' SET ended_at = CASE idincident' . $case . ' END WHERE idincident IN (' . Sql::placeholders($ids) . ')',
                array_merge($bind, $ids)
            );
        }
    }

    /**
     * Ends the open outages of targets that are no longer checked (retired, switched off, removed): their outage is
     * over for this plugin, not ongoing for ever. With $source only that source's outages (a changed address: the server
     * starts again, an outage from outside ends when its source reports the end). Never before an outage's start (a
     * source whose clock is ahead of Matomo's): such an outage ends at its start.
     *
     * @param int[] $idTargets
     * @param string $at Y-m-d H:i:s UTC
     * @param string|null $source StateStore::LOCAL or EXTERNAL; null: every source
     */
    public function closeOpen(array $idTargets, string $at, ?string $source = null): void
    {
        if ($idTargets === []) {
            return;
        }
        Db::query(
            'UPDATE ' . self::table() . ' SET ended_at = GREATEST(started_at, CAST(? AS DATETIME))'
            . ' WHERE ended_at IS NULL AND idtarget IN (' . Sql::placeholders($idTargets) . ')'
            . ($source !== null ? ' AND source = ?' : ''),
            array_merge([$at], $idTargets, $source !== null ? [$source] : [])
        );
    }

    /**
     * Ends the server's open outages of targets whose latest check sent nothing (Outcome::NOTHING_SENT: Matomo's
     * internet features off, PHP functions disabled, a name that needs PHP intl): these addresses are no longer checked
     * from here, so the outage is over for this plugin instead of growing for as long as nothing is sent. It ends at its
     * last check that found the target down (quick UI review before 5.4.0, Q1): a run that sends nothing is no check and
     * never moves an outage's end. Without such a check (raw checks are kept 14 days) at its start. One UPDATE; the
     * check table's (idtarget, checked_at) key serves the lookup.
     *
     * @param int[] $idTargets
     */
    public function endAtLastFailure(array $idTargets): void
    {
        if ($idTargets === []) {
            return;
        }
        $checks = Schema::table(Schema::CHECK);
        Db::query(
            'UPDATE ' . self::table() . ' i SET i.ended_at = COALESCE((SELECT MAX(c.checked_at) FROM ' . $checks . ' c'
            . ' WHERE c.idtarget = i.idtarget AND c.checked_at >= i.started_at AND c.outcome = ?), i.started_at)'
            . ' WHERE i.ended_at IS NULL AND i.kind = ? AND i.source = ? AND i.idtarget IN (' . Sql::placeholders($idTargets) . ')',
            array_merge([Outcome::DOWN, self::OUTAGE, StateStore::LOCAL], $idTargets)
        );
    }

    /**
     * A stretch without any measurement (Matomo or its cron was not running), seen on the first run after it.
     */
    public function recordGap(string $from, string $to): void
    {
        Sql::insertRows(
            self::table(),
            ['idtarget', 'source', 'kind', 'started_at', 'ended_at', 'cause', 'detail', 'down_samples'],
            [[0, StateStore::LOCAL, self::GAP, $from, $to, null, null, 0]],
            'ended_at = VALUES(ended_at)'
        );
    }

    /**
     * Open incidents of the given targets, one query.
     *
     * @param int[] $idTargets
     * @return array<int, array<string, array>> by idtarget and source
     */
    public function openFor(array $idTargets, ?string $source = null): array
    {
        if ($idTargets === []) {
            return [];
        }
        $sql = 'SELECT * FROM ' . self::table() . ' WHERE ended_at IS NULL AND kind = ? AND idtarget IN (' . Sql::placeholders($idTargets) . ')';
        $bind = array_merge([self::OUTAGE], $idTargets);
        if ($source !== null) {
            $sql .= ' AND source = ?';
            $bind[] = $source;
        }
        $open = [];
        foreach (Db::fetchAll($sql, $bind) as $row) {
            $open[(int) $row['idtarget']][(string) $row['source']] = $row;
        }

        return $open;
    }

    /**
     * The outages of the given targets that are open or ended at or after $endedSince, one query (index open): per
     * target and source the open one, else the one that ended last. The other side of a one-sided failure
     * (UptimeReport::overview()): an outage it closed after the failing side's latest failing check still counts.
     *
     * @param int[] $idTargets
     * @param string $endedSince Y-m-d H:i:s UTC
     * @return array<int, array<string, array{idtarget: string, source: string, started_at: string, ended_at: ?string}>>
     *         by idtarget and source
     */
    public function openOrEndedSince(array $idTargets, string $endedSince): array
    {
        if ($idTargets === []) {
            return [];
        }
        $rows = Db::fetchAll(
            'SELECT idtarget, source, started_at, ended_at FROM ' . self::table()
            . ' WHERE kind = ? AND idtarget IN (' . Sql::placeholders($idTargets) . ') AND (ended_at IS NULL OR ended_at >= ?)',
            array_merge([self::OUTAGE], $idTargets, [$endedSince])
        );
        $out = [];
        foreach ($rows as $row) {
            $kept = $out[(int) $row['idtarget']][(string) $row['source']] ?? null;
            // Y-m-d H:i:s compares as text
            if ($kept === null || ($kept['ended_at'] !== null && ($row['ended_at'] === null || $row['ended_at'] > $kept['ended_at']))) {
                $out[(int) $row['idtarget']][(string) $row['source']] = $row;
            }
        }

        return $out;
    }

    /**
     * Incidents of a website's targets (idSite 0: the instance targets and the gaps) that overlap [$from, $to).
     *
     * @param string $state all|open|closed
     */
    public function find(int $idSite, string $from, string $to, string $state, int $limit, string $source = 'all'): array
    {
        $targets = Schema::table(Schema::TARGET);
        $sql = 'SELECT i.idincident, i.idtarget, i.source, i.kind, i.started_at, i.ended_at, i.cause, i.detail, i.down_samples,'
            . ' t.target_key, t.kind AS target_kind, t.url'
            . ' FROM ' . self::table() . ' i LEFT JOIN ' . $targets . ' t ON t.idtarget = i.idtarget'
            . ' WHERE i.started_at < ? AND (i.ended_at IS NULL OR i.ended_at >= ?)';
        $bind = [$to, $from];
        if ($idSite === 0) {
            $sql .= ' AND (t.idsite = 0 OR (i.idtarget = 0 AND i.kind = ?))';
            $bind[] = self::GAP;
        } else {
            $sql .= ' AND t.idsite = ?';
            $bind[] = $idSite;
        }
        if ($state === 'open') {
            $sql .= ' AND i.ended_at IS NULL';
        } elseif ($state === 'closed') {
            $sql .= ' AND i.ended_at IS NOT NULL';
        }
        if ($source !== 'all') {
            $sql .= ' AND i.source = ?';
            $bind[] = $source;
        }
        $sql .= ' ORDER BY i.started_at DESC, i.idincident DESC LIMIT ' . max(1, min(1000, $limit));

        return Db::fetchAll($sql, $bind);
    }

    /**
     * Upserts incidents written by Pro (exact start and end), keyed by target, source, kind and start. An outage that
     * has ended here (closeOpen(): switched off, retired, no longer checked by its source) is never opened again by a
     * row that still carries it open; a row with an end replaces the end set here. Accepted (review of the 5.2.0 fixes,
     * NIT 4): an address switched off and on again while its outage from outside goes on reads that outage as ended
     * until the source reports the end, which then replaces it. Reopening rows of switched-on targets would instead let
     * a pull that was under way while the source stopped checking an address (endOutages() after its push) open that
     * outage for good: no later pull carries the address.
     *
     * @param array<int, array{idtarget: int, source: string, kind: string, started_at: string, ended_at: ?string, cause: ?string, detail: ?string, down_samples: int}> $rows
     */
    public function upsert(array $rows): void
    {
        $values = [];
        foreach ($rows as $row) {
            $values[] = [$row['idtarget'], $row['source'], $row['kind'], $row['started_at'], $row['ended_at'],
                $row['cause'], $row['detail'], $row['down_samples']];
        }
        Sql::insertRows(
            self::table(),
            ['idtarget', 'source', 'kind', 'started_at', 'ended_at', 'cause', 'detail', 'down_samples'],
            $values,
            'ended_at = IF(ended_at IS NOT NULL AND VALUES(ended_at) IS NULL, ended_at, VALUES(ended_at)),'
            . ' cause = VALUES(cause), detail = VALUES(detail), down_samples = VALUES(down_samples)'
        );
    }
}
