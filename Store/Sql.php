<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Store;

use Piwik\Db;

/**
 * Multi-row writes: one statement per chunk instead of one per row.
 */
final class Sql
{
    public const CHUNK = 500;

    /**
     * @param string[] $columns
     * @param array<int, array<int, mixed>> $rows values in the order of $columns
     * @param string $onDuplicate e.g. "url = VALUES(url)"; empty for a plain INSERT
     */
    public static function insertRows(string $table, array $columns, array $rows, string $onDuplicate = ''): void
    {
        if ($rows === []) {
            return;
        }
        $placeholder = '(' . implode(', ', array_fill(0, count($columns), '?')) . ')';
        foreach (array_chunk($rows, self::CHUNK) as $chunk) {
            $bind = [];
            foreach ($chunk as $row) {
                foreach ($row as $value) {
                    $bind[] = $value;
                }
            }
            $sql = 'INSERT INTO ' . $table . ' (`' . implode('`, `', $columns) . '`) VALUES '
                . implode(', ', array_fill(0, count($chunk), $placeholder))
                . ($onDuplicate !== '' ? ' ON DUPLICATE KEY UPDATE ' . $onDuplicate : '');
            Db::query($sql, $bind);
        }
    }

    /**
     * @param int[] $ids
     * @return string "?, ?, ?" for an IN list
     */
    public static function placeholders(array $ids): string
    {
        return implode(', ', array_fill(0, max(1, count($ids)), '?'));
    }

    public static function now(): string
    {
        return gmdate('Y-m-d H:i:s');
    }
}
