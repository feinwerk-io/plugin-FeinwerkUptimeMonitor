<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Http;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\RedirectUrl;

/**
 * The stream transport resolves a Location against the URL it fetched, as curl's CURLINFO_REDIRECT_URL does
 * (RFC 3986, section 5): the redirect hop then goes through the guard like every hop.
 *
 * @group FeinwerkUptimeMonitor
 */
class RedirectUrlTest extends TestCase
{
    /** @return array<string, array{string, string}> RFC 3986, 5.4.1 and 5.4.2, against the base http://a/b/c/d;p?q */
    public static function rfcExamples(): array
    {
        $examples = [
            'g:h' => 'g:h', 'g' => 'http://a/b/c/g', './g' => 'http://a/b/c/g', 'g/' => 'http://a/b/c/g/', '/g' => 'http://a/g',
            '//g' => 'http://g', '?y' => 'http://a/b/c/d;p?y', 'g?y' => 'http://a/b/c/g?y', '#s' => 'http://a/b/c/d;p?q#s',
            'g#s' => 'http://a/b/c/g#s', 'g?y#s' => 'http://a/b/c/g?y#s', ';x' => 'http://a/b/c/;x', 'g;x' => 'http://a/b/c/g;x',
            'g;x?y#s' => 'http://a/b/c/g;x?y#s', '' => 'http://a/b/c/d;p?q', '.' => 'http://a/b/c/', './' => 'http://a/b/c/',
            '..' => 'http://a/b/', '../' => 'http://a/b/', '../g' => 'http://a/b/g', '../..' => 'http://a/', '../../' => 'http://a/',
            '../../g' => 'http://a/g',
            // abnormal examples
            '../../../g' => 'http://a/g', '../../../../g' => 'http://a/g', '/./g' => 'http://a/g', '/../g' => 'http://a/g',
            'g.' => 'http://a/b/c/g.', '.g' => 'http://a/b/c/.g', 'g..' => 'http://a/b/c/g..', '..g' => 'http://a/b/c/..g',
            './../g' => 'http://a/b/g', './g/.' => 'http://a/b/c/g/', 'g/./h' => 'http://a/b/c/g/h', 'g/../h' => 'http://a/b/c/h',
            'g;x=1/./y' => 'http://a/b/c/g;x=1/y', 'g;x=1/../y' => 'http://a/b/c/y', 'g?y/./x' => 'http://a/b/c/g?y/./x',
            'g?y/../x' => 'http://a/b/c/g?y/../x', 'g#s/./x' => 'http://a/b/c/g#s/./x', 'g#s/../x' => 'http://a/b/c/g#s/../x',
            'http:g' => 'http:g',
        ];
        $out = [];
        foreach ($examples as $reference => $target) {
            $out["'$reference'"] = [$reference, $target];
        }

        return $out;
    }

    /** @dataProvider rfcExamples */
    public function test_resolve_followsRfc3986(string $reference, string $target): void
    {
        $this->assertSame($target, RedirectUrl::resolve('http://a/b/c/d;p?q', $reference));
    }

    /** What curl 7.74 gave for the raw fixture server's redirects (tests/Fixtures/raw-server.php) */
    public function test_resolve_likeCurl(): void
    {
        $base = 'http://127.0.0.1:8080';
        $this->assertSame('http://127.0.0.1:8080/rel/c?x=1', RedirectUrl::resolve("$base/rel/a/b", '../c?x=1'));
        $this->assertSame('http://127.0.0.1:8080/rq?q=2', RedirectUrl::resolve("$base/rq", '?q=2'));
        $this->assertSame('http://127.0.0.1:8080/ok', RedirectUrl::resolve("$base/netpath", '//127.0.0.1:8080/ok'));
        $this->assertSame('http://127.0.0.1:8080/ok', RedirectUrl::resolve("$base/dots", '/a/./b/../../ok'));
        $this->assertSame('http://127.0.0.1:8080/ok#top', RedirectUrl::resolve("$base/fragment", '/ok#top'));
        $this->assertSame('ftp://127.0.0.1/x', RedirectUrl::resolve("$base/to-ftp", 'ftp://127.0.0.1/x'));
        $this->assertSame('https://example.test/', RedirectUrl::resolve('http://example.test', 'https://example.test/'), 'absolute as given');
        $this->assertSame('http://example.test/ok', RedirectUrl::resolve('http://example.test', 'ok'), 'a base without a path');
        $this->assertSame('http://straße.test:81/host', RedirectUrl::resolve("$base/to-idn", 'http://straße.test:81/host'),
            'an internationalised name stays as sent: the guard converts and checks it');
    }

    public function test_resolve_trimsTheHeaderValue(): void
    {
        $this->assertSame('http://a/ok', RedirectUrl::resolve('http://a/b', "  /ok \t"));
    }
}
