<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Http;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\AddressGuard;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Capabilities;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\DisabledFunctions;

/**
 * @group FeinwerkUptimeMonitor
 */
class AddressGuardTest extends TestCase
{
    private static function guard(bool $allowPrivate, array $dns = []): AddressGuard
    {
        return new AddressGuard($allowPrivate, static fn(string $host): array => $dns[$host] ?? []);
    }

    public function test_privateRanges_areBlocked(): void
    {
        $ips = ['10.1.2.3', '172.16.0.1', '192.168.1.1', '127.0.0.1', '169.254.1.1', '100.64.0.1', '0.0.0.0',
            '::1', 'fc00::1', 'fe80::1', '::ffff:10.0.0.1', '64:ff9b::a00:1'];
        foreach ($ips as $ip) {
            $decision = self::guard(false)->check('https://' . (str_contains($ip, ':') ? "[$ip]" : $ip) . '/');
            $this->assertFalse($decision->allowed, $ip);
            $this->assertSame(Outcome::BLOCKED, $decision->reason, $ip);
        }
    }

    public function test_publicHost_isAllowedWithIp(): void
    {
        $decision = self::guard(false, ['www.example.com' => ['93.184.215.14']])->check('https://www.example.com/path?q=1');
        $this->assertTrue($decision->allowed);
        $this->assertSame('93.184.215.14', $decision->ip);
        $this->assertSame('www.example.com', $decision->host);
        $this->assertSame(443, $decision->port);
        $this->assertNull($decision->reason);
    }

    public function test_httpWithPort_isAllowed(): void
    {
        $decision = self::guard(false, ['m.example.com' => ['93.184.215.14']])->check('http://m.example.com:8080/');
        $this->assertTrue($decision->allowed);
        $this->assertSame(8080, $decision->port);
    }

    public function test_oneOfSeveralAddressesPrivate_isBlocked(): void
    {
        $decision = self::guard(false, ['mixed.example.com' => ['93.184.215.14', '10.0.0.5']])->check('https://mixed.example.com/');
        $this->assertFalse($decision->allowed);
        $this->assertSame(Outcome::BLOCKED, $decision->reason);
    }

    public function test_allowPrivate_letsPrivateThrough(): void
    {
        $guard = self::guard(true, ['matomo.intranet' => ['10.0.0.5']]);
        $this->assertTrue($guard->check('https://matomo.intranet/')->allowed);
        $this->assertSame('10.0.0.5', $guard->check('https://matomo.intranet/')->ip);
        $this->assertTrue($guard->check('http://127.0.0.1:8080/', true)->allowed, 'Matomo itself on the same server');
        $this->assertFalse($guard->check('http://127.0.0.1:8080/')->allowed, 'never for a website address set by a site admin');
        $this->assertFalse($guard->check('http://[::1]/')->allowed);
        $this->assertTrue((new AddressGuard(true, null, true))->check('http://127.0.0.1/')->allowed, 'config switch for websites on this server');
    }

    /** B11 part 2: what the guard refuses without a name lookup reads "not checkable" before the first check. */
    public function test_refusesWithoutLookup_onlyWhatNeedsNoLookup(): void
    {
        $lookups = 0;
        $guard = new AddressGuard(false, static function (string $host) use (&$lookups): array {
            $lookups++;
            return ['10.0.0.5'];
        });
        foreach (['http://127.0.0.1/', 'https://10.0.0.3:18001/', 'http://[::1]/', 'http://localhost/', 'http://intranet/',
            'http://shop.localhost/', 'ftp://www.example.org/'] as $url) {
            $this->assertTrue($guard->refusesWithoutLookup($url), $url);
        }
        $this->assertFalse($guard->refusesWithoutLookup('https://intranet.example.org/'), 'a name: only its lookup tells');
        $this->assertFalse($guard->refusesWithoutLookup('https://93.184.215.14/'));
        $this->assertSame(0, $lookups, 'never a lookup');

        $allowing = new AddressGuard(true, static fn(string $host): array => []);
        $this->assertFalse($allowing->refusesWithoutLookup('https://10.0.0.3/'), 'private addresses allowed');
        $this->assertFalse($allowing->refusesWithoutLookup('http://localhost/', true));
        $this->assertTrue($allowing->refusesWithoutLookup('http://127.0.0.1/'), 'a website address never on the loopback');
        $this->assertFalse($allowing->refusesWithoutLookup('http://127.0.0.1:8080/', true), "Matomo's own may be");
        $this->assertTrue($allowing->refusesWithoutLookup('http://169.254.169.254/', true), 'link-local never');
    }

