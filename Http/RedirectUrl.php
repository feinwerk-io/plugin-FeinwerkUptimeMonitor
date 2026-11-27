<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Http;

/**
 * The absolute URL of a redirect: an answer's Location resolved against the URL that was fetched (RFC 3986, section
 * 5.2, with its dot-segment removal), as curl's CURLINFO_REDIRECT_URL gives it to the curl ways. The fragment is kept, as
 * curl keeps it; the next hop never sends it (Prober::withHost()). Whatever the result is, the hop goes through the
 * guard: this only computes the URL, it decides nothing.
 */
final class RedirectUrl
{
    /** RFC 3986, appendix B */
    private const PARTS = '~^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$~s';

    public static function resolve(string $base, string $location): string
    {
        $reference = self::split(trim($location, " \t"));
        $base = self::split($base);
        if ($reference['scheme'] !== null) {
            $target = ['scheme' => $reference['scheme'], 'authority' => $reference['authority'],
                'path' => self::removeDots($reference['path']), 'query' => $reference['query']];
        } elseif ($reference['authority'] !== null) {
            $target = ['scheme' => $base['scheme'], 'authority' => $reference['authority'],
                'path' => self::removeDots($reference['path']), 'query' => $reference['query']];
        } elseif ($reference['path'] === '') {
            $target = ['scheme' => $base['scheme'], 'authority' => $base['authority'], 'path' => $base['path'],
                'query' => $reference['query'] ?? $base['query']];
        } else {
            $path = $reference['path'][0] === '/' ? $reference['path'] : self::merge($base, $reference['path']);
            $target = ['scheme' => $base['scheme'], 'authority' => $base['authority'], 'path' => self::removeDots($path),
                'query' => $reference['query']];
        }

        return ($target['scheme'] !== null ? $target['scheme'] . ':' : '')
            . ($target['authority'] !== null ? '//' . $target['authority'] : '')
            . $target['path']
            . ($target['query'] !== null ? '?' . $target['query'] : '')
            . ($reference['fragment'] !== null ? '#' . $reference['fragment'] : '');
    }

    /** @return array{scheme: ?string, authority: ?string, path: string, query: ?string, fragment: ?string} */
    private static function split(string $url): array
    {
        // a part that is not there is null, an empty one ("?", "#", "//") is ''
        preg_match(self::PARTS, $url, $m, PREG_UNMATCHED_AS_NULL);

        return ['scheme' => $m[1] ?? null, 'authority' => $m[2] ?? null, 'path' => (string) ($m[3] ?? ''), 'query' => $m[4] ?? null,
            'fragment' => $m[5] ?? null];
    }

    /** RFC 3986, 5.2.3 */
    private static function merge(array $base, string $path): string
    {
        if ($base['authority'] !== null && $base['path'] === '') {
            return '/' . $path;
        }
        $slash = strrpos($base['path'], '/');

        return ($slash === false ? '' : substr($base['path'], 0, $slash + 1)) . $path;
    }

    /** RFC 3986, 5.2.4 */
    private static function removeDots(string $path): string
    {
        $out = '';
        while ($path !== '') {
            if (strncmp($path, '../', 3) === 0) {
                $path = substr($path, 3);
            } elseif (strncmp($path, './', 2) === 0) {
                $path = substr($path, 2);
            } elseif (strncmp($path, '/./', 3) === 0) {
                $path = substr($path, 2);
            } elseif ($path === '/.') {
                $path = '/';
            } elseif (strncmp($path, '/../', 4) === 0 || $path === '/..') {
                $path = '/' . substr($path, $path === '/..' ? 3 : 4);
                $slash = strrpos($out, '/');
                $out = $slash === false ? '' : substr($out, 0, $slash);
            } elseif ($path === '.' || $path === '..') {
                $path = '';
            } else {
                $next = strpos($path, '/', 1);
                $segment = $next === false ? $path : substr($path, 0, $next);
                $out .= $segment;
                $path = $next === false ? '' : substr($path, $next);
            }
        }

        return $out;
    }
}
