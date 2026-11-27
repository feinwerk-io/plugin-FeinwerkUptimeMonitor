<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Http;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\AddressGuard;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Capabilities;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\GuardDecision;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Prober;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\UrlGuard;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\DisabledFunctions;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\HttpFixtureServer;

/**
 * Real HTTP against the local fixture server (tests/Fixtures/http-router.php), no network.
 *
 * @group FeinwerkUptimeMonitor
 */
class ProberTest extends TestCase
{
    /** Matomo's [proxy] on port 9 of this host, where nothing listens */
    protected const UNREACHABLE_PROXY = ['host' => '127.0.0.1', 'port' => '9'];

    protected static string $base;

    public static function setUpBeforeClass(): void
    {
        self::$base = HttpFixtureServer::start();
    }

    public static function tearDownAfterClass(): void
    {
        HttpFixtureServer::stop();
    }

    protected static function target(int $id, string $kind, string $path): Target
    {
        return new Target($id, 0, $kind . $id, $kind, self::$base . $path, 'default');
    }

    /**
     * @param array $proxy Matomo's [proxy] settings (empty: none)
     */
    protected static function prober(?UrlGuard $guard = null, int $connectMs = 2000, int $totalMs = 5000, int $parallel = 8, array $proxy = []): Prober
    {
        return new Prober($guard ?? new AddressGuard(true), $proxy, 'FeinwerkUptimeMonitor-Test', $connectMs, $totalMs, $parallel);
    }

    public function test_ok_hasStatusBodyAndTimings(): void
    {
        $responses = static::prober()->probeAll([self::target(1, Kind::WEB, '/ok')], microtime(true) + 30);
        $this->assertArrayHasKey(1, $responses);
        $r = $responses[1];
        $this->assertSame(200, $r->status);
        $this->assertSame('ok', $r->body);
        $this->assertNull($r->error);
        $this->assertFalse($r->capped, 'read to its end');
        $this->assertSame(0, $r->redirects);
        $this->assertSame(['dns', 'connect', 'tls', 'ttfb', 'total'], array_keys($r->timings));
        $this->assertIsInt($r->timings['total']);
        $this->assertGreaterThanOrEqual(0, $r->timings['total']);
    }

    public function test_slow_isTimeout(): void
    {
        $r = static::prober(null, 2000, 1000)->probeAll([self::target(1, Kind::WEB, '/slow')], microtime(true) + 30)[1];
        $this->assertNull($r->status);
        $this->assertSame(Outcome::TIMEOUT, $r->error);
    }

    public function test_bigBody_isCapped(): void
    {
        $r = static::prober()->probeAll([self::target(1, Kind::WEB, '/big')], microtime(true) + 30)[1];
        $this->assertSame(200, $r->status);
        $this->assertNull($r->error);
        $this->assertLessThanOrEqual(Prober::MAX_BODY, strlen($r->body));
        $this->assertGreaterThan(0, strlen($r->body));
        $this->assertTrue($r->capped, 'the body ends at the cap, not where the answer ended');
    }

    /**
     * The cap's edge (5.1.5 review, item 6): a body of exactly the cap was read to its end and is not capped, so a
     * container revision at its very end counts; one byte more is capped. For both caps.
     */
    public function test_bodyOfExactlyTheCap_isWhole_oneByteMoreIsCapped(): void
    {
        $responses = static::prober()->probeAll([
            self::target(1, Kind::WEB, '/bytes?n=' . Prober::MAX_BODY),
            self::target(2, Kind::WEB, '/bytes?n=' . (Prober::MAX_BODY + 1)),
            self::target(3, Kind::CONTAINER, '/bytes?n=' . Prober::MAX_BODY_LARGE),
            self::target(4, Kind::CONTAINER, '/bytes?n=' . (Prober::MAX_BODY_LARGE + 1)),
        ], microtime(true) + 30);
        $this->assertSame([200, null, Prober::MAX_BODY, false], [$responses[1]->status, $responses[1]->error, strlen($responses[1]->body), $responses[1]->capped]);
        $this->assertSame([200, null, Prober::MAX_BODY, true], [$responses[2]->status, $responses[2]->error, strlen($responses[2]->body), $responses[2]->capped]);
        $this->assertSame([200, null, Prober::MAX_BODY_LARGE, false], [$responses[3]->status, $responses[3]->error, strlen($responses[3]->body), $responses[3]->capped]);
        $this->assertSame([200, null, Prober::MAX_BODY_LARGE, true], [$responses[4]->status, $responses[4]->error, strlen($responses[4]->body), $responses[4]->capped]);
    }

