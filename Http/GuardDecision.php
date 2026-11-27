<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Http;

/**
 * The guard's answer for one URL: allowed with the addresses to connect to, or refused with `reason`
 * (Outcome::BLOCKED, Outcome::DNS, or Outcome::PHP_DISABLED when the PHP functions to decide are disabled). `host` is
 * normalised (lower case, ASCII); `lookupMs` is the time this decision waited for the lookup (0 when the guard had the
 * answer from before), `answerMs` the time that lookup took when it was made (the same unless the answer was kept).
 */
final class GuardDecision
{
    public readonly int $answerMs;

    /**
     * @param string[] $ips every approved address of the host (the prober pins the connection to them)
     * @param int|null $answerMs the lookup's time when it was made; default $lookupMs
     */
    public function __construct(
        public readonly bool $allowed,
        public readonly ?string $ip,
        public readonly ?string $reason,
        public readonly string $host,
        public readonly int $port,
        public readonly string $scheme,
        public readonly array $ips = [],
        public readonly int $lookupMs = 0,
        ?int $answerMs = null
    ) {
        $this->answerMs = $answerMs ?? $lookupMs;
    }
}
