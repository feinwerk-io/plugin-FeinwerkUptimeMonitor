<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel;

use Piwik\Plugins\FeinwerkSentinel\Check\CheckContext;
use Piwik\Plugins\FeinwerkSentinel\Check\CheckResult;
use Piwik\Plugins\FeinwerkSentinel\Check\Severity;

/**
 * U04: the tracker is slow. The median processing time of real tracking requests in the last hour (at least 20
 * samples), else the median response time of Matomo's tracker endpoint, above the super user threshold (default
 * 1000 ms).
 */
final class SlowTracker extends UptimeCheck
{
    public const MIN_SAMPLES = 20;

    public function getId(): string
    {
        return 'U04';
    }

    public function getScope(): string
    {
        return self::SCOPE_INSTANCE;
    }

    public function getSeverity(): string
    {
        return Severity::WARNING;
    }

    public function evaluate(CheckContext $context): array
    {
        $cache = $this->cache($context);
        $processing = $cache->processing();
        $value = $processing['samples'] >= self::MIN_SAMPLES ? $processing['p50'] : $cache->endpointMedian();
        if ($value === null) {
            return [CheckResult::unknown('', 'no response times in the last hour')];
        }
        $threshold = $cache->slowTrackerMs();
        if ($value <= $threshold) {
            return [CheckResult::normal('', (float) $value, (float) $threshold)];
        }

        return [CheckResult::firing(
            '',
            (float) $value,
            (float) $threshold,
            'FeinwerkUptimeMonitor_AlarmU04',
            [$value, $threshold],
            $context->now()->modify('-1 hour'),
            $context->now(),
            ['medianMs' => $value, 'thresholdMs' => $threshold, 'measure' => $processing['samples'] >= self::MIN_SAMPLES ? 'processing' : 'endpoint']
        )];
    }
}