    public function test_web_followsTwoRedirects(): void
    {
        $r = static::prober()->probeAll([self::target(1, Kind::WEB, '/r1')], microtime(true) + 30)[1];
        $this->assertSame(200, $r->status);
        $this->assertSame('ok', $r->body);
        $this->assertSame(2, $r->redirects);
        $this->assertSame(self::$base . '/ok', $r->finalUrl);
    }

    public function test_tracker_doesNotFollowRedirects(): void
    {
        $r = static::prober()->probeAll([self::target(1, Kind::TRACKER, '/r1')], microtime(true) + 30)[1];
        $this->assertSame(302, $r->status);
        $this->assertSame(0, $r->redirects);
    }

    public function test_redirectLoop_stopsAfterThree(): void
    {
        $r = static::prober()->probeAll([self::target(1, Kind::UI, '/loop')], microtime(true) + 30)[1];
        $this->assertSame(302, $r->status);
        $this->assertSame(Prober::MAX_REDIRECTS, $r->redirects);
    }

    public function test_redirectToPrivate_isBlocked(): void
    {
        $guard = new class implements UrlGuard {
            public array $seen = [];

            public function check(string $url, bool $instanceTarget = false): GuardDecision
            {
                $this->seen[] = $url;
                $host = (string) parse_url($url, PHP_URL_HOST);
                $port = (int) parse_url($url, PHP_URL_PORT) ?: 80;
                return $host === '127.0.0.1'
                    ? new GuardDecision(true, '127.0.0.1', null, $host, $port, 'http', ['127.0.0.1'])
                    : new GuardDecision(false, null, Outcome::BLOCKED, $host, $port, 'http');
            }

            public function checkWithoutResolving(string $url, bool $instanceTarget = false): GuardDecision
            {
                return $this->check($url);
            }
        };
        $r = static::prober($guard)->probeAll([self::target(1, Kind::WEB, '/to-private')], microtime(true) + 30)[1];
        $this->assertSame(Outcome::BLOCKED, $r->error);
        $this->assertSame('http://10.0.0.1/', $r->finalUrl);
        $this->assertCount(2, $guard->seen, 'every hop goes through the guard');
    }

    public function test_connectionIsPinnedToTheApprovedAddress(): void
    {
        // the guard approves "localhost" only as 10.255.255.1 (unroutable): curl must not resolve localhost itself
        $guard = new AddressGuard(true, static fn(string $host): array => $host === 'localhost' ? ['10.255.255.1'] : []);
        $target = new Target(1, 0, 'web1', Kind::WEB, 'http://localhost:' . HttpFixtureServer::port() . '/ok', 'default');
        $r = static::prober($guard, 500, 1500)->probeAll([$target], microtime(true) + 30)[1];
        $this->assertNull($r->status, 'no answer from the fixture server on 127.0.0.1');
        $this->assertSame(Outcome::CONNECT, $r->error);
    }

    public function test_pinFallsBackToTheSecondAddress(): void
    {
        // 127.0.0.2 refuses at once (the fixture server listens on 127.0.0.1 only), on every host and CI runner
        $guard = new AddressGuard(true, static fn(string $host): array => $host === 'twoaddr.test' ? ['127.0.0.2', '127.0.0.1'] : []);
        $target = new Target(1, 0, 'web1', Kind::WEB, 'http://twoaddr.test:' . HttpFixtureServer::port() . '/ok', 'default');
        $r = static::prober($guard, 500, 3000)->probeAll([$target], microtime(true) + 30)[1];
        $this->assertSame(200, $r->status);
    }

    /**
     * Audit T2: libcurl before 7.59.0 takes one address per CURLOPT_RESOLVE entry and drops a list (the pin name then
     * goes to DNS: every name with A and AAAA records read as a DNS failure). There the pin is one address, IPv4 first.
     */
    public function test_oldLibcurl_pinsOneAddress_ipv4First(): void
    {
        $port = HttpFixtureServer::port();
        $old = new Capabilities(null, 0x073A00);
        $probe = static function (array $addresses, Capabilities $capabilities) use ($port) {
            $guard = new AddressGuard(true, static fn(string $host): array => $host === 'pin.test' ? $addresses : []);
            $prober = new Prober($guard, [], 'FeinwerkUptimeMonitor-Test', 500, 3000, 8, null, $capabilities);
            return $prober->probeAll([new Target(1, 0, 'web1', Kind::WEB, "http://pin.test:$port/ok", 'default')], microtime(true) + 30)[1];
        };
        $this->assertSame(200, $probe(['2001:db8::1', '127.0.0.1'], $old)->status, 'the IPv4 address, not the list');
        $this->assertSame(Outcome::CONNECT, $probe(['127.0.0.2', '127.0.0.1'], $old)->error, 'one address: no fallback to the second');
        $this->assertSame(200, $probe(['127.0.0.2', '127.0.0.1'], new Capabilities(null, 0x073B00))->status, '7.59.0: the list');
        $this->assertGreaterThanOrEqual(0x073B00, (new Capabilities())->curlVersion(), "this host's libcurl");
    }

