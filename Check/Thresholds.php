<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Check;

/**
 * Thresholds (spec 6.5): defaults of the super user settings and the fixed critical certificate limit.
 */
final class Thresholds
{
    public const DEFAULT_SLOW_TRACKER_MS = 1000;
    public const DEFAULT_CERT_WARNING_DAYS = 14;
    public const CERT_CRITICAL_DAYS = 3;
}
