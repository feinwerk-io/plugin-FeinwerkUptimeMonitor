<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Http;

/**
 * Internationalised host names in ASCII where PHP has no intl extension (no idn_to_ascii): website addresses with
 * umlauts, as entered in Matomo. RFC 3492 punycode per label, after what browsers (WHATWG URL) and idn_to_ascii with
 * UTS46 nontransitional processing do to such names (L8 review of 5.4.0, SHOULD 4): lower case (mb_strtolower), NFC
 * (Normalizer; Matomo ships both as polyfills), ß kept as ß (IDNA2008: straße.de and strasse.de are two domains).
 *
 * Only for names whose result cannot differ from UTS46 (security review of D3): after NFC every character is ASCII or a
 * Latin letter with a common diacritic (U+00C0 to U+017F without U+00D7 and U+00F7; so not U+1E9E, which UTS46 maps to
 * "ss"), after lower case NFKC changes nothing (no full-width letters, no dot variants such as U+3002, U+FF0E, U+FF61,
 * no long s or ligatures). Such names are UNSUPPORTED: the guard refuses them with the note needs_intl instead of
 * guessing. What UTS46 itself refuses is INVALID (SHOULD 5; the guard blocks it, as with intl): an empty label, ASCII
 * that no host name has, a hyphen at the start or the end of a label or at its third and fourth place (CheckHyphens), an
 * xn-- label that is not the encoding of a valid label, a label over 63 or a name over 253 characters.
 * The prober then sends exactly this ASCII name (Prober::withHost()), so the name checked is the name fetched.
 */
final class Punycode
{
    /** a name UTS46 refuses: intl refuses it too, the guard blocks it */
    public const INVALID = 'invalid';
    /** a name only intl can convert safely: not checkable without it (note needs_intl) */
    public const UNSUPPORTED = 'unsupported';

    private const BASE = 36;
    private const TMIN = 1;
    private const TMAX = 26;
    private const SKEW = 38;
    private const DAMP = 700;
    private const INITIAL_BIAS = 72;
    private const INITIAL_N = 128;
    private const MAX_LABEL = 63;
    private const MAX_NAME = 253;
    /** before lower case: ASCII and the Latin letters whose UTS46 mapping is mb_strtolower's */
    private const INPUT = '/^[\x00-\x7f\x{00C0}-\x{00D6}\x{00D8}-\x{00F6}\x{00F8}-\x{017F}]*$/u';
    /** after lower case: ASCII host characters and Latin letters with common diacritics */
    private const ALLOWED = '/^[a-z0-9.\-\x{00DF}-\x{00F6}\x{00F8}-\x{017F}]*$/u';

    /**
     * The host in ASCII ("xn--" labels), or null when it cannot be converted here (see convert()).
     *
     * @param Capabilities|null $capabilities the PHP functions there are; default PHP's function_exists
     */
    public static function toAscii(string $host, ?Capabilities $capabilities = null): ?string
    {
        return self::convert($host, $capabilities)[0];
    }

    /**
     * The host in ASCII and null, or null and why not: INVALID (UTS46 refuses it, so does intl) or UNSUPPORTED (only
     * intl converts it safely; also without mb_strtolower or Normalizer, which Matomo ships as polyfills).
     *
     * @param Capabilities|null $capabilities the PHP functions there are; default PHP's function_exists
     * @return array{0: ?string, 1: ?string}
     */
    public static function convert(string $host, ?Capabilities $capabilities = null): array
    {
        if (!preg_match('//u', $host)) {
            return [null, self::INVALID];
        }
        if (!($capabilities ?? new Capabilities())->has('mb_strtolower') || !class_exists('Normalizer')) {
            return [null, self::UNSUPPORTED];
        }
        $host = \Normalizer::normalize($host, \Normalizer::FORM_C);
        if (!is_string($host) || !preg_match(self::INPUT, $host)) {
            return [null, self::UNSUPPORTED];
        }
        $host = \Normalizer::normalize(mb_strtolower($host, 'UTF-8'), \Normalizer::FORM_C);
        // only what UTS46 maps no differently: NFKC changes nothing, and nothing outside the Latin letters
        if (!is_string($host) || \Normalizer::normalize($host, \Normalizer::FORM_KC) !== $host) {
            return [null, self::UNSUPPORTED];
        }
        if (preg_match('/[\x00-\x2c\x2f\x3a-\x60\x7b-\x7f]/', $host)) {
            // ASCII that no host name has (an underscore, a "!"): refused after intl's conversion as well
            return [null, self::INVALID];
        }
        if (!preg_match(self::ALLOWED, $host)) {
            return [null, self::UNSUPPORTED];
        }
        $labels = [];
        foreach (explode('.', $host) as $label) {
            [$ascii, $why] = self::label($label);
            if ($ascii === null) {
                return [null, $why];
            }
            $labels[] = $ascii;
        }
        $name = implode('.', $labels);

        return strlen($name) > self::MAX_NAME ? [null, self::INVALID] : [$name, null];
    }

