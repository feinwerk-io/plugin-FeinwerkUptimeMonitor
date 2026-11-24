<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Check;

/**
 * The classified result of one check, as stored. `checkedAt` is UTC `Y-m-d H:i:s`; `certNotAfter` is `Y-m-d`.
 */
final class CheckResult
{
    public function __construct(
        public readonly int $idTarget,
        public readonly string $outcome,
        public readonly ?string $error,
        public readonly ?string $note,
        public readonly ?int $status,
        public readonly array $timings,
        public readonly ?string $certNotAfter,
        public readonly string $checkedAt
    ) {
    }
}
