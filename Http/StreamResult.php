<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Http;

/**
 * What one transfer of StreamTransport got: what curl's handle and its callbacks give the curl ways. `error` is an
 * Outcome transport error or null; `status`, `body`, `capped` and `headers` (Prober::KEPT_HEADERS of the final answer)
 * as ProbeResponse; `location` the raw Location of a redirect (null without one); the times in milliseconds from the
 * transfer's start as curl measures them (connect: the TCP connection, tls: from there to the finished handshake, ttfb:
 * the first byte of the answer, total); `trustAnchorProblem`: the CA file it verified with holds no trust anchor for the
 * certificate (or could not be loaded), so the server's trust store may (TrustFile); `lostMs`: time spent on a
 * diagnosis that the times do not report and the check's 10 seconds count.
 */
final class StreamResult
{
    /**
     * @param array<string, string> $headers
     */
    public function __construct(
        public readonly ?string $error,
        public readonly ?int $status = null,
        public readonly string $body = '',
        public readonly bool $capped = false,
        public readonly array $headers = [],
        public readonly ?string $location = null,
        public readonly int $connectMs = 0,
        public readonly int $tlsMs = 0,
        public readonly int $ttfbMs = 0,
        public readonly int $totalMs = 0,
        public readonly ?string $certNotAfter = null,
        public readonly bool $trustAnchorProblem = false,
        public readonly int $lostMs = 0
    ) {
    }
}
