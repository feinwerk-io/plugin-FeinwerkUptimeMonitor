<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Runner;

use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;

/**
 * What one run did.
 */
final class RunReport
{
    /**
     * @param CheckResult[] $results
     */
    public function __construct(
        public readonly int $checked,
        public readonly int $notMeasured,
        public readonly bool $locked,
        public readonly array $results = []
    ) {
    }
}