    public function test_onlyHttpAndHttps(): void
    {
        $guard = self::guard(true, ['a.example.com' => ['93.184.215.14']]);
        foreach (['ftp://a.example.com/', 'file:///etc/passwd', 'gopher://a.example.com/', 'a.example.com', ''] as $url) {
            $decision = $guard->check($url);
            $this->assertFalse($decision->allowed, $url);
            $this->assertSame(Outcome::BLOCKED, $decision->reason, $url);
        }
    }

    public function test_credentialsInUrl_areBlocked(): void
    {
        $this->assertFalse(self::guard(true, ['a.example.com' => ['93.184.215.14']])->check('https://u:p@a.example.com/')->allowed);
    }

    public function test_localhostNames_blockedUnlessPrivateAllowed(): void
    {
        $this->assertFalse(self::guard(false, ['localhost' => ['127.0.0.1']])->check('http://localhost/')->allowed);
        $this->assertFalse(self::guard(false, ['intranet' => ['93.184.215.14']])->check('http://intranet/')->allowed);
    }

    public function test_specialPurposeRanges_blockedOnEveryPhpVersion(): void
    {
        // PHP 8.1 has no FILTER_FLAG_GLOBAL_RANGE: these must be blocked by the guard's own list
        foreach (['198.18.0.1', '192.0.0.8', '192.0.2.1', '198.51.100.1', '203.0.113.1', '240.0.0.1', '100::1', '2001:db8::1'] as $ip) {
            $this->assertFalse(AddressGuard::isPublicIp($ip), $ip);
        }
        $this->assertTrue(AddressGuard::isPublicIp('93.184.215.14'));
        $this->assertTrue(AddressGuard::isPublicIp('2606:2800:21f:cb07:6820:80da:af6b:8b2c'));
    }

    public function test_numericHostForms_areBlocked(): void
    {
        $guard = self::guard(false, ['0x7f.1' => ['93.184.215.14'], '2130706433' => ['93.184.215.14'], '127.1' => ['93.184.215.14']]);
        foreach (['http://0x7f.1/', 'http://0x7f.0.0.1/', 'http://2130706433/', 'http://127.1/', 'http://0177.0.0.1/'] as $url) {
            $this->assertFalse($guard->check($url)->allowed, $url);
        }
    }

    public function test_internationalisedHost_isCheckedInPunycode(): void
    {
        $seen = [];
        $guard = new AddressGuard(false, static function (string $host) use (&$seen): array {
            $seen[] = $host;
            return ['93.184.215.14'];
        });
        $decision = $guard->check('https://bücher.example/');
        $this->assertTrue($decision->allowed);
        $this->assertSame('xn--bcher-kva.example', $decision->host);
        $this->assertSame(['xn--bcher-kva.example'], $seen, 'the resolver sees the name curl will use');
    }

    /**
     * Audit D3: PHP without intl (no idn_to_ascii), a website address with umlauts as entered in Matomo: checked in
     * punycode like with intl, never "address blocked by the settings" with the hint to allow private addresses.
     */
    public function test_internationalisedHost_withoutIntl_isCheckedInPunycodeToo(): void
    {
        $noIntl = new Capabilities(DisabledFunctions::except(['idn_to_ascii']));
        $seen = [];
        $guard = new AddressGuard(false, static function (string $host) use (&$seen): array {
            $seen[] = $host;
            return ['93.184.215.14'];
        }, false, $noIntl);
        $decision = $guard->check('https://Bücher.Example/');
        $this->assertSame([true, 'xn--bcher-kva.example'], [$decision->allowed, $decision->host]);
        $this->assertSame(['xn--bcher-kva.example'], $seen);
        $this->assertFalse($guard->refusesWithoutLookup('https://müller.de/'), 'not "never checked from this server"');
        $this->assertTrue($guard->checkWithoutResolving('https://straße.de/')->allowed);
        $this->assertSame('xn--strae-oqa.de', $guard->checkWithoutResolving('https://straße.de/')->host,
            'as browsers and libcurl map it (nontransitional), never the other domain strasse.de');
    }