    public function test_lookupTakingHalfTheCheckTime_isADnsFailureNotATimeout(): void
    {
        $guard = new AddressGuard(true, static function (string $host): array {
            usleep(1100000);
            return ['127.0.0.1'];
        });
        $target = new Target(1, 0, 'web', Kind::WEB, 'http://slow-resolver.test:' . HttpFixtureServer::port() . '/ok', 'default');
        $response = static::prober($guard, 1000, 2000, 2)->probeAll([$target], microtime(true) + 30)[1];
        $this->assertSame(Outcome::DNS, $response->error, 'a slow resolver is no slow website');
    }

    /** Regression (demo, 2026-11-24): the login page of a Matomo with many plugins is larger than MAX_BODY. */
    public function test_largeLoginPage_isReadToTheEnd_forTheInterface(): void
    {
        $url = 'http://127.0.0.1:' . HttpFixtureServer::port() . '/big-login';
        $ui = new Target(1, 0, 'ui', Kind::UI, $url, 'default', ['matomoHost' => '127.0.0.1']);
        $web = new Target(2, 1, 'web:big', Kind::WEB, $url, 'default');
        $responses = static::prober(new AddressGuard(true, null, true))->probeAll([$ui, $web], microtime(true) + 30);
        $this->assertGreaterThan(Prober::MAX_BODY, strlen($responses[1]->body));
        $this->assertStringContainsString('name="form_login"', $responses[1]->body);
        $this->assertLessThanOrEqual(Prober::MAX_BODY, strlen($responses[2]->body), 'website pages stay capped');
        $this->assertSame(200, $responses[2]->status);
        $this->assertSame([false, true], [$responses[1]->capped, $responses[2]->capped]);
    }

    public function test_slowDns_doesNotEatOtherChecksTime(): void
    {
        $guard = new AddressGuard(true, static function (string $host): array {
            if ($host === 'slowdns.test') {
                sleep(2);
                return [];
            }
            return ['127.0.0.1'];
        });
        $fast = new Target(1, 0, 'web1', Kind::WEB, self::$base . '/slow?s=1', 'default');
        $slowDns = new Target(2, 0, 'web2', Kind::WEB, 'http://slowdns.test/', 'default');
        $responses = static::prober($guard, 1000, 1800, 2)->probeAll([$fast, $slowDns], microtime(true) + 30);
        $this->assertSame(200, $responses[1]->status, 'its 1.8 s were not spent waiting for the other DNS');
        $this->assertSame(Outcome::DNS, $responses[2]->error);
        $this->assertGreaterThanOrEqual(1900, $responses[2]->timings['dns']);
    }

    public function test_slowDns_afterTheDeadline_leavesTargetsUnmeasured(): void
    {
        $guard = new AddressGuard(true, static function (string $host): array {
            usleep(700000);
            return ['127.0.0.1'];
        });
        $targets = [];
        foreach (['a', 'b', 'c'] as $i => $name) {
            $targets[] = new Target($i + 1, 0, 'web' . $i, Kind::WEB, 'http://' . $name . '.test:' . HttpFixtureServer::port() . '/ok', 'default');
        }
        // one batch of all three (parallel 2 gives batches of 4): the deadline passes while the second host resolves
        $responses = static::prober($guard, 1000, 3000, 2)->probeAll($targets, microtime(true) + 1.0);
        $this->assertLessThan(3, count($responses), 'resolving stops at the deadline');
        $this->assertArrayHasKey(1, $responses);
        $this->assertGreaterThanOrEqual(700, $responses[1]->timings['total'], 'the lookup counts into the check time');
    }

    public function test_redirects_shareOneTimeout(): void
    {
        $r = static::prober(null, 1000, 1500)->probeAll([self::target(1, Kind::WEB, '/r-slow')], microtime(true) + 30)[1];
        $this->assertSame(Outcome::TIMEOUT, $r->error);
        $this->assertLessThan(2500, $r->timings['total']);
    }

