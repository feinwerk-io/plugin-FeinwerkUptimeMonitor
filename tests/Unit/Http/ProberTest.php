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
