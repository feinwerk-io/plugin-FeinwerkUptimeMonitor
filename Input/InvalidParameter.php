<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Input;

/**
 * A parameter with a value outside what is allowed: names the parameter, the value and the allowed values or range.
 */
final class InvalidParameter extends \InvalidArgumentException
{
    /**
     * @param string[] $allowed
     */
    public function __construct(
        public readonly string $parameter,
        public readonly string $value,
        public readonly array $allowed = [],
        public readonly ?int $min = null,
        public readonly ?int $max = null
    ) {
        parent::__construct("$parameter: '$value' is not allowed");
    }
}