    public function test_environmentProxy_isIgnored(): void
    {
        $saved = getenv('http_proxy');
        putenv('http_proxy=http://127.0.0.1:9');
        try {
            $r = static::prober()->probeAll([self::target(1, Kind::WEB, '/ok')], microtime(true) + 30)[1];
            $this->assertSame(200, $r->status);
        } finally {
            putenv($saved === false ? 'http_proxy' : 'http_proxy=' . $saved);
        }
    }

    public function test_matomoProxy_excludesLocalAndListedHosts(): void
    {
        $prober = static::prober(null, 2000, 5000, 8, ['host' => 'proxy.example', 'port' => '3128', 'exclude' => 'intranet.example, other.example']);
        $this->assertFalse($prober->usesProxyFor('localhost'));
        $this->assertFalse($prober->usesProxyFor('intranet.example'));
        $this->assertTrue($prober->usesProxyFor('www.shop.example'));
        $this->assertFalse(static::prober()->usesProxyFor('www.shop.example'));
    }

    public function test_unreachableProxy_isAProxyError(): void
    {
        // a guard that looks nothing up: the name stays inside this test, the proxy would resolve it
        $prober = static::prober(new AddressGuard(true, static fn(string $host): array => []), 500, 1500, 8, self::UNREACHABLE_PROXY);
        $target = new Target(1, 0, 'web1', Kind::WEB, 'http://www.shop.example/', 'default');
        $this->assertSame(Outcome::PROXY, $prober->probeAll([$target], microtime(true) + 30)[1]->error);
    }

    /**
     * Review 5.3.1 #1: through Matomo's [proxy], on a PHP without gethostbynamel and dns_get_record, a name is not
     * checkable while private addresses are not allowed, and nothing is sent (an unreachable proxy would answer "proxy").
     */
    public function test_proxiedName_withoutTheLookups_isNotCheckable_andNotSent(): void
    {
        $noLookups = new Capabilities(DisabledFunctions::except(['gethostbynamel', 'dns_get_record']));
        $prober = static::prober(new AddressGuard(false, null, false, $noLookups), 500, 1500, 8, self::UNREACHABLE_PROXY);
        $target = new Target(1, 0, 'web1', Kind::WEB, 'https://intranet.shop.example/', 'default');
        $r = $prober->probeAll([$target], microtime(true) + 30)[1];
        $this->assertSame([null, Outcome::PHP_DISABLED, ''], [$r->status, $r->error, $r->body]);
        $this->assertSame(['gethostbynamel', 'dns_get_record'], $prober->missingFunctions(), 'named on the admin page');
    }

    /**
     * The headers the classifier reads come with the answer (lower-case names), from the final answer only; an empty
     * matomo.php with Matomo's tracker header is up, without it unexpected content (a customer's host, 2026-11-26).
     */
    public function test_trackerHeaders_comeWithTheAnswer(): void
    {
        $responses = static::prober()->probeAll([self::target(1, Kind::TRACKER, '/empty/matomo.php'), self::target(2, Kind::TRACKER, '/empty/other.php'),
            self::target(3, Kind::WEB, '/r1')], microtime(true) + 30);
        $this->assertSame([200, '', 'true'], [$responses[1]->status, $responses[1]->body, $responses[1]->headers['access-control-allow-credentials'] ?? null]);
        $this->assertArrayNotHasKey('access-control-allow-credentials', $responses[2]->headers);
        $this->assertSame([], $responses[3]->headers, 'only the headers the classifier reads');
        $classifier = new \Piwik\Plugins\FeinwerkUptimeMonitor\Check\ResponseClassifier();
        $this->assertSame(Outcome::UP, $classifier->classify(self::target(1, Kind::TRACKER, '/empty/matomo.php'), $responses[1], '2026-03-14 10:00:00')->outcome);
        $other = $classifier->classify(self::target(2, Kind::TRACKER, '/empty/other.php'), $responses[2], '2026-03-14 10:00:00');
        $this->assertSame([Outcome::DOWN, Outcome::CONTENT], [$other->outcome, $other->error]);
    }

    /**
     * The name checked is the name fetched: curl gets the URL with the guard's ASCII host, on every hop and both ways.
     * libcurl converts internationalised names by its own rules (libidn2), which can differ from PHP's: before 5.4.0
     * intl's transitional UTS46 gave strasse for straße where libidn2 gives xn--strae-oqa (now both nontransitional), and
     * a full-width dot or letter is still mapped by one and refused by the other. Through Matomo's proxy the proxy
     * resolves the name curl sends, and on the direct way the Host header and SNI carry it.
     *
     * @param string[] $checked the names the guard looked up
     */
    private function idnGuard(array &$checked): AddressGuard
    {
        if (!function_exists('idn_to_ascii')) {
            $this->markTestSkipped('needs intl: without it the guard refuses internationalised names');
        }

        return new AddressGuard(true, static function (string $host) use (&$checked): array {
            $checked[] = $host;
            return ['127.0.0.1'];
        }, true);
    }

