<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkSentinel\Check;

class Severity
{
    public const INFO = 'info';
    public const WARNING = 'warning';
    public const CRITICAL = 'critical';

    private const DEDUCTIONS = [self::INFO => 5, self::WARNING => 15, self::CRITICAL => 40];
    private const RANKS = [self::INFO => 1, self::WARNING => 2, self::CRITICAL => 3];

    public static function isValid(string $severity): bool
    {
        return isset(self::RANKS[$severity]);
    }

    /**
     * Points an open incident of this severity takes off the health score.
     */
    public static function deduction(string $severity): int
    {
        return self::DEDUCTIONS[$severity] ?? 0;
    }

    public static function rank(string $severity): int
    {
        return self::RANKS[$severity] ?? 0;
    }
}
