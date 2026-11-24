<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Targets;

/**
 * What the detector found in a website's HTML: absolute URLs of the tracker endpoint, the JavaScript tracker and the
 * Tag Manager containers (by container id).
 */
final class DetectedTargets
{
    /**
     * @param array<string, string> $containerUrls container id => URL
     */
    public function __construct(
        public readonly ?string $trackerUrl,
        public readonly ?string $jsUrl,
        public readonly array $containerUrls
    ) {
    }

    public function isEmpty(): bool
    {
        return $this->trackerUrl === null && $this->jsUrl === null && $this->containerUrls === [];
    }
}