    private function assertOnlyAscii(array $responses): void
    {
        foreach ($responses as $r) {
            $this->assertDoesNotMatchRegularExpression('/[^\x20-\x7e]/', $r->body, 'never a name other than the checked ASCII one');
        }
    }

    public function test_theNameChecked_isTheNameFetched_throughMatomosProxy(): void
    {
        $checked = [];
        $proxied = static::prober($this->idnGuard($checked), 2000, 5000, 8, ['host' => '127.0.0.1', 'port' => (string) HttpFixtureServer::port()])
            ->probeAll([new Target(1, 1, 'web1', Kind::WEB, 'http://straße.test/host?a=1', 'default'),
                new Target(2, 1, 'web2', Kind::WEB, 'http://Müller.test/host', 'default')], microtime(true) + 30);
        $this->assertSame('xn--strae-oqa.test http://xn--strae-oqa.test/host?a=1', $proxied[1]->body, 'the proxy gets the checked name');
        $this->assertSame('xn--mller-kva.test http://xn--mller-kva.test/host', $proxied[2]->body);
        $this->assertSame(['xn--strae-oqa.test', 'xn--mller-kva.test'], $checked);
        $this->assertOnlyAscii($proxied);
    }

    public function test_theNameChecked_isTheNameFetched_direct(): void
    {
        $checked = [];
        $port = HttpFixtureServer::port();
        $direct = static::prober($this->idnGuard($checked))->probeAll([new Target(3, 1, 'web3', Kind::WEB, "http://straße.test:$port/host", 'default')], microtime(true) + 30);
        $this->assertSame("xn--strae-oqa.test:$port /host", $direct[3]->body, 'the Host header carries the checked name');
        $this->assertSame(['xn--strae-oqa.test'], $checked);
        $this->assertOnlyAscii($direct);
    }

    public function test_theNameChecked_isTheNameFetched_afterARedirect(): void
    {
        $checked = [];
        $port = HttpFixtureServer::port();
        $r = static::prober($this->idnGuard($checked))->probeAll([new Target(4, 1, 'web4', Kind::WEB, self::$base . '/to-idn', 'default')], microtime(true) + 30)[4];
        $this->assertSame([1, "xn--strae-oqa.test:$port /host"], [$r->redirects, $r->body], 'the hop to an internationalised name');
        $this->assertSame(['xn--strae-oqa.test'], $checked);
        $this->assertOnlyAscii([$r]);
    }

    public function test_withHost_rebuildsTheUrlAroundTheCheckedHost(): void
    {
        $this->assertSame('http://strasse.test:8080/a/b?x=1', Prober::withHost('HTTP://straße.test:8080/a/b?x=1#top', 'strasse.test'));
        $this->assertSame('https://xn--mller-kva.test', Prober::withHost('https://Müller.test', 'xn--mller-kva.test'));
        $this->assertSame('https://[2001:db8::1]:8443/x', Prober::withHost('https://[2001:DB8::1]:8443/x', '2001:db8::1'));
        $this->assertSame('http://93.184.215.14/?q', Prober::withHost('http://93.184.215.14/?q', '93.184.215.14'));
    }

    /**
     * [General] enable_internet_features = 0 (Peter's 2a): no lookup, no request, every check ends as internet_off,
     * also where the PHP functions are missing (the switch decides first).
     */
    public function test_internetOff_sendsNothing_andLooksNothingUp(): void
    {
        $lookups = 0;
        $guard = new AddressGuard(true, static function (string $host) use (&$lookups): array {
            $lookups++;
            return ['127.0.0.1'];
        }, true);
        $targets = [self::target(1, Kind::WEB, '/ok'), new Target(2, 0, 'web2', Kind::WEB, 'http://shop.test:' . HttpFixtureServer::port() . '/ok', 'default')];
        foreach ([new Capabilities(), new Capabilities(DisabledFunctions::except(['curl_init']))] as $capabilities) {
            $prober = new Prober($guard, [], 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8, null, $capabilities->withInternet(false));
            $responses = $prober->probeAll($targets, microtime(true) + 30);
            $this->assertSame([1, 2], array_keys($responses));
            foreach ($responses as $r) {
                $this->assertSame([null, Outcome::INTERNET_OFF, ''], [$r->status, $r->error, $r->body]);
            }
            $this->assertFalse($prober->internetAllowed());
        }
        $this->assertSame(0, $lookups, 'not even a lookup');
    }

