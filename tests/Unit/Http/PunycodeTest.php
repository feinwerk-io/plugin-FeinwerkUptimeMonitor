<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Http;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\AddressGuard;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Capabilities;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Punycode;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\DisabledFunctions;

/**
 * Audit D3: internationalised host names in ASCII where PHP has no intl extension, as browsers and intl's UTS46 give
 * them nontransitionally (IDNA2008: ß stays ß, L8 review of 5.4.0, SHOULD 4), for plain Latin letters with common
 * diacritics only (RFC 3492). What UTS46 refuses the fallback refuses too (SHOULD 5): hyphens at the start or end of a
 * label or at its third and fourth place, an xn-- label that is no valid encoding, labels over 63 and names over 253
 * characters; such a name is invalid (blocked), not one that needs intl.
 *
 * @group FeinwerkUptimeMonitor
 */
class PunycodeTest extends TestCase
{
    private const HOSTS = [
        'müller.de' => 'xn--mller-kva.de',
        'MÜNCHEN.de' => 'xn--mnchen-3ya.de',
        'bücher-ä.example' => 'xn--bcher--gua0q.example',
        'ex.ü.com' => 'ex.xn--tda.com',
        // DENIC registers ß since 2010: straße.de and strasse.de are two domains
        'straße.de' => 'xn--strae-oqa.de',
        'Straße.de' => 'xn--strae-oqa.de',
        'café.fr' => 'xn--caf-dma.fr',
        "cafe\u{301}.fr" => 'xn--caf-dma.fr',
        'mañana.com' => 'xn--maana-pta.com',
        'łódź.pl' => 'xn--d-uga0v4h.pl',
        'ü-ü.de' => 'xn----dhab.de',
        'ab-ü.de' => 'xn--ab--joa.de',
        'xn--mller-kva.ü.de' => 'xn--mller-kva.xn--tda.de',
        'XN--MLLER-KVA.ü.de' => 'xn--mller-kva.xn--tda.de',
        'xn--strae-oqa.ü.de' => 'xn--strae-oqa.xn--tda.de',
        'xn--mller-kva.de' => 'xn--mller-kva.de',
        'www.example.com' => 'www.example.com',
    ];

    /** as AddressGuard::normalizeHost() asks intl: nontransitional, as browsers (WHATWG URL) */
    private static function intl(string $host)
    {
        return idn_to_ascii($host, IDNA_NONTRANSITIONAL_TO_ASCII | IDNA_CHECK_CONTEXTJ | IDNA_CHECK_BIDI, INTL_IDNA_VARIANT_UTS46);
    }

    public function test_theNamesWebsitesUse_asBrowsersAndIntlGiveThem(): void
    {
        foreach (self::HOSTS as $host => $ascii) {
            $this->assertSame([$ascii, null], Punycode::convert($host), $host);
            $this->assertSame($ascii, Punycode::toAscii($host), $host);
            if (function_exists('idn_to_ascii')) {
                $this->assertSame(self::intl($host), Punycode::toAscii($host), "$host: as intl");
            }
        }
    }

    /** SHOULD 5: what UTS46 refuses is refused without intl too, as invalid (the guard blocks it) */
    public function test_whatUts46Refuses_isInvalid(): void
    {
        $hosts = ['-müller.de', 'müller-.de', 'ab--ü.de', 'üü--a.de', 'ü--.de', 'a-ü-.de', '-abc.müller.de', 'abc-.müller.de',
            'ab--c.müller.de', 'xn--a.müller.de', 'xn--zz.ü.de', 'xn--.ü.de', 'xn---mller-4ya.ü.de', 'xn--mller--3ya.ü.de',
            'xn--ab---3ra.ü.de', 'xn--mller-kva-x.ü.de', 'xn--a-ecp.ü.de', 'müller..de', '.müller.de', 'bad_müller.de',
            'müller!.de', str_repeat('a', 70) . 'ü.de', str_repeat('a', 56) . 'ü.de', str_repeat('ab.', 84) . 'ü.de',
            "m\xfcller.de"];
        foreach ($hosts as $host) {
            $this->assertSame([null, Punycode::INVALID], Punycode::convert($host), bin2hex($host));
            if (function_exists('idn_to_ascii') && preg_match('//u', $host)) {
                $this->assertNull(AddressGuard::normalizeHost($host), "$host: intl refuses it too");
            }
        }
        // the longest label and name that still fit
        $this->assertSame('xn--' . str_repeat('a', 55) . '-8yf.de', Punycode::toAscii(str_repeat('a', 55) . 'ü.de'), '63 characters');
        $this->assertSame(250, strlen((string) Punycode::toAscii(str_repeat('a.', 120) . 'ü.de')));
    }

