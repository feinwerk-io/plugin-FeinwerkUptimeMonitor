<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Http;

/**
 * Decides whether the prober may request a URL and which address it connects to. Implemented by AddressGuard.
 */
interface UrlGuard
{
    /**
     * Resolves the host and checks every address.
     *
     * @param bool $instanceTarget one of Matomo's own addresses (set by super users): may be the server's loopback
     *                             when private addresses are allowed
     */
    public function check(string $url, bool $instanceTarget = false): GuardDecision;

    /** For requests through a proxy, which resolves the host itself. */
    public function checkWithoutResolving(string $url, bool $instanceTarget = false): GuardDecision;
}
