<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Store;

use Piwik\Common;
use Piwik\Db;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;

/**
 * The check targets (spec 5). Defaults come from Matomo and are kept in sync; URLs set by hand (`manual`) or found on
 * the website (`detected`) are never overwritten by a default. Defaults that Matomo no longer produces (deleted site,
 * unpublished container) are retired, and come back when they reappear; `enabled` is only ever changed by people.
 */
final class TargetStore
{
    public const SOURCE_DEFAULT = 'default';
    public const SOURCE_DETECTED = 'detected';
    public const SOURCE_MANUAL = 'manual';

    private static function table(): string
    {
        return Schema::table(Schema::TARGET);
    }

    /**
     * @return Target[] every target (also disabled and retired ones), in one query
     */
    public function all(): array
    {
        return $this->select('');
    }

    /**
     * @return Target[] enabled, not retired, probeable targets, least recently checked first (never checked first)
     */
    public function due(): array
    {
        // a deleted website's targets are not checked (deleteSite() removes them; this covers deletions while the plugin
        // was off)
        return $this->select(
            'WHERE enabled = 1 AND retired_at IS NULL AND kind <> ? AND (idsite = 0 OR idsite IN (SELECT idsite FROM '
            . Common::prefixTable('site') . '))',
            [Kind::PROCESSING],
            'ORDER BY last_checked_at IS NOT NULL, last_checked_at ASC, idtarget ASC'
        );
    }

    /**
     * @return Target[] every target that is not retired, switched on or off (the admin overview), without the processing
     *                  time
     */
    public function current(): array
    {
        return $this->select('WHERE retired_at IS NULL AND kind <> ?', [Kind::PROCESSING]);
    }

    /**
     * @return Target[] the targets of one website (idSite 0: the Matomo instance), not retired
     */
    public function forSite(int $idSite): array
    {
        return $this->select('WHERE idsite = ? AND retired_at IS NULL AND kind <> ?', [$idSite, Kind::PROCESSING]);
    }

    public function get(int $idSite, string $key): ?Target
    {
        return $this->select('WHERE idsite = ? AND target_key = ?', [$idSite, $key])[0] ?? null;
    }

    /**
     * Inserts missing defaults, updates the URL and extra data of default rows, retires defaults no longer produced.
     * Two statements in all.
     *
     * @param array<int, array{idSite: int, key: string, kind: string, url: string, extra: array}> $specs
     */
    public function syncDefaults(array $specs): void
    {
        $now = Sql::now();
        $before = [];
        foreach ($this->all() as $target) {
            $before[$target->idSite . '|' . $target->key] = $target;
        }
        $rows = [];
        $wanted = [];
        foreach ($specs as $spec) {
            $rows[] = [$spec['idSite'], $spec['key'], $spec['kind'], $spec['url'], self::SOURCE_DEFAULT, 1,
                json_encode($spec['extra']), $now, $now];
            $wanted[$spec['idSite'] . '|' . $spec['key']] = $spec['url'];
        }
        Sql::insertRows(
            self::table(),
            ['idsite', 'target_key', 'kind', 'url', 'url_source', 'enabled', 'extra', 'created', 'updated'],
            $rows,
            // MySQL assigns left to right: compare with the old values before they change
            "updated = IF(url_source = 'default' AND (url <> VALUES(url) OR retired_at IS NOT NULL), VALUES(updated), updated),"
            . " first_up_at = IF(url_source = 'default' AND url <> VALUES(url), NULL, first_up_at),"
            . " url = IF(url_source = 'default', VALUES(url), url),"
            . " extra = IF(url_source = 'default', VALUES(extra), extra),"
            . " kind = IF(url_source = 'default', VALUES(kind), kind),"
            . ' retired_at = NULL'
        );

        $retire = [];
        $changed = [];
        foreach ($before as $id => $target) {
            if ($target->urlSource !== self::SOURCE_DEFAULT || $target->kind === Kind::PROCESSING) {
                continue;
            }
            if (!isset($wanted[$id])) {
                $retire[] = $target->id;
            } elseif ($wanted[$id] !== $target->url) {
                $changed[] = $target->id;
            }
        }
        $this->retire($retire);
        // a new address starts without the old one's state and certificate date
        (new StateStore())->forget($changed);
        (new IncidentStore())->closeOpen($changed, $now);
    }

    /**
     * Retires targets (no longer checked, history kept until retention) and closes their open outages.
     *
     * @param int[] $idTargets
     */
    public function retire(array $idTargets): void
    {
        if ($idTargets === []) {
            return;
        }
        $now = Sql::now();
        Db::query(
            'UPDATE ' . self::table() . ' SET retired_at = ? WHERE retired_at IS NULL AND idtarget IN (' . Sql::placeholders($idTargets) . ')',
            array_merge([$now], $idTargets)
        );
        (new IncidentStore())->closeOpen($idTargets, $now);
    }

    /**
     * A deleted website: its targets, their states and open outages go (event SitesManager.deleteSite.end); the history
     * rows age out with retention.
     */
    public function deleteSite(int $idSite): void
    {
        if ($idSite <= 0) {
            return;
        }
        $ids = array_map(static fn(Target $t): int => $t->id, $this->select('WHERE idsite = ?', [$idSite]));
        if ($ids === []) {
            return;
        }
        (new IncidentStore())->closeOpen($ids, Sql::now());
        (new StateStore())->forget($ids);
        Db::query('DELETE FROM ' . self::table() . ' WHERE idsite = ?', [$idSite]);
    }

