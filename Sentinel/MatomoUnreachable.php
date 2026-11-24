<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel;

use Piwik\Plugins\FeinwerkSentinel\Check\CheckContext;
use Piwik\Plugins\FeinwerkSentinel\Check\Severity;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;

/**
 * U01: Matomo's interface, tracker endpoint or JavaScript tracker cannot be reached from the Matomo server.
 * Silent while Feinwerk Uptime Monitor Pro checks from outside (its own alerts, no double alarm).
 */
final class MatomoUnreachable extends UptimeCheck
{
    public function getId(): string
    {
        return 'U01';
    }

    public function getScope(): string
    {
        return self::SCOPE_INSTANCE;
    }

    public function getSeverity(): string
    {
        return Severity::CRITICAL;
    }

    public function evaluate(CheckContext $context): array
    {
        $cache = $this->cache($context);
        if ($cache->proActive()) {
            return [];
        }
        $results = [];
        foreach ($cache->targets(0) as $target) {
            if (in_array($target->kind, Kind::INSTANCE, true)) {
                $results[] = $this->reachability($context, $cache, $target, 'FeinwerkUptimeMonitor_AlarmU01_' . $target->kind, []);
            }
        }

        return $results;
    }
}
