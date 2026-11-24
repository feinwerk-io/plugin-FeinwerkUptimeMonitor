<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Check;

/**
 * The kinds of check targets (spec 5.1, 5.2).
 */
final class Kind
{
    public const UI = 'ui';
    public const TRACKER = 'tracker';
    public const JS = 'js';
    public const WEB = 'web';
    public const CONTAINER = 'container';
    public const PROXY = 'proxy';

    /** Pseudo target that carries the processing time of real tracking requests (spec 6.6); never probed. */
    public const PROCESSING = 'processing';

    /** Kinds that belong to the Matomo instance (idSite 0). */
    public const INSTANCE = [self::UI, self::TRACKER, self::JS];

    /** Kinds that belong to a website. */
    public const SITE = [self::WEB, self::CONTAINER, self::PROXY];

    /**
     * @return string[]
     */
    public static function all(): array
    {
        return array_merge(self::INSTANCE, self::SITE);
    }
}
