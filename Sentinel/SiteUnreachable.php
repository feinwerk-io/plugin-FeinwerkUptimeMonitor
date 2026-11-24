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
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;

/**
 * U02: a website, one of its Tag Manager containers or its tracking proxy cannot be reached from the Matomo server.
 * Silent while Feinwerk Uptime Monitor Pro checks from outside.
 */
final class SiteUnreachable extends UptimeCheck
{
    public function getId(): string
    {
        return 'U02';
    }

    public function getScope(): string
    {
        return self::SCOPE_SITE;
    }

    public function getSeverity(): string
    {
        return Severity::CRITICAL;
    }

    public function evaluate(CheckContext $context): array
    {
        $cache = $this->cache($context);
        if ($cache->proActive() || $context->isInstance()) {
            return [];
        }
        $results = [];
        foreach ($cache->targets($context->idSite()) as $target) {
            if (in_array($target->kind, Kind::SITE, true)) {
                $results[] = $this->reachability($context, $cache, $target, 'FeinwerkUptimeMonitor_AlarmU02_' . $target->kind, [self::label($target)]);
            }
        }

        return $results;
    }

    private static function label(Target $target): string
    {
        if ($target->kind === Kind::CONTAINER) {
            return (string) ($target->extra['idContainer'] ?? $target->key);
        }

        return (string) (parse_url($target->url, PHP_URL_HOST) ?: $target->key);
    }
}