    /**
     * Audit D1: through Matomo's [proxy] the lookup on this server only serves the private-address check, and the proxy
     * resolves. A local resolver that drops queries (a network where only the proxy reaches the internet) neither
     * counts into the check's 10 seconds nor makes the check a DNS failure, and each host is asked once per run.
     */
    public function test_proxied_aSilentResolver_isNoDnsFailure_theProxyResolves(): void
    {
        $lookups = [];
        $guard = new AddressGuard(false, static function (string $host) use (&$lookups): array {
            $lookups[] = $host;
            usleep(1100000);
            return [];
        });
        $proxy = ['host' => '127.0.0.1', 'port' => (string) HttpFixtureServer::port()];
        $targets = [
            new Target(1, 1, 'web1', Kind::WEB, 'http://www.shop.example/ok', 'default'),
            new Target(2, 1, 'proxy', Kind::PROXY, 'http://www.shop.example/matomo.php', 'default'),
            new Target(3, 2, 'web3', Kind::WEB, 'http://blog.example/ok', 'default'),
        ];
        $responses = static::prober($guard, 1000, 2000, 8, $proxy)->probeAll($targets, microtime(true) + 30);
        foreach ($responses as $id => $r) {
            $this->assertSame([200, null], [$r->status, $r->error], "target $id: through the proxy");
            $this->assertLessThan(1000, $r->timings['total'], "target $id: the lookup is not the check's time");
        }
        $this->assertSame(['www.shop.example', 'blog.example'], $lookups, 'one wait per host and run, not per address or hop');
    }

    /** A proxied name whose lookup answers a private address stays refused, also when the answer was slow. */
    public function test_proxied_slowLookupOfAPrivateAddress_staysBlocked(): void
    {
        $guard = new AddressGuard(false, static function (string $host): array {
            usleep(1100000);
            return ['10.0.0.5'];
        });
        $proxy = ['host' => '127.0.0.1', 'port' => (string) HttpFixtureServer::port()];
        $r = static::prober($guard, 1000, 2000, 8, $proxy)->probeAll([new Target(1, 1, 'web1', Kind::WEB, 'http://intranet.shop.example/ok', 'default')], microtime(true) + 30)[1];
        $this->assertSame([null, Outcome::BLOCKED], [$r->status, $r->error]);
    }

    /**
     * L8 review of 5.4.0, NIT 6: a lookup this run made before still counts its time for each address of the host, as
     * when every address looked the name up itself (5.3.3): the response times do not step down with the update, and
     * the first address of a host does not look slower than its siblings.
     */
    public function test_direct_aCachedLookup_countsItsTimeForEachAddressOfTheHost(): void
    {
        $lookups = 0;
        $guard = new AddressGuard(true, static function (string $host) use (&$lookups): array {
            $lookups++;
            usleep(150000);
            return ['127.0.0.1'];
        }, true);
        $port = HttpFixtureServer::port();
        $responses = static::prober($guard)->probeAll([new Target(1, 1, 'web1', Kind::WEB, "http://shop.test:$port/ok", 'default'),
            new Target(2, 1, 'tracker', Kind::TRACKER, "http://shop.test:$port/matomo.php", 'default')], microtime(true) + 30);
        $this->assertSame(1, $lookups, 'looked up once');
        foreach ($responses as $id => $r) {
            $this->assertSame(200, $r->status, "target $id");
            $this->assertGreaterThanOrEqual(150, $r->timings['dns'], "target $id: the lookup's time");
            $this->assertGreaterThanOrEqual($r->timings['dns'], $r->timings['total'], "target $id: within the total");
        }
    }

    /**
     * NIT 6, the other side: a lookup that was slow once makes only its own check a DNS failure. The time of a kept
     * answer is reported, but neither counts towards another check's 10 seconds nor makes it a DNS failure (nobody waited
     * for it), in the same run and in its retry phase.
     */
    public function test_direct_aSlowLookupOnce_failsOnlyTheCheckThatWaited(): void
    {
        $slow = true;
        $guard = new AddressGuard(true, static function (string $host) use (&$slow): array {
            if ($slow) {
                usleep(600000);
                $slow = false;
            }
            return ['127.0.0.1'];
        }, true);
        $port = HttpFixtureServer::port();
        $prober = static::prober($guard, 1000, 1000);
        $responses = $prober->probeAll([new Target(1, 1, 'web1', Kind::WEB, "http://shop.test:$port/ok", 'default'),
            new Target(2, 1, 'tracker', Kind::TRACKER, "http://shop.test:$port/matomo.php", 'default')], microtime(true) + 30);
        $this->assertSame([Outcome::DNS, null], [$responses[1]->error, $responses[2]->error], 'only the check that waited');
        $this->assertSame(200, $responses[2]->status);
        $again = $prober->probeAll([new Target(1, 1, 'web1', Kind::WEB, "http://shop.test:$port/ok", 'default')], microtime(true) + 30)[1];
        $this->assertSame([200, null], [$again->status, $again->error], "the run's retry phase");
    }

