<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Targets;

/**
 * Finds the tracker, a tracking proxy or renamed tracker files and the Tag Manager containers in a website's HTML
 * (spec 5.4): Matomo's standard snippet (`var u=...`, `setTrackerUrl`, `g.src=...`), script tags and Tag Manager
 * embeds. The HTML is website-controlled input: the results are only URLs, judged later by AdoptionPolicy and the guard.
 */
final class Detector
{
    private const CONTAINER = '/container_([A-Za-z0-9]+)(?:_[A-Za-z]+(?:_[0-9a-f]+)?)?\.js(?:[?#][^"\']*)?$/';

    public function detect(string $html, string $pageUrl): DetectedTargets
    {
        $base = null;
        if (preg_match('/\bvar\s+u\s*=\s*(["\'])([^"\']{1,500})\1/', $html, $m)) {
            $base = $m[2];
        }

        $trackerUrl = null;
        if (preg_match('/["\']setTrackerUrl["\']\s*,\s*(u\s*\+\s*)?(["\'])([^"\']{1,500})\2/', $html, $m)) {
            $trackerUrl = $this->absolute($m[1] !== '' ? (string) $base . $m[3] : $m[3], $pageUrl);
        }

        $jsUrl = null;
        $containers = [];
        $sources = [];
        if (preg_match_all('/\.src\s*=\s*(u\s*\+\s*)?(["\'])([^"\']{1,500})\2/', $html, $all, PREG_SET_ORDER)) {
            foreach ($all as $m) {
                $sources[] = $m[1] !== '' ? (string) $base . $m[3] : $m[3];
            }
        }
        if (preg_match_all('/<script\b[^>]*\bsrc\s*=\s*(["\'])([^"\']{1,500})\1/i', $html, $all, PREG_SET_ORDER)) {
            foreach ($all as $m) {
                $sources[] = $m[2];
            }
        }
        foreach ($sources as $source) {
            $url = $this->absolute($source, $pageUrl);
            if ($url === null) {
                continue;
            }
            $path = (string) parse_url($url, PHP_URL_PATH);
            if (preg_match(self::CONTAINER, $path, $c)) {
                $containers[$c[1]] = $containers[$c[1]] ?? $url;
                continue;
            }
            $isTracker = $base !== null && $base !== '' && str_starts_with($source, $base)
                || preg_match('~/(?:matomo|piwik)\.(?:js|php)$~', $path);
            if ($jsUrl === null && $isTracker) {
                $jsUrl = $url;
            }
        }

        return new DetectedTargets($trackerUrl, $jsUrl, $containers);
    }

    /**
     * Absolute http(s) URL of $ref seen on $pageUrl, or null.
     */
    private function absolute(string $ref, string $pageUrl): ?string
    {
        $ref = trim(html_entity_decode($ref, ENT_QUOTES | ENT_HTML5));
        if ($ref === '') {
            return null;
        }
        $page = parse_url($pageUrl);
        $scheme = strtolower((string) ($page['scheme'] ?? 'https'));
        if (str_starts_with($ref, '//')) {
            $ref = $scheme . ':' . $ref;
        } elseif (str_starts_with($ref, '/')) {
            $ref = $scheme . '://' . ($page['host'] ?? '') . (isset($page['port']) ? ':' . $page['port'] : '') . $ref;
        } elseif (!preg_match('~^https?://~i', $ref)) {
            $dir = preg_replace('~/[^/]*$~', '/', (string) ($page['path'] ?? '/'));
            $ref = $scheme . '://' . ($page['host'] ?? '') . (isset($page['port']) ? ':' . $page['port'] : '') . $dir . $ref;
        }
        $host = parse_url($ref, PHP_URL_HOST);

        return is_string($host) && $host !== '' ? $ref : null;
    }
}
