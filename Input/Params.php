<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Input;

/**
 * Checks API parameters (no Matomo code, unit-tested). Strings are trimmed; errors are InvalidParameter. A wrongly typed
 * value (an array, which Matomo 6 passes on to untyped API parameters) reads as its type name ("array"), which no rule
 * accepts. Feinwerk Uptime Monitor Pro keeps a copy: keep both alike.
 */
final class Params
{
    /**
     * @param string[] $allowed
     */
    public static function oneOf(string $name, $value, array $allowed): string
    {
        $value = self::text($value);
        if (!in_array($value, $allowed, true)) {
            throw new InvalidParameter($name, $value, $allowed);
        }

        return $value;
    }

    public static function wholeNumber(string $name, $value, int $min, int $max): int
    {
        $text = self::text($value);
        if (!preg_match('/^-?\d+$/', $text) || (int) $text < $min || (int) $text > $max) {
            throw new InvalidParameter($name, $text, [], $min, $max);
        }

        return (int) $text;
    }

    public static function flag(string $name, $value): bool
    {
        return self::oneOf($name, $value === true ? '1' : ($value === false ? '0' : $value), ['0', '1']) === '1';
    }

    /**
     * Like url(), without query string or fragment: the tracker, the JavaScript tracker and a proxy are checked with
     * a request without parameters (a parameter could record a visit).
     */
    public static function bareUrl(string $name, $value): string
    {
        $url = self::url($name, $value);
        if (parse_url($url, PHP_URL_QUERY) !== null || parse_url($url, PHP_URL_FRAGMENT) !== null) {
            throw new InvalidParameter($name, $url, ['https://host/path (without ? or #)']);
        }

        return $url;
    }

    /**
     * An absolute http(s) URL without credentials, at most 2048 characters.
     */
    public static function url(string $name, $value): string
    {
        $url = self::text($value);
        $parts = parse_url($url);
        if (strlen($url) > 2048 || $parts === false || !preg_match('~^https?://~i', $url) || empty($parts['host'])
            || isset($parts['user']) || isset($parts['pass']) || preg_match('/\s/', $url)
        ) {
            throw new InvalidParameter($name, $url, ['http://...', 'https://...']);
        }

        return $url;
    }

    /** A scalar trimmed; anything else (an array, an object) as its type name, which no rule accepts. */
    public static function text($value): string
    {
        return is_scalar($value) || $value === null ? trim((string) $value) : get_debug_type($value);
    }
}