    /**
     * One label (lower case, NFC) in ASCII, or null and why not.
     *
     * @return array{0: ?string, 1: ?string}
     */
    private static function label(string $label): array
    {
        if ($label === '') {
            return [null, self::INVALID];
        }
        if (strncmp($label, 'xn--', 4) === 0) {
            return self::aLabel($label);
        }
        if (!self::hyphensValid($label)) {
            return [null, self::INVALID];
        }
        $ascii = preg_match('/[^\x00-\x7f]/', $label) ? 'xn--' . self::encode($label) : $label;

        return strlen($ascii) > self::MAX_LABEL ? [null, self::INVALID] : [$ascii, null];
    }

    /**
     * An xn-- label as it stands: valid when it decodes to a label that is already in its mapped form (lower case, NFC,
     * nothing NFKC changes, hyphens as for any label) and of the allowed letters, and encodes to exactly this label again
     * (UTS46 validates A-labels so too). A label of other scripts, or the encoding of plain ASCII, only intl can judge.
     *
     * @return array{0: ?string, 1: ?string}
     */
    private static function aLabel(string $label): array
    {
        $decoded = self::decode(substr($label, 4));
        // no valid encoding, or a code point that is never in a label's mapped form: controls, Latin-1 symbols,
        // capitals, the signs of multiplication and division (UTS46 refuses such an A-label)
        if ($decoded === null || $decoded === '' || preg_match('/[\x{0080}-\x{00DE}\x{00F7}]/u', $decoded)
            || \Normalizer::normalize(mb_strtolower($decoded, 'UTF-8'), \Normalizer::FORM_C) !== $decoded
            || \Normalizer::normalize($decoded, \Normalizer::FORM_KC) !== $decoded || !self::hyphensValid($decoded)
        ) {
            return [null, self::INVALID];
        }
        if (!preg_match('/[^\x00-\x7f]/', $decoded) || !preg_match(self::ALLOWED, $decoded)) {
            return [null, self::UNSUPPORTED];
        }

        return 'xn--' . self::encode($decoded) === $label && strlen($label) <= self::MAX_LABEL ? [$label, null] : [null, self::INVALID];
    }

