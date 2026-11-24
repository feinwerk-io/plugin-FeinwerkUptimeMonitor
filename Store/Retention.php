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
 * Deletes old rows in chunks (spec 9): raw checks after 14 days, hours after 90, days and closed incidents after
 * 400, tracker samples after 2.
 */
final class Retention
{
    public const RULES = [
        [Schema::CHECK, 'checked_at', 14, ''],
        [Schema::SAMPLE, 'sampled_at', 2, ''],
        [Schema::HOUR, 'hour', 90, ''],
        [Schema::DAY, 'day', 400, ''],
        [Schema::INCIDENT, 'ended_at', 400, ' AND ended_at IS NOT NULL'],
    ];

    /**
     * @return int rows deleted
     */
    public function run(\DateTimeImmutable $now, int $chunk = 5000): int
    {
        $deleted = 0;
        foreach (self::RULES as [$table, $column, $days, $extra]) {
            $before = $now->modify('-' . $days . ' days')->format('Y-m-d H:i:s');
            do {
                $result = Db::query(
                    'DELETE FROM ' . Schema::table($table) . " WHERE `$column` < ?" . $extra . ' LIMIT ' . (int) $chunk,
                    [$before]
                );
                $count = $result->rowCount();
                $deleted += $count;
            } while ($count >= $chunk);
        }

        return $deleted;
    }
}
