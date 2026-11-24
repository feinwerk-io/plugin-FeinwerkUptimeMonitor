<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel;

use Piwik\Piwik;
use Piwik\Plugins\FeinwerkSentinel\Check\Check;
use Piwik\Plugins\FeinwerkSentinel\Check\CheckContext;
use Piwik\Plugins\FeinwerkSentinel\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;

/**
 * Base of the checks this plugin adds to Feinwerk Sentinel (shared interface `FeinwerkSentinel.registerChecks`,
 * spec 8). Uses only what Sentinel 5.0.0 offers: Check, CheckResult::firing/normal/unknown and CheckContext's
 * idSite(), isInstance(), now(), param(). Reads stored results only: the HTTP checks run in this plugin's own task.
 * Only what is still down at check time goes to Sentinel; outages that are already over stay in this plugin's pages.
 */
abstract class UptimeCheck implements Check
{
    /**
     * @param \Closure(CheckContext): StateCache|null $cache the run's data; default StateCache::forRun()
     * @param \Closure(string, array): string|null $translate default Piwik::translate()
     */
    public function __construct(private ?\Closure $cache = null, private ?\Closure $translate = null)
    {
    }

    public function getCadence(): string
    {
        return self::CADENCE_HOURLY;
    }

    public function getDefaultParameters(): array
    {
        return [];
    }

    public function getNameKey(): string
    {
        return 'FeinwerkUptimeMonitor_Check' . $this->getId() . 'Name';
    }

    public function getDescriptionKey(): string
    {
        return 'FeinwerkUptimeMonitor_Check' . $this->getId() . 'Description';
    }

    protected function cache(CheckContext $context): StateCache
    {
        return $this->cache !== null ? ($this->cache)($context) : StateCache::forRun($context->now()->format('Y-m-d H:i'));
    }

    protected function translate(string $key, array $params = []): string
    {
        return $this->translate !== null ? ($this->translate)($key, $params) : Piwik::translate($key, $params);
    }

    /**
     * Firing, normal or unknown for one target from its latest local state. Unknown when the state is older than two
     * check intervals (the checks stalled) or the target cannot be checked from this server: never the old state.
     *
     * @param array $messageParams placeholders after "since" and "cause"
     */
    protected function reachability(CheckContext $context, StateCache $cache, Target $target, string $messageKey, array $messageParams): CheckResult
    {
        $state = $cache->state($target->id);
        if ($state === null) {
            return CheckResult::unknown($target->key, 'not checked yet');
        }
        $checked = new \DateTimeImmutable($state['checked_at'], new \DateTimeZone('UTC'));
        if ($context->now()->getTimestamp() - $checked->getTimestamp() > $cache->staleAfter()) {
            return CheckResult::unknown($target->key, 'no recent check');
        }
        if ($state['outcome'] === Outcome::NOT_CHECKABLE) {
            return CheckResult::unknown($target->key, 'not checkable from this server');
        }
        if ($state['outcome'] === Outcome::UP) {
            return CheckResult::normal($target->key);
        }

        $since = new \DateTimeImmutable($cache->openSince($target->id) ?? $state['checked_at'], new \DateTimeZone('UTC'));
        $cause = $this->translate('FeinwerkUptimeMonitor_Cause_' . ($state['error'] ?? 'unknown'));
        if ($state['status'] !== null && $state['error'] === Outcome::HTTP_STATUS) {
            $cause .= ' ' . $state['status'];
        }

        return CheckResult::firing(
            $target->key,
            null,
            null,
            $messageKey,
            array_merge($messageParams, [$since->format('Y-m-d H:i') . ' UTC', $cause]),
            $since,
            $context->now(),
            ['targetKey' => $target->key, 'kind' => $target->kind, 'error' => $state['error'], 'httpStatus' => $state['status']]
        );
    }
}
