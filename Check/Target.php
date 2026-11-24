<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Check;

/**
 * One thing that is checked: a URL of the Matomo instance (idSite 0) or of a website.
 *
 * `extra` carries what the classifier needs: `matomoHost`, `loginHost` (SSO), `idContainer` and `revision` (Tag
 * Manager containers).
 */
final class Target
{
    public function __construct(
        public readonly int $id,
        public readonly int $idSite,
        public readonly string $key,
        public readonly string $kind,
        public readonly string $url,
        public readonly string $urlSource,
        public readonly array $extra = [],
        public readonly ?string $firstUpAt = null,
        public readonly bool $enabled = true,
        public readonly ?string $lastCheckedAt = null
    ) {
    }

    /**
     * One of Matomo's own addresses: its interface, tracker and JavaScript tracker, and the Tag Manager containers it
     * serves itself (default container targets are built from Matomo's own URL). Such an address may be the server's
     * loopback when private addresses are allowed; an address a website admin set never is.
     */
    public function isInstanceAddress(): bool
    {
        return $this->idSite === 0 || ($this->kind === Kind::CONTAINER && $this->urlSource === 'default');
    }

    /** The same target with other classifier data (e.g. the container revision that is live right now). */
    public function withExtra(array $extra): self
    {
        return new self($this->id, $this->idSite, $this->key, $this->kind, $this->url, $this->urlSource, $extra,
            $this->firstUpAt, $this->enabled, $this->lastCheckedAt);
    }
}