    /** One lookup per host and run on the direct way too; a failed lookup is asked again (the retry after 5 seconds). */
    public function test_direct_aHostIsLookedUpOncePerRun_aFailedLookupAgain(): void
    {
        $lookups = [];
        $guard = new AddressGuard(true, static function (string $host) use (&$lookups): array {
            $lookups[] = $host;
            return $host === 'shop.test' ? ['127.0.0.1'] : [];
        }, true);
        $port = HttpFixtureServer::port();
        $prober = static::prober($guard);
        $responses = $prober->probeAll([new Target(1, 1, 'web1', Kind::WEB, "http://shop.test:$port/ok", 'default'),
            new Target(2, 1, 'tracker', Kind::TRACKER, "http://shop.test:$port/matomo.php", 'default'),
            new Target(3, 1, 'web3', Kind::WEB, "http://gone.test:$port/ok", 'default')], microtime(true) + 30);
        $this->assertSame([200, 200, Outcome::DNS], [$responses[1]->status, $responses[2]->status, $responses[3]->error]);
        $prober->probeAll([new Target(3, 1, 'web3', Kind::WEB, "http://gone.test:$port/ok", 'default')], microtime(true) + 30);
        $this->assertSame(['shop.test', 'gone.test', 'gone.test'], $lookups);
    }

    /**
     * Audit D2: Matomo stored as http behind a TLS proxy, the web server redirecting to https. The tracker, matomo.js and
     * containers follow no redirects, but this one hop (the same address with https) they follow, through the guard:
     * here through the fixture server as Matomo's proxy, whose missing CONNECT then fails the https hop. Any other
     * redirect stays unfollowed.
     */
    public function test_theSameAddressWithHttps_isFollowedForEveryKind_otherRedirectsNot(): void
    {
        $seen = [];
        $guard = new class ($seen) implements UrlGuard {
            public function __construct(public array &$seen)
            {
            }

            public function check(string $url, bool $instanceTarget = false): GuardDecision
            {
                return $this->checkWithoutResolving($url, $instanceTarget);
            }

            public function checkWithoutResolving(string $url, bool $instanceTarget = false): GuardDecision
            {
                $this->seen[] = $url;
                $scheme = (string) parse_url($url, PHP_URL_SCHEME);
                return new GuardDecision(true, null, null, (string) parse_url($url, PHP_URL_HOST), $scheme === 'https' ? 443 : 80, $scheme);
            }
        };
        $proxy = ['host' => '127.0.0.1', 'port' => (string) HttpFixtureServer::port()];
        $targets = [];
        foreach ([Kind::TRACKER, Kind::JS, Kind::CONTAINER, Kind::PROXY] as $i => $kind) {
            $targets[] = new Target($i + 1, 0, $kind, $kind, 'http://upgrade.test/upgrade/matomo.php', 'default');
        }
        $targets[] = new Target(9, 0, 'tracker9', Kind::TRACKER, 'http://upgrade.test/upgrade/elsewhere.php', 'default');
        $responses = static::prober($guard, 1000, 3000, 8, $proxy)->probeAll($targets, microtime(true) + 30);
        foreach ([1, 2, 3, 4] as $id) {
            $this->assertSame([1, 'https://upgrade.test/upgrade/matomo.php'], [$responses[$id]->redirects, $responses[$id]->finalUrl], "target $id");
        }
        $this->assertSame([301, 0], [$responses[9]->status, $responses[9]->redirects], 'another address: not followed');
        $this->assertContains('https://upgrade.test/upgrade/matomo.php', $guard->seen, 'the hop went through the guard');
    }