    /**
     * Security review of D3: without intl only plain lower-case letters with common diacritics are converted; whatever
     * NFKC or UTS46 would map (full-width letters, the dot variants U+3002, U+FF0E, U+FF61, the long s), and other
     * scripts, are not checkable with the note needs_intl, on both ways, never looked up, never sent.
     */
    public function test_withoutIntl_onlyPlainLettersWithDiacritics_theRestNeedsIntl(): void
    {
        $noIntl = new Capabilities(DisabledFunctions::except(['idn_to_ascii']));
        $lookups = [];
        $guard = new AddressGuard(false, static function (string $host) use (&$lookups): array {
            $lookups[] = $host;
            return ['93.184.215.14'];
        }, false, $noIntl);
        foreach (["ex\u{FF0E}ample.de", "ex\u{3002}ample.de", "ex\u{FF61}ample.de", "\u{FF4D}üller.de", "\u{FF2D}\u{FF35}.de", "ma\u{017F}e.de",
            'привет.рф', '日本語.jp', 'ς.gr', "a\u{200D}b.de", "i\u{0307}.de", "\u{0130}stanbul.tr"] as $host) {
            $url = 'https://' . $host . '/';
            $this->assertSame([false, Outcome::NEEDS_INTL], [$guard->check($url)->allowed, $guard->check($url)->reason], bin2hex($host));
            $this->assertSame([false, Outcome::NEEDS_INTL], [$guard->checkWithoutResolving($url)->allowed, $guard->checkWithoutResolving($url)->reason], bin2hex($host));
            $this->assertFalse($guard->refusesWithoutLookup($url), 'the check says why');
        }
        $this->assertSame([], $lookups, 'nothing looked up');
        foreach (['müller.de' => 'xn--mller-kva.de', 'MÜLLER.de' => 'xn--mller-kva.de', 'straße.de' => 'xn--strae-oqa.de', 'mañana.es' => 'xn--maana-pta.es',
            "cafe\u{0301}.fr" => 'xn--caf-dma.fr', 'łódź.pl' => 'xn--d-uga0v4h.pl'] as $host => $ascii) {
            $this->assertSame([true, $ascii], [$guard->check('https://' . $host . '/')->allowed, $guard->check('https://' . $host . '/')->host], $host);
        }
        $this->assertSame(Outcome::BLOCKED, (new AddressGuard(false, null, false, $noIntl))->check('https://bad_host.example/')->reason, 'a broken name stays blocked');
    }

    /**
     * L8 review of 5.4.0, SHOULD 4 and 5: the name is mapped as browsers do (ß stays ß), with intl and without, and what
     * UTS46 refuses is blocked on both ways without intl too, never "needs intl" (intl would refuse it as well).
     */
    public function test_idn_nontransitional_andInvalidNamesBlocked_withAndWithoutIntl(): void
    {
        $ways = ['without intl' => new Capabilities(DisabledFunctions::except(['idn_to_ascii']))];
        if (function_exists('idn_to_ascii')) {
            $ways['intl'] = new Capabilities();
        }
        foreach ($ways as $way => $capabilities) {
            $lookups = [];
            $guard = new AddressGuard(false, static function (string $host) use (&$lookups): array {
                $lookups[] = $host;
                return ['93.184.215.14'];
            }, false, $capabilities);
            $this->assertSame([true, 'xn--strae-oqa.de'], [$guard->check('https://straße.de/')->allowed, $guard->check('https://straße.de/')->host], $way);
            $this->assertSame('xn--strae-oqa.de', AddressGuard::normalizeHost('STRAßE.DE', $capabilities), $way);
            foreach (['-müller.de', 'müller-.de', 'ab--ü.de', 'xn--a.müller.de', str_repeat('a', 70) . 'ü.de', 'bad_müller.de'] as $host) {
                $url = 'https://' . $host . '/';
                $this->assertSame([false, Outcome::BLOCKED], [$guard->check($url)->allowed, $guard->check($url)->reason], "$way: $host");
                $this->assertSame([false, Outcome::BLOCKED], [$guard->checkWithoutResolving($url)->allowed, $guard->checkWithoutResolving($url)->reason], "$way: $host");
            }
            $this->assertSame(['xn--strae-oqa.de'], array_values(array_unique($lookups)), "$way: nothing else looked up");
        }
    }

    public function test_hostGrammar(): void
    {
        $guard = self::guard(true, ['a.example.com' => ['93.184.215.14']]);
        $this->assertTrue($guard->check('https://A.Example.COM./')->allowed, 'case and one trailing dot');
        $this->assertSame('a.example.com', $guard->check('https://A.Example.COM./')->host);
        foreach (['https://a_b.example.com/', 'https://a.example.com%2f@b/', "https://a.example.com\t/", 'https://a.example.com:99999/'] as $url) {
            $this->assertFalse($guard->check($url)->allowed, $url);
        }
    }

