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
 * (Outcome::BLOCKED or Outcome::DNS). `host` is normalised (lower case, ASCII); `lookupMs` is the DNS time.
 */
final class GuardDecision
{
    /**
     * @param string[] $ips every approved address of the host (the prober pins the connection to them)
     */
    public function __construct(
        public readonly bool $allowed,
        public readonly ?string $ip,
        public readonly ?string $reason,
        public readonly string $host,
        public readonly int $port,
        public readonly string $scheme,
        public readonly array $ips = [],
        public readonly int $lookupMs = 0
    ) {
    }
}
