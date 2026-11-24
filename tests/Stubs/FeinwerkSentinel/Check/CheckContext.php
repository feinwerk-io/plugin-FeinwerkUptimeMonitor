<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkSentinel\Check;

/**
 * Test stand-in for FeinwerkSentinel's CheckContext (v5.0.0), reduced to the methods Feinwerk Uptime Monitor's checks
 * may use: idSite(), isInstance(), now(), param(). Check.php, CheckResult.php and Severity.php next to it are verbatim
 * copies of FeinwerkSentinel v5.0.0 (`git show v5.0.0:Check/<file>`), the oldest Sentinel this plugin supports.
 * Loaded only when the real Sentinel is not (tests/Unit/Sentinel/SentinelStubs.php).
 */
class CheckContext
{
    public function __construct(private int $idSite, private \DateTimeImmutable $now, private array $params = [])
    {
    }

    public function idSite(): int
    {
        return $this->idSite;
    }

    public function isInstance(): bool
    {
        return $this->idSite === 0;
    }

    public function now(): \DateTimeImmutable
    {
        return $this->now;
    }

    /**
     * @return int|float
     */
    public function param(string $name)
    {
        if (!array_key_exists($name, $this->params)) {
            throw new \InvalidArgumentException('Unknown parameter ' . $name);
        }

        return $this->params[$name];
    }
}
