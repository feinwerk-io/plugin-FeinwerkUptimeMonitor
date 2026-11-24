<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Targets;

/**
 * Whether a detected URL replaces a default by itself (spec 5.4): only on Matomo's host or one of the website's own
 * hosts. Anything else is shown as a suggestion, because the HTML it came from is website-controlled input.
 */
final class AdoptionPolicy
{
    public const ADOPT = 'adopt';
    public const SUGGEST = 'suggest';

    /**
     * @param string[] $siteHosts hosts of the website's main URL and alias URLs
     */
    public static function decide(string $url, string $matomoHost, array $siteHosts): string
    {
        $host = strtolower(rtrim((string) parse_url($url, PHP_URL_HOST), '.'));
        if ($host === '') {
            return self::SUGGEST;
        }
        $own = array_map(static fn(string $h): string => strtolower(rtrim($h, '.')), array_merge([$matomoHost], $siteHosts));

        return in_array($host, $own, true) ? self::ADOPT : self::SUGGEST;
    }
}
