<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkSentinel\Check;

/**
 * A Sentinel check. Part of the public API of this plugin: other plugins add checks through the event
 * FeinwerkSentinel.registerChecks.
 *
 * A check is evaluated per site (scope "site", idSite > 0), once per run for the whole instance (scope "instance",
 * idSite 0) or both (scope "both"). Hourly checks run every run; daily checks once per completed local day of the site
 * (CheckContext::day()). A check returns one result per subject; most checks have one subject, the empty string.
 */
interface Check
{
    public const SCOPE_SITE = 'site';
    public const SCOPE_INSTANCE = 'instance';
    public const SCOPE_BOTH = 'both';

    public const CADENCE_HOURLY = 'hourly';
    public const CADENCE_DAILY = 'daily';

    /**
     * Stable ID, e.g. "S01". Letters, digits and underscores, starting with a letter, at most 32 characters.
     */
    public function getId(): string;

    public function getScope(): string;

    public function getCadence(): string;

    /**
     * Default severity of the incidents this check opens (Severity::*).
     */
    public function getSeverity(): string;

    /**
     * Parameters a site can override, with their defaults (positive numbers).
     *
     * @return array<string, int|float>
     */
    public function getDefaultParameters(): array;

    /**
     * Translation keys of the name and of a one-sentence description.
     */
    public function getNameKey(): string;

    public function getDescriptionKey(): string;

    /**
     * @return CheckResult[]
     */
    public function evaluate(CheckContext $context): array;
}
