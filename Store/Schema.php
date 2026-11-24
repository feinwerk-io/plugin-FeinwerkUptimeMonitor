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
use Piwik\DbHelper;

/**
 * The plugin's own tables (spec 9). Times are UTC.
 */
final class Schema
{
    public const TARGET = 'fw_uptimemonitor_target';
    public const CHECK = 'fw_uptimemonitor_check';
    public const STATE = 'fw_uptimemonitor_state';
    public const HOUR = 'fw_uptimemonitor_hour';
    public const DAY = 'fw_uptimemonitor_day';
    public const INCIDENT = 'fw_uptimemonitor_incident';
    public const SAMPLE = 'fw_uptimemonitor_tracker_sample';

    /**
     * @return string[] unprefixed table names
     */
    public static function tables(): array
    {
        return [self::TARGET, self::CHECK, self::STATE, self::HOUR, self::DAY, self::INCIDENT, self::SAMPLE];
    }

    public static function table(string $name): string
    {
        return Common::prefixTable($name);
    }

    public static function create(): void
    {
        DbHelper::createTable(self::TARGET, '
            `idtarget` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `idsite` INT UNSIGNED NOT NULL,
            `target_key` VARCHAR(40) NOT NULL,
            `kind` VARCHAR(16) NOT NULL,
            `url` VARCHAR(2048) NOT NULL,
            `url_source` VARCHAR(10) NOT NULL,
            `enabled` TINYINT(1) NOT NULL DEFAULT 1,
            `extra` TEXT NULL,
            `detected_at` DATETIME NULL,
            `first_up_at` DATETIME NULL,
            `last_checked_at` DATETIME NULL,
            `retired_at` DATETIME NULL,
            `created` DATETIME NOT NULL,
            `updated` DATETIME NOT NULL,
            PRIMARY KEY (`idtarget`),
            UNIQUE KEY `site_key` (`idsite`, `target_key`)
        ');
        DbHelper::createTable(self::CHECK, '
            `idcheck` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            `idtarget` INT UNSIGNED NOT NULL,
            `checked_at` DATETIME NOT NULL,
            `outcome` VARCHAR(16) NOT NULL,
            `error` VARCHAR(20) NULL,
            `note` VARCHAR(20) NULL,
            `status` SMALLINT UNSIGNED NULL,
            `ms_dns` INT UNSIGNED NOT NULL DEFAULT 0,
            `ms_connect` INT UNSIGNED NOT NULL DEFAULT 0,
            `ms_tls` INT UNSIGNED NOT NULL DEFAULT 0,
            `ms_ttfb` INT UNSIGNED NOT NULL DEFAULT 0,
            `ms_total` INT UNSIGNED NOT NULL DEFAULT 0,
            `cert_not_after` DATE NULL,
            PRIMARY KEY (`idcheck`),
            KEY `target_time` (`idtarget`, `checked_at`),
            KEY `checked_at` (`checked_at`)
        ');
        DbHelper::createTable(self::STATE, '
            `idtarget` INT UNSIGNED NOT NULL,
            `source` VARCHAR(10) NOT NULL,
            `outcome` VARCHAR(16) NOT NULL,
            `error` VARCHAR(20) NULL,
            `note` VARCHAR(20) NULL,
            `status` SMALLINT UNSIGNED NULL,
            `ms_total` INT UNSIGNED NULL,
            `cert_not_after` DATE NULL,
            `checked_at` DATETIME NOT NULL,
            PRIMARY KEY (`idtarget`, `source`)
        ');
        foreach ([self::HOUR => '`hour` DATETIME NOT NULL', self::DAY => '`day` DATE NOT NULL'] as $table => $grain) {
            $column = $table === self::HOUR ? 'hour' : 'day';
            DbHelper::createTable($table, '
                `idtarget` INT UNSIGNED NOT NULL,
                ' . $grain . ',
                `source` VARCHAR(10) NOT NULL,
                `samples` INT UNSIGNED NOT NULL DEFAULT 0,
                `up_samples` INT UNSIGNED NOT NULL DEFAULT 0,
                `bulk_samples` INT UNSIGNED NOT NULL DEFAULT 0,
                `measured_seconds` INT UNSIGNED NOT NULL DEFAULT 0,
                `up_seconds` INT UNSIGNED NOT NULL DEFAULT 0,
                `ms_p50` INT UNSIGNED NULL,
                `ms_p95` INT UNSIGNED NULL,
                `ms_max` INT UNSIGNED NULL,
                `cert_not_after` DATE NULL,
                PRIMARY KEY (`idtarget`, `' . $column . '`, `source`),
                KEY `' . $column . '` (`' . $column . '`)
            ');
        }
        DbHelper::createTable(self::INCIDENT, '
            `idincident` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `idtarget` INT UNSIGNED NOT NULL,
            `source` VARCHAR(10) NOT NULL,
            `kind` VARCHAR(10) NOT NULL,
            `started_at` DATETIME NOT NULL,
            `ended_at` DATETIME NULL,
            `cause` VARCHAR(20) NULL,
            `detail` VARCHAR(255) NULL,
            `down_samples` INT UNSIGNED NOT NULL DEFAULT 0,
            PRIMARY KEY (`idincident`),
            UNIQUE KEY `target_start` (`idtarget`, `source`, `kind`, `started_at`),
            KEY `open` (`idtarget`, `ended_at`),
            KEY `started_at` (`started_at`)
        ');
        DbHelper::createTable(self::SAMPLE, '
            `idsample` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            `sampled_at` DATETIME NOT NULL,
            `ms` INT UNSIGNED NOT NULL,
            `is_bulk` TINYINT(1) NOT NULL DEFAULT 0,
            PRIMARY KEY (`idsample`),
            KEY `sampled_at` (`sampled_at`)
        ');
    }

    public static function drop(): void
    {
        Db::dropTables(array_map([self::class, 'table'], self::tables()));
    }
}
