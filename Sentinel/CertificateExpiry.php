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
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Thresholds;

/**
 * U03: a TLS certificate of Matomo (instance) or of a website's address (site) expires soon: a warning from the
 * super user setting (default 14 days before), critical from 3 days before and once expired.
 */
final class CertificateExpiry extends UptimeCheck
{
    public function getId(): string
    {
        return 'U03';
    }

    public function getScope(): string
    {
        return self::SCOPE_BOTH;
    }

    public function getSeverity(): string
    {
        return Severity::WARNING;
    }

    public function evaluate(CheckContext $context): array
    {
        $cache = $this->cache($context);
        $results = [];
        $seenHosts = [];
        foreach ($cache->targets($context->idSite()) as $target) {
            $host = (string) parse_url($target->url, PHP_URL_HOST);
            // Matomo's own certificate (also behind the containers) is the instance's alarm, not every website's
            if (!$context->isInstance() && $host !== '' && strtolower($host) === strtolower((string) ($target->extra['matomoHost'] ?? ''))) {
                continue;
            }
            $state = $cache->state($target->id) ?? $cache->state($target->id, StateStore::EXTERNAL);
            $notAfter = $state['cert_not_after'] ?? null;
            if ($notAfter === null || isset($seenHosts[$host])) {
                continue;
            }
            $seenHosts[$host] = true;
            $end = new \DateTimeImmutable($notAfter . ' 23:59:59', new \DateTimeZone('UTC'));
            $days = (int) floor(($end->getTimestamp() - $context->now()->getTimestamp()) / 86400);
            if ($days > $cache->certWarningDays()) {
                $results[] = CheckResult::normal($target->key, (float) $days, (float) $cache->certWarningDays());
                continue;
            }
            $critical = $days <= Thresholds::CERT_CRITICAL_DAYS;
            $results[] = CheckResult::firing(
                $target->key,
                (float) $days,
                (float) $cache->certWarningDays(),
                $days < 0 ? 'FeinwerkUptimeMonitor_AlarmU03Expired' : 'FeinwerkUptimeMonitor_AlarmU03',
                [$host, $notAfter, max(0, $days)],
                $context->now(),
                $end,
                ['targetKey' => $target->key, 'notAfter' => $notAfter, 'daysLeft' => $days],
                $critical ? Severity::CRITICAL : Severity::WARNING
            );
        }

        return $results;
    }
}