    public function test_allowPrivate_neverAllowsLinkLocalOrMetadata(): void
    {
        $guard = self::guard(true, ['meta.example' => ['169.254.169.254'], 'v6meta.example' => ['fd00:ec2::254']]);
        foreach (['http://169.254.169.254/', 'http://[fe80::1]/', 'http://meta.example/', 'http://v6meta.example/', 'http://0.0.0.0/', 'http://[::ffff:169.254.169.254]/'] as $url) {
            $this->assertFalse($guard->check($url)->allowed, $url);
        }
    }

    public function test_allAddressesAreReturned(): void
    {
        $decision = self::guard(false, ['two.example' => ['93.184.215.14', '2606:2800:21f:cb07:6820:80da:af6b:8b2c']])->check('https://two.example/');
        $this->assertSame(['93.184.215.14', '2606:2800:21f:cb07:6820:80da:af6b:8b2c'], $decision->ips);
    }

    public function test_unresolvable_isBlockedWithReasonDns(): void
    {
        $decision = self::guard(false)->check('https://nowhere.example.com/');
        $this->assertFalse($decision->allowed);
        $this->assertSame(Outcome::DNS, $decision->reason);
    }

    private static function without(array $disabled): Capabilities
    {
        return new Capabilities(DisabledFunctions::except($disabled));
    }

    /**
     * The default lookup with stand-ins for gethostbynamel ($byName) and dns_get_record ($records) that log their calls.
     *
     * @return array{0: \Closure, 1: \ArrayObject}
     */
    private static function lookup(Capabilities $capabilities): array
    {
        $calls = new \ArrayObject();
        $resolver = AddressGuard::resolver(
            $capabilities,
            static function (string $host) use ($calls): array {
                $calls[] = "byName $host";
                return ['93.184.215.14'];
            },
            static function (string $host, int $type) use ($calls): array {
                $calls[] = ($type === DNS_A ? 'A' : 'AAAA') . " $host";
                return $type === DNS_A ? [['ip' => '93.184.215.15']] : [['ipv6' => '2606:2800:21f:cb07:6820:80da:af6b:8b2c']];
            }
        );

        return [$resolver, $calls];
    }

    public function test_lookup_everythingThere_ipv4ByNameAndIpv6FromTheRecords(): void
    {
        [$resolver, $calls] = self::lookup(self::without([]));
        $this->assertSame(['93.184.215.14', '2606:2800:21f:cb07:6820:80da:af6b:8b2c'], $resolver('www.example.org'));
        $this->assertSame(['byName www.example.org', 'AAAA www.example.org'], $calls->getArrayCopy());
    }

    /** dns_get_record asks the DNS server only: a name only in the hosts file is not found this way. */
    public function test_lookup_withoutGethostbynamel_takesTheARecords(): void
    {
        [$resolver, $calls] = self::lookup(self::without(['gethostbynamel']));
        $this->assertSame(['93.184.215.15', '2606:2800:21f:cb07:6820:80da:af6b:8b2c'], $resolver('www.example.org'));
        $this->assertSame(['A www.example.org', 'AAAA www.example.org'], $calls->getArrayCopy());
    }

    public function test_lookup_withoutDnsGetRecord_ipv4Only(): void
    {
        [$resolver, $calls] = self::lookup(self::without(['dns_get_record']));
        $this->assertSame(['93.184.215.14'], $resolver('www.example.org'));
        $this->assertSame(['byName www.example.org'], $calls->getArrayCopy());
    }

    public function test_withoutBothLookups_aNameIsNotCheckable_anAddressStillIs(): void
    {
        $guard = new AddressGuard(false, null, false, self::without(['gethostbynamel', 'dns_get_record']));
        $decision = $guard->check('https://www.example.org/');
        $this->assertSame([false, Outcome::PHP_DISABLED, 0], [$decision->allowed, $decision->reason, $decision->lookupMs]);
        $this->assertTrue($guard->check('https://93.184.215.14/')->allowed, 'an address needs no lookup');
        $this->assertSame(Outcome::PHP_DISABLED, $guard->checkWithoutResolving('https://www.example.org/')->reason, 'through a proxy neither');
        $this->assertSame(Outcome::BLOCKED, $guard->check('http://10.0.0.3/')->reason, 'the address rules still hold');
        $this->assertSame(['gethostbynamel', 'dns_get_record'], $guard->missingFunctions());
        $this->assertSame([], (new AddressGuard(false, static fn(string $h): array => [], false, self::without(['gethostbynamel', 'dns_get_record'])))->missingFunctions(),
            'a resolver of its own needs neither');
    }

