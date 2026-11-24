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
        if (function_exists('idn_to_ascii')) {
            $this->assertTrue($decision->allowed);
            $this->assertSame('xn--bcher-kva.example', $decision->host);
            $this->assertSame(['xn--bcher-kva.example'], $seen, 'the resolver sees the name curl will use');
        } else {
            $this->assertFalse($decision->allowed, 'without intl, internationalised names are refused');
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
}
