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
use Piwik\Piwik;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\External\ExternalResults;

/**
 * The check targets (spec 5). Defaults come from Matomo and are kept in sync; URLs set by hand (`manual`) or found on
 * the website (`detected`) are never overwritten by a default. Defaults that Matomo no longer produces (deleted site,
 * unpublished container) are retired, and come back when they reappear; `enabled` is only ever changed by people.
 * Every real change of the current targets posts ExternalResults::EVENT_TARGETS_CHANGED.
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
     * One upsert for every row, besides the reads that find what changed (the targets before, and the fingerprint of
     * the current targets before and after for targetsChanged) and the clean-up of changed and retired rows.
     *
     * @param array<int, array{idSite: int, key: string, kind: string, url: string, extra: array}> $specs
     */
    public function syncDefaults(array $specs): void
    {
        $now = Sql::now();
        $was = $this->fingerprint();
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
        $this->retireRows($retire, $now);
        // a new address starts without the old one's state and certificate date; an outage from outside ends when its
        // source checked the new address
        (new StateStore())->forget($changed);
        (new IncidentStore())->closeOpen($changed, $now, StateStore::LOCAL);
        if ($this->fingerprint() !== $was) {
            self::changed();
        }
    }

    /**
     * Retires targets (no longer checked, history kept until retention) and closes their open outages.
     *
     * @param int[] $idTargets
     */
    public function retire(array $idTargets): void
    {
        if ($this->retireRows($idTargets, Sql::now()) > 0) {
            self::changed();
        }
    }

    /** @return int how many targets were retired now */
    private function retireRows(array $idTargets, string $now): int
    {
        if ($idTargets === []) {
            return 0;
        }
        $result = Db::query(
            'UPDATE ' . self::table() . ' SET retired_at = ? WHERE retired_at IS NULL AND idtarget IN (' . Sql::placeholders($idTargets) . ')',
            array_merge([$now], $idTargets)
        );
        // the source of results from outside stops checking them and never reports an end: closed here
        (new IncidentStore())->closeOpen($idTargets, $now);

        return $result->rowCount();
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
        self::changed();
    }

    /**
     * Sets (or adds) a target URL by hand or from detection. Clears the history marks, since it is a new URL. Posts
     * targetsChanged only when the row changed (the same address saved again changes nothing).
     */
    public function setUrl(int $idSite, string $key, string $kind, string $url, string $source, array $extra = []): Target
    {
        $now = Sql::now();
        $was = $this->rowFingerprint($idSite, $key);
        $previous = $this->get($idSite, $key);
        if ($previous !== null && $previous->url !== $url) {
            // a new address starts without the old one's state, certificate date and the server's open outage; an
            // outage from outside ends when its source checked the new address (else the next results would open it
            // again), or when the source stops checking it (ExternalResults::endOutages())
            (new StateStore())->forget([$previous->id]);
            (new IncidentStore())->closeOpen([$previous->id], $now, StateStore::LOCAL);
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
        if ($this->rowFingerprint($idSite, $key) !== $was) {
            self::changed();
        }

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
        if ($target !== null && $target->enabled !== $enabled) {
            self::changed();
        }

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
        if ($result->rowCount() === 0) {
            return false;
        }
        self::changed();

        return true;
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
     * What targets() of the seam gives out, in one string: the current targets with what a check reads of them.
     */
    private function fingerprint(): string
    {
        $rows = Db::fetchAll(
            'SELECT idtarget, idsite, target_key, kind, url, url_source, enabled, extra FROM ' . self::table()
            . ' WHERE retired_at IS NULL AND kind <> ? ORDER BY idtarget',
            [Kind::PROCESSING]
        );

        return sha1((string) json_encode($rows));
    }

    /**
     * fingerprint() of one row, with retired_at (a retired target is not among the current ones): '' when it does not
     * exist.
     */
    private function rowFingerprint(int $idSite, string $key): string
    {
        $row = Db::fetchRow(
            'SELECT kind, url, url_source, enabled, extra, retired_at FROM ' . self::table() . ' WHERE idsite = ? AND target_key = ?',
            [$idSite, $key]
        );

        return $row ? sha1((string) json_encode($row)) : '';
    }

    /** Tells listeners that the current targets changed (ExternalResults::EVENT_TARGETS_CHANGED). */
    private static function changed(): void
    {
        try {
            Piwik::postEvent(ExternalResults::EVENT_TARGETS_CHANGED);
        } catch (\Throwable $e) {
            // a listener never stops a change of the targets
        }
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