    /** Security review of D3: what NFKC or UTS46 would map, and other scripts, are not converted: no guess. */
    public function test_onlyPlainLettersWithDiacritics_noGuessForTheRest(): void
    {
        foreach (["ex\u{FF0E}ample.de", "ex\u{3002}ample.de", "ex\u{FF61}ample.de", "\u{FF4D}üller.de", "ma\u{017F}e.de", "\u{0133}sselmeer.nl",
            'привет.рф', '日本語.jp', 'ς.gr', "a\u{200D}b.de", "\u{0130}stanbul.tr", 'ⅻ.de', "\u{00BD}.de",
            // UTS46 maps the capital sharp s to "ss", mb_strtolower to ß
            "STRA\u{1E9E}E.de", "\u{1E9E}.de",
            // an xn-- label of other scripts, or of nothing but ASCII: only intl can tell
            'xn--80aairftm.ü.de', 'xn--ss-.ü.de'] as $host) {
            $this->assertSame([null, Punycode::UNSUPPORTED], Punycode::convert($host), bin2hex($host));
        }
    }

    public function test_withoutLowerCaseFunctions_noGuess(): void
    {
        $this->assertSame([null, Punycode::UNSUPPORTED], Punycode::convert('müller.de', new Capabilities(DisabledFunctions::except(['mb_strtolower']))));
        $this->assertSame('xn--mller-kva.de', Punycode::toAscii('müller.de', new Capabilities()));
    }

    /**
     * The property behind both findings, on seeded random names (the same every run): whatever intl refuses, the
     * fallback refuses; where both convert, the names are equal; a name the fallback calls invalid intl refuses too.
     */
    public function test_parityWithIntl_onRandomNames(): void
    {
        if (!function_exists('idn_to_ascii')) {
            $this->markTestSkipped('needs intl as the reference');
        }
        $noIntl = new Capabilities(DisabledFunctions::except(['idn_to_ascii']));
        $alphabet = ['a', 'b', 'x', 'n', 'z', '0', '9', '-', '-', '.', 'ü', 'Ü', 'ß', "\u{1E9E}", 'é', 'É', 'ā', 'Ā', 'ı', "\u{0130}",
            "\u{017F}", "\u{0301}", '_', 'ö', 'ł', 'ж'];
        $prefixes = ['', '', 'xn--', 'xn--mller-kva.', 'xn--tda.', 'xn--strae-oqa.', 'xn--ss-.', 'ab--', '-'];
        mt_srand(540);
        $converted = 0;
        for ($i = 0; $i < 20000; $i++) {
            $label = '';
            for ($n = mt_rand(1, 14); $n > 0; $n--) {
                $label .= $alphabet[mt_rand(0, count($alphabet) - 1)];
            }
            $host = $prefixes[mt_rand(0, count($prefixes) - 1)] . $label . (mt_rand(0, 3) ? '.de' : '');
            if (!preg_match('/[^\x00-\x7f]/', $host)) {
                continue;
            }
            $withIntl = AddressGuard::normalizeHost($host);
            $without = AddressGuard::normalizeHost($host, $noIntl);
            [, $why] = Punycode::convert(strtolower($host));
            if ($without !== null) {
                $converted++;
                $this->assertSame($withIntl, $without, "$host: the same name");
            } elseif ($why === Punycode::INVALID) {
                $this->assertNull($withIntl, "$host: invalid without intl, so refused by intl too");
            }
            if ($withIntl === null) {
                $this->assertNull($without, "$host: refused by intl, so refused without it");
            }
        }
        $this->assertGreaterThan(1000, $converted, 'the property was tested on names that convert');
    }
}