    /**
     * Security review of D3 (SSRF through an IDN parser differential): curl gets the URL with the guard's ASCII host, so
     * the name checked is the name fetched, on the proxied way (the proxy resolves it) and on the direct way (Host
     * header and SNI). libcurl's own IDN conversion can differ from PHP's (a full-width dot or letter is mapped by one
     * and refused by the other); straße is xn--strae-oqa for libidn2, for intl and for the fallback alike (L8 review of
     * 5.4.0, SHOULD 4: nontransitional, as browsers).
     */
    public function test_theNameChecked_isTheNameFetched_withAndWithoutIntl(): void
    {
        $port = HttpFixtureServer::port();
        $proxy = ['host' => '127.0.0.1', 'port' => (string) $port];
        foreach (['intl' => new Capabilities(), 'no intl' => new Capabilities(DisabledFunctions::except(['idn_to_ascii']))] as $way => $capabilities) {
            $checked = [];
            $guard = new AddressGuard(true, static function (string $host) use (&$checked): array {
                $checked[] = $host;
                return ['127.0.0.1'];
            }, true, $capabilities);
            $targets = [new Target(1, 1, 'web1', Kind::WEB, 'http://straße.test/host?a=1', 'default'),
                new Target(2, 1, 'web2', Kind::WEB, 'http://Müller.test/host', 'default')];
            $proxied = (new Prober($guard, $proxy, 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8, null, $capabilities))->probeAll($targets, microtime(true) + 30);
            $this->assertSame('xn--strae-oqa.test http://xn--strae-oqa.test/host?a=1', $proxied[1]->body, "$way, proxied");
            $this->assertSame('xn--mller-kva.test http://xn--mller-kva.test/host', $proxied[2]->body, "$way, proxied");
            $this->assertSame(['xn--strae-oqa.test', 'xn--mller-kva.test'], $checked, "$way: the names checked");

            $direct = (new Prober($guard, [], 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8, null, $capabilities))
                ->probeAll([new Target(3, 1, 'web3', Kind::WEB, "http://straße.test:$port/host", 'default')], microtime(true) + 30);
            $this->assertSame("xn--strae-oqa.test:$port /host", $direct[3]->body, "$way, direct: the Host header");
            foreach (array_merge($proxied, $direct) as $r) {
                $this->assertDoesNotMatchRegularExpression('/[^\x20-\x7e]/', $r->body, "$way: no host other than the checked ASCII name");
            }
        }
    }

    public function test_consume_handsOverEachResultAndKeepsNothing(): void
    {
        $seen = [];
        $returned = static::prober()->probeAll([self::target(1, Kind::WEB, '/ok'), self::target(2, Kind::TRACKER, '/matomo.php')], microtime(true) + 30,
            static function (Target $t, $r) use (&$seen): void {
                $seen[$t->id] = $r->status;
            });
        $this->assertSame([], $returned);
        ksort($seen);
        $this->assertSame([1 => 200, 2 => 200], $seen);
    }

    public function test_blockedTarget_isNotRequested(): void
    {
        $r = static::prober(new AddressGuard(false))->probeAll([self::target(1, Kind::WEB, '/ok')], microtime(true) + 30)[1];
        $this->assertSame(Outcome::BLOCKED, $r->error);
        $this->assertNull($r->status);
    }

    public function test_connectTimeout_isReportedAsConnect(): void
    {
        $target = new Target(1, 0, 'web1', Kind::WEB, 'http://10.255.255.1/', 'default');
        $r = static::prober(null, 500, 2000)->probeAll([$target], microtime(true) + 30)[1];
        $this->assertSame(Outcome::CONNECT, $r->error);
    }

    public function test_deadlinePassed_probesNothing(): void
    {
        $this->assertSame([], static::prober()->probeAll([self::target(1, Kind::WEB, '/ok')], microtime(true) - 1));
    }

    public function test_parallel_eightAtOnce(): void
    {
        // eight connections that never answer (unroutable address): one after the other they would take 8 s; this
        // does not depend on how many requests the fixture server serves at once
        $targets = [];
        for ($i = 1; $i <= 8; $i++) {
            $targets[] = new Target($i, 0, 'web' . $i, Kind::WEB, 'http://10.255.255.1:' . (8000 + $i) . '/', 'default');
        }
        $start = microtime(true);
        $responses = static::prober(null, 1000, 1500, 8)->probeAll($targets, microtime(true) + 30);
        $this->assertCount(8, $responses);
        $this->assertLessThan(4.0, microtime(true) - $start, 'eight checks run side by side');
        foreach ($responses as $r) {
            $this->assertSame(Outcome::CONNECT, $r->error);
        }
    }

    public function test_resultsAreKeyedByTargetId(): void
    {
        $responses = static::prober()->probeAll([self::target(11, Kind::TRACKER, '/matomo.php'), self::target(12, Kind::JS, '/matomo.js')], microtime(true) + 30);
        $this->assertSame([11, 12], array_keys($responses));
        $this->assertStringContainsString('This resource is part of Matomo', $responses[11]->body);
    }
}