    /**
     * Review 5.3.1 #1: through Matomo's [proxy] a public name whose DNS points to a private address (intranet.shop.example
     * to 10.0.0.5) was allowed unchecked when this PHP could not look it up: the proxy fetched the internal page. While
     * private addresses are not allowed, such a name is not checkable (php_disabled), as on the direct way; what needs no
     * lookup is decided as before. With private addresses allowed the proxy alone decides (nothing to cross-check).
     */
    public function test_withoutBothLookups_throughTheProxy_aNameIsNotCheckable_unlessPrivateAddressesAreAllowed(): void
    {
        $noLookups = self::without(['gethostbynamel', 'dns_get_record']);
        $guard = new AddressGuard(false, null, false, $noLookups);
        $decision = $guard->checkWithoutResolving('https://intranet.shop.example/');
        $this->assertSame([false, Outcome::PHP_DISABLED, 0], [$decision->allowed, $decision->reason, $decision->lookupMs], 'fail closed');
        $this->assertSame('intranet.shop.example', $decision->host);
        $this->assertTrue($guard->checkWithoutResolving('https://93.184.215.14/')->allowed, 'a public address needs no lookup');
        $this->assertSame(Outcome::BLOCKED, $guard->checkWithoutResolving('http://10.0.0.5/')->reason, 'a private address stays refused');
        $this->assertSame(Outcome::BLOCKED, $guard->checkWithoutResolving('http://intranet/')->reason, 'a local name stays refused');
        $this->assertSame(Outcome::BLOCKED, $guard->checkWithoutResolving('ftp://intranet.shop.example/')->reason, 'what is no http(s) address stays refused');
        $this->assertFalse($guard->refusesWithoutLookup('https://intranet.shop.example/'), 'the check says why, not "never checked"');

        $this->assertTrue((new AddressGuard(false, static fn(string $h): array => ['93.184.215.14'], false, $noLookups))
            ->checkWithoutResolving('https://www.shop.example/')->allowed, 'a resolver of its own still decides');
        $this->assertSame(Outcome::BLOCKED, (new AddressGuard(false, static fn(string $h): array => ['10.0.0.5'], false, $noLookups))
            ->checkWithoutResolving('https://intranet.shop.example/')->reason);

        $private = new AddressGuard(true, null, false, $noLookups);
        $this->assertSame([true, null], [$private->checkWithoutResolving('https://intranet.shop.example/')->allowed, $private->checkWithoutResolving('https://intranet.shop.example/')->reason],
            'private addresses allowed: the proxy decides');
        $this->assertSame(Outcome::PHP_DISABLED, $private->check('https://intranet.shop.example/')->reason, 'the direct way still needs a lookup');
    }

    public function test_withoutInetFunctions_nothingIsCheckable_neverAnError(): void
    {
        foreach (['inet_pton', 'inet_ntop'] as $function) {
            $guard = new AddressGuard(true, static fn(string $h): array => ['93.184.215.14'], false, self::without([$function]));
            foreach (['https://www.example.org/', 'https://93.184.215.14/', 'https://[2606:2800:21f:cb07:6820:80da:af6b:8b2c]/'] as $url) {
                $this->assertSame([false, Outcome::PHP_DISABLED], [$guard->check($url)->allowed, $guard->check($url)->reason], "$function $url");
                $this->assertSame(Outcome::PHP_DISABLED, $guard->checkWithoutResolving($url)->reason, "$function $url");
                $this->assertFalse($guard->refusesWithoutLookup($url), 'the check says why, not "never checked"');
            }
            $this->assertSame([$function], $guard->missingFunctions());
            $this->assertSame(Outcome::BLOCKED, $guard->check('ftp://www.example.org/')->reason, 'what is no http(s) address stays refused');
        }
    }

    public function test_everythingThere_nothingMissing(): void
    {
        $this->assertSame([], (new AddressGuard(false))->missingFunctions());
        $this->assertSame([], (new AddressGuard(false, null, false, self::without(DisabledFunctions::SHARED_HOST)))->missingFunctions());
    }
}