    /** UTS46 CheckHyphens: no hyphen at the start or the end, none at both the third and the fourth character */
    private static function hyphensValid(string $label): bool
    {
        $chars = preg_split('//u', $label, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return ($chars[0] ?? '') !== '-' && end($chars) !== '-' && !(($chars[2] ?? '') === '-' && ($chars[3] ?? '') === '-');
    }

    /** RFC 3492 section 6.3 */
    private static function encode(string $label): string
    {
        $codePoints = [];
        foreach (preg_split('//u', $label, -1, PREG_SPLIT_NO_EMPTY) ?: [] as $char) {
            $codePoints[] = self::codePoint($char);
        }
        $output = '';
        foreach ($codePoints as $cp) {
            if ($cp < 0x80) {
                $output .= chr($cp);
            }
        }
        $basic = strlen($output);
        $handled = $basic;
        if ($basic > 0) {
            $output .= '-';
        }
        $n = self::INITIAL_N;
        $delta = 0;
        $bias = self::INITIAL_BIAS;
        $total = count($codePoints);
        while ($handled < $total) {
            $m = PHP_INT_MAX;
            foreach ($codePoints as $cp) {
                if ($cp >= $n && $cp < $m) {
                    $m = $cp;
                }
            }
            $delta += ($m - $n) * ($handled + 1);
            $n = $m;
            foreach ($codePoints as $cp) {
                if ($cp < $n) {
                    $delta++;
                }
                if ($cp === $n) {
                    $q = $delta;
                    for ($k = self::BASE; ; $k += self::BASE) {
                        $t = $k <= $bias ? self::TMIN : ($k >= $bias + self::TMAX ? self::TMAX : $k - $bias);
                        if ($q < $t) {
                            break;
                        }
                        $output .= self::digit($t + ($q - $t) % (self::BASE - $t));
                        $q = intdiv($q - $t, self::BASE - $t);
                    }
                    $output .= self::digit($q);
                    $bias = self::adapt($delta, $handled + 1, $handled === $basic);
                    $delta = 0;
                    $handled++;
                }
            }
            $delta++;
            $n++;
        }

        return $output;
    }

    /** RFC 3492 section 6.2; null when the input is no valid encoding */
    private static function decode(string $input): ?string
    {
        $delimiter = strrpos($input, '-');
        $basic = $delimiter !== false ? $delimiter : 0;
        $output = [];
        for ($j = 0; $j < $basic; $j++) {
            $output[] = ord($input[$j]);
        }
        $n = self::INITIAL_N;
        $i = 0;
        $bias = self::INITIAL_BIAS;
        $length = strlen($input);
        for ($in = $basic > 0 ? $basic + 1 : 0; $in < $length;) {
            $old = $i;
            $w = 1;
            for ($k = self::BASE; ; $k += self::BASE) {
                if ($in >= $length) {
                    return null;
                }
                $c = ord($input[$in++]);
                $digit = $c >= 97 && $c <= 122 ? $c - 97 : ($c >= 48 && $c <= 57 ? $c - 22 : -1);
                if ($digit < 0) {
                    return null;
                }
                $i += $digit * $w;
                if ($i > 0x7FFFFFFF) {
                    return null; // far beyond any code point: no valid encoding
                }
                $t = $k <= $bias ? self::TMIN : ($k >= $bias + self::TMAX ? self::TMAX : $k - $bias);
                if ($digit < $t) {
                    break;
                }
                $w *= self::BASE - $t;
                if ($w > 0x7FFFFFFF) {
                    return null;
                }
            }
            $count = count($output) + 1;
            $bias = self::adapt($i - $old, $count, $old === 0);
            $n += intdiv($i, $count);
            $i %= $count;
            if ($n > 0x10FFFF || ($n >= 0xD800 && $n <= 0xDFFF)) {
                return null;
            }
            array_splice($output, $i, 0, [$n]);
            $i++;
        }

        return implode('', array_map([self::class, 'utf8'], $output));
    }

    /** one code point in UTF-8 (mb_chr without mbstring) */
    private static function utf8(int $cp): string
    {
        if ($cp < 0x80) {
            return chr($cp);
        }
        if ($cp < 0x800) {
            return chr(0xC0 | ($cp >> 6)) . chr(0x80 | ($cp & 0x3F));
        }
        if ($cp < 0x10000) {
            return chr(0xE0 | ($cp >> 12)) . chr(0x80 | (($cp >> 6) & 0x3F)) . chr(0x80 | ($cp & 0x3F));
        }

        return chr(0xF0 | ($cp >> 18)) . chr(0x80 | (($cp >> 12) & 0x3F)) . chr(0x80 | (($cp >> 6) & 0x3F)) . chr(0x80 | ($cp & 0x3F));
    }

    /** the code point of one UTF-8 character (mb_ord without mbstring) */
    private static function codePoint(string $char): int
    {
        $bytes = array_values(unpack('C*', $char) ?: []);
        $count = count($bytes);
        if ($count === 1) {
            return $bytes[0];
        }
        $cp = $bytes[0] & (0xff >> ($count + 1));
        for ($i = 1; $i < $count; $i++) {
            $cp = ($cp << 6) | ($bytes[$i] & 0x3f);
        }

        return $cp;
    }

    private static function adapt(int $delta, int $points, bool $first): int
    {
        $delta = $first ? intdiv($delta, self::DAMP) : intdiv($delta, 2);
        $delta += intdiv($delta, $points);
        $k = 0;
        while ($delta > intdiv((self::BASE - self::TMIN) * self::TMAX, 2)) {
            $delta = intdiv($delta, self::BASE - self::TMIN);
            $k += self::BASE;
        }

        return $k + intdiv((self::BASE - self::TMIN + 1) * $delta, $delta + self::SKEW);
    }

    private static function digit(int $d): string
    {
        return chr($d < 26 ? $d + 97 : $d + 22);
    }
}
