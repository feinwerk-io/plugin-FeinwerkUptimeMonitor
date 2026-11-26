<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Check;

/**
 * What the prober got back for one target. `status` is null when no HTTP answer arrived; `error` is one of the
 * transport errors of Outcome (or null); `timings` holds `dns`, `connect`, `tls`, `ttfb` and `total` in ms; `body` is
 * at most Prober::MAX_BODY bytes (MAX_BODY_LARGE for the interface and Tag Manager containers); `capped`: the answer
 * went on past that cap, so the body ends where the prober stopped reading, not where the answer ended.
 */
final class ProbeResponse
{
    public function __construct(
        public readonly ?int $status,
        public readonly string $body,
        public readonly ?string $error,
        public readonly string $finalUrl,
        public readonly array $timings,
        public readonly ?string $certNotAfter,
        public readonly int $redirects,
        public readonly bool $capped = false
    ) {
    }
}