    /**
     * Sets (or adds) a target URL by hand or from detection. Clears the history marks, since it is a new URL.
     */
    public function setUrl(int $idSite, string $key, string $kind, string $url, string $source, array $extra = []): Target
    {
        $now = Sql::now();
        $previous = $this->get($idSite, $key);
        if ($previous !== null && $previous->url !== $url) {
            // a new address starts without the old one's state, certificate date and open outage
            (new StateStore())->forget([$previous->id]);
            (new IncidentStore())->closeOpen([$previous->id], $now);
        }
        Sql::insertRows(
            self::table(),
            ['idsite', 'target_key', 'kind', 'url', 'url_source', 'enabled', 'extra', 'detected_at', 'created', 'updated'],
            [[$idSite, $key, $kind, $url, $source, 1, json_encode($extra), $source === self::SOURCE_DETECTED ? $now : null, $now, $now]],
            // first_up_at before url: MySQL assigns left to right
            'first_up_at = IF(url = VALUES(url), first_up_at, NULL), kind = VALUES(kind), url = VALUES(url),'
            . ' url_source = VALUES(url_source), extra = VALUES(extra), detected_at = VALUES(detected_at),'
            . ' updated = VALUES(updated), retired_at = NULL'
        );

        return $this->get($idSite, $key);
    }

    public function setEnabled(int $idSite, string $key, bool $enabled): ?Target
    {
        $target = $this->get($idSite, $key);
        if ($target !== null && !$enabled) {
            (new IncidentStore())->closeOpen([$target->id], Sql::now());
        }
        Db::query(
            'UPDATE ' . self::table() . ' SET enabled = ?, updated = ? WHERE idsite = ? AND target_key = ?',
            [$enabled ? 1 : 0, Sql::now(), $idSite, $key]
        );

        return $this->get($idSite, $key);
    }

    public function delete(int $idSite, string $key): bool
    {
        $target = $this->get($idSite, $key);
        if ($target !== null) {
            (new IncidentStore())->closeOpen([$target->id], Sql::now());
            (new StateStore())->forget([$target->id]);
        }
        $result = Db::query('DELETE FROM ' . self::table() . ' WHERE idsite = ? AND target_key = ?', [$idSite, $key]);

        return $result->rowCount() > 0;
    }

    /**
     * After a run: the time of the last check, and the first success of targets that never had one.
     *
     * @param CheckResult[] $results
     */
    public function markChecked(array $results): void
    {
        $checked = [];
        $up = [];
        foreach ($results as $result) {
            $checked[$result->idTarget] = max($checked[$result->idTarget] ?? '', $result->checkedAt);
            if ($result->outcome === Outcome::UP) {
                $up[$result->idTarget] = $result->checkedAt;
            }
        }
        if ($checked) {
            $ids = array_keys($checked);
            Db::query(
                'UPDATE ' . self::table() . ' SET last_checked_at = ? WHERE idtarget IN (' . Sql::placeholders($ids) . ')',
                array_merge([max($checked)], $ids)
            );
        }
        if ($up) {
            $ids = array_keys($up);
            Db::query(
                'UPDATE ' . self::table() . ' SET first_up_at = ? WHERE first_up_at IS NULL AND idtarget IN (' . Sql::placeholders($ids) . ')',
                array_merge([min($up)], $ids)
            );
        }
    }

    /**
     * The pseudo target of the processing time (spec 6.6), created on first use.
     */
    public function processingTargetId(): int
    {
        $target = $this->get(0, Kind::PROCESSING);
        if ($target === null) {
            $now = Sql::now();
            Sql::insertRows(
                self::table(),
                ['idsite', 'target_key', 'kind', 'url', 'url_source', 'enabled', 'extra', 'created', 'updated'],
                [[0, Kind::PROCESSING, Kind::PROCESSING, '', self::SOURCE_DEFAULT, 1, '[]', $now, $now]],
                'updated = updated'
            );
            $target = $this->get(0, Kind::PROCESSING);
        }

        return $target->id;
    }

    /**
     * @return Target[]
     */
    private function select(string $where, array $bind = [], string $order = 'ORDER BY idsite, target_key'): array
    {
        $rows = Db::fetchAll(
            'SELECT idtarget, idsite, target_key, kind, url, url_source, enabled, extra, first_up_at, last_checked_at FROM '
            . self::table() . ' ' . $where . ' ' . $order,
            $bind
        );
        $targets = [];
        foreach ($rows as $row) {
            $extra = json_decode((string) $row['extra'], true);
            $targets[] = new Target(
                (int) $row['idtarget'],
                (int) $row['idsite'],
                (string) $row['target_key'],
                (string) $row['kind'],
                (string) $row['url'],
                (string) $row['url_source'],
                is_array($extra) ? $extra : [],
                $row['first_up_at'] !== null ? (string) $row['first_up_at'] : null,
                (bool) $row['enabled'],
                $row['last_checked_at'] !== null ? (string) $row['last_checked_at'] : null
            );
        }

        return $targets;
    }
}
