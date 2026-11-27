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
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\TrustFile;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\UrlGuard;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\DisabledFunctions;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\RawHttpFixtureServer;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\TlsFixtureServer;

/**
 * Audit R2: the checks verify certificates with Matomo's CA file, as Matomo's own curl requests do
 * (core Http::configCurlCertificate at 5.0.0 and 6.0.0: [General] custom_cacert_pem, else the bundled cacert.pem), so a
 * server whose own trust store is missing or old still checks HTTPS. A verification that fails with Matomo's bundle for
 * a trust anchor problem is tried once more with the server's trust store (an internal CA or a self-signed certificate
 * installed only there); an expired or misnamed certificate is not; there is never a way without verification. Against a local HTTPS server whose certificate only the test's CA file trusts; in a child PHP,
 * curl.cainfo stands for the server's trust store (openssl.cafile on the stream way). Every case on the three ways:
 * curl_multi, curl_exec and PHP's streams (a host without curl).
 *
 * The streams get no OpenSSL verify result from PHP: after a failed verification with the bundle they read the
 * certificate chain once more without verifying (a diagnosis that sends nothing), so they open one connection more than
 * curl there; an expired certificate still gets no second try.
 *
 * @group FeinwerkUptimeMonitor
 */
class TrustTest extends TestCase
{
    private const NO_FILE = '/nonexistent/fwum/ca.pem';
    private static ?string $skip = null;

    public static function setUpBeforeClass(): void
    {
        self::$skip = TlsFixtureServer::start();
    }

    public static function tearDownAfterClass(): void
    {
        TlsFixtureServer::stop();
        RawHttpFixtureServer::stop();
    }

    protected function setUp(): void
    {
        if (self::$skip !== null) {
            $this->markTestSkipped(self::$skip);
        }
    }

    private const WAYS = ['multi', 'sequential', 'stream'];

    /** @return array<string, array{Capabilities, string}> */
    public static function transports(): array
    {
        return [
            'curl_multi' => [new Capabilities(), 'multi'],
            'curl_exec' => [new Capabilities(DisabledFunctions::except(['curl_multi_exec'])), 'sequential'],
            'streams' => [new Capabilities(DisabledFunctions::except(DisabledFunctions::CURL)), 'stream'],
        ];
    }

    /** the server's trust store of a child PHP: curl.cainfo for curl, openssl.cafile for the streams */
    private static function trustStore(string $file): array
    {
        return ['curl.cainfo' => $file, 'openssl.cafile' => $file];
    }

    /** the handshakes of a check: on the stream way one more after a failed verification with the bundle (the diagnosis) */
    private static function handshakes(string $way, int $curl, int $stream): int
    {
        return $way === 'stream' ? $stream : $curl;
    }

    private static function probe(?string $caFile, bool $systemRetry, Capabilities $capabilities, string $port = 'self')
    {
        $guard = new AddressGuard(true, static fn(string $host): array => $host === 'localhost' ? ['127.0.0.1'] : [], true);
        $prober = new Prober($guard, [], 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8, $caFile, $capabilities, $systemRetry);

        return $prober->probeAll([new Target(1, 1, 'web1', Kind::WEB, TlsFixtureServer::url($port), 'default')], microtime(true) + 30)[1];
    }

    /**
     * Probes the URLs one after the other with one prober in a child PHP whose curl.cainfo stands for the server's
     * trust store (each URL its own probeAll(), as a run's first checks and its retry phase).
     *
     * @param string[] $urls
     * @return list<array{status: ?int, error: ?string, body: string, redirects: int, total: int, tls: int}>
     */
    private static function runInChild(string $caFile, string $trustStore, string $transport, int $totalMs, array $urls): array
    {
        $answer = DisabledFunctions::runChild([], array_merge(['tlsrun', $caFile, '1', $transport, (string) $totalMs], $urls), self::trustStore($trustStore));
        self::assertTrue($answer['ok'], (string) ($answer['error'] ?? ''));

        return $answer['results'];
    }

    /**
     * @param array<string, string> $ini
     * @return array{status: ?int, error: ?string, body: string}
     */
    private static function probeInChild(string $caFile, bool $systemRetry, array $ini, string $transport = 'multi'): array
    {
        $answer = DisabledFunctions::runChild([], ['tls', TlsFixtureServer::url(), $caFile, $systemRetry ? '1' : '0', $transport], $ini);
        self::assertTrue($answer['ok'], (string) ($answer['error'] ?? ''));

        return $answer['results'];
    }

    /** @dataProvider transports */
    public function test_theGivenCaFile_verifiesTheServer(Capabilities $capabilities): void
    {
        $r = self::probe(TlsFixtureServer::trustingCa(), false, $capabilities);
        $this->assertSame([200, null, 'ok'], [$r->status, $r->error, $r->body]);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', (string) $r->certNotAfter, "the certificate's expiry date");
    }

    /** The handshake's time is the tls timing (a server that waits 300 ms before it), on every way. */
    public function test_theHandshakeTime_isTheTlsTiming(): void
    {
        TlsFixtureServer::delay('internal', 300);
        try {
            foreach (self::transports() as $way => [$capabilities]) {
                $t = self::probe(TlsFixtureServer::internalCa(), false, $capabilities, 'internal')->timings;
                $this->assertGreaterThanOrEqual(250, $t['tls'], $way);
                $this->assertLessThan(900, $t['tls'], $way);
                $this->assertGreaterThanOrEqual($t['connect'] + $t['tls'], $t['ttfb'] + 1, "$way: the first byte after the handshake");
            }
        } finally {
            TlsFixtureServer::delay('internal', 0);
        }
    }

    /** An intranet Matomo addressed by its IP: the certificate's IP address entry verifies, on every way. */
    public function test_anAddressByIp_verifiesTheCertificatesIpEntry(): void
    {
        $url = str_replace('//localhost:', '//127.0.0.1:', TlsFixtureServer::url('internal'));
        foreach (self::transports() as $way => [$capabilities]) {
            $prober = new Prober(new AddressGuard(true, null, true), [], 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8, TlsFixtureServer::internalCa(), $capabilities);
            $r = $prober->probeAll([new Target(1, 0, 'web1', Kind::WEB, $url, 'default')], microtime(true) + 30)[1];
            $this->assertSame([200, null, 'ok'], [$r->status, $r->error, $r->body], $way);
        }
    }

    /**
     * Host, SNI and the certificate's name carry the guard's host, never the URL's own: here the guard answers for an
     * alias with localhost, the name in the certificate.
     *
     * @dataProvider transports
     */
    public function test_theNameVerified_isTheGuardsHost(Capabilities $capabilities): void
    {
        $guard = new class implements UrlGuard {
            public function check(string $url, bool $instanceTarget = false): GuardDecision
            {
                return new GuardDecision(true, '127.0.0.1', null, 'localhost', (int) parse_url($url, PHP_URL_PORT), 'https', ['127.0.0.1']);
            }

            public function checkWithoutResolving(string $url, bool $instanceTarget = false): GuardDecision
            {
                return new GuardDecision(true, null, null, 'localhost', (int) parse_url($url, PHP_URL_PORT), 'https');
            }
        };
        $url = str_replace('//localhost:', '//alias.test:', TlsFixtureServer::url('internal'));
        $prober = new Prober($guard, [], 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8, TlsFixtureServer::internalCa(), $capabilities);
        $r = $prober->probeAll([new Target(1, 1, 'web1', Kind::WEB, $url, 'default')], microtime(true) + 30)[1];
        $this->assertSame([200, null, 'ok'], [$r->status, $r->error, $r->body], 'verified for localhost, not for alias.test');
    }

    /**
     * Through Matomo's proxy, https goes through CONNECT to the guard's host and port, with the proxy's credentials; the
     * certificate is verified end to end. A proxy that refuses the tunnel is the proxy's failure.
     *
     * @dataProvider transports
     */
    public function test_throughMatomosProxy_httpsTunnelsToTheGuardsHost(Capabilities $capabilities, string $way): void
    {
        RawHttpFixtureServer::start();
        $guard = new class implements UrlGuard {
            public function check(string $url, bool $instanceTarget = false): GuardDecision
            {
                return $this->checkWithoutResolving($url, $instanceTarget);
            }

            public function checkWithoutResolving(string $url, bool $instanceTarget = false): GuardDecision
            {
                $host = parse_url($url, PHP_URL_HOST) === 'alias.test' ? 'localhost' : 'denied.test';
                return new GuardDecision(true, null, null, $host, (int) parse_url($url, PHP_URL_PORT), 'https');
            }
        };
        $proxy = RawHttpFixtureServer::asProxy() + ['username' => 'u', 'password' => 'p'];
        $port = (int) parse_url(TlsFixtureServer::url('internal'), PHP_URL_PORT);
        $prober = new Prober($guard, $proxy, 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8, TlsFixtureServer::internalCa(), $capabilities);
        $responses = $prober->probeAll([new Target(1, 1, 'web1', Kind::WEB, "https://alias.test:$port/", 'default'),
            new Target(2, 1, 'web2', Kind::WEB, "https://other.test:$port/", 'default')], microtime(true) + 30);
        $this->assertSame([200, null, 'ok'], [$responses[1]->status, $responses[1]->error, $responses[1]->body], $way);
        $this->assertSame([null, Outcome::PROXY], [$responses[2]->status, $responses[2]->error], "$way: the proxy refused the tunnel");
        $connects = array_values(array_filter(RawHttpFixtureServer::requests(), static fn(string $head): bool => strncmp($head, 'CONNECT ', 8) === 0));
        [$tunnel, $refused] = array_slice($connects, -2);
        $lines = explode("\r\n", $tunnel);
        $this->assertSame("CONNECT localhost:$port HTTP/1.1", $lines[0], $way);
        $this->assertContains("Host: localhost:$port", $lines, $way);
        $this->assertContains('Proxy-Authorization: Basic ' . base64_encode('u:p'), $lines, $way);
        $this->assertStringStartsWith("CONNECT denied.test:$port HTTP/1.1", $refused, $way);
    }

    /** @dataProvider transports */
    public function test_aCaFileThatDoesNotTrustTheServer_isATlsError_neverWithoutVerification(Capabilities $capabilities): void
    {
        $this->assertSame([null, Outcome::TLS], [self::probe(TlsFixtureServer::otherCa(), false, $capabilities)->status, self::probe(TlsFixtureServer::otherCa(), false, $capabilities)->error]);
        // the second try uses the server's trust store, which does not know the test certificate either
        $r = self::probe(TlsFixtureServer::otherCa(), true, $capabilities);
        $this->assertSame([null, Outcome::TLS], [$r->status, $r->error]);
        $r = self::probe(null, false, $capabilities);
        $this->assertSame([null, Outcome::TLS], [$r->status, $r->error], 'the trust store alone');
    }

    /** The audit's case: the server's trust store is missing (curl error 77); Matomo's file still verifies. */
    public function test_withoutTheServersTrustStore_theGivenCaFileStillVerifies(): void
    {
        $missing = self::trustStore(self::NO_FILE);
        foreach (self::WAYS as $transport) {
            $this->assertSame(['status' => 200, 'error' => null, 'body' => 'ok'], self::probeInChild(TlsFixtureServer::trustingCa(), false, $missing, $transport), $transport);
            $this->assertSame(Outcome::TLS, self::probeInChild('-', false, $missing, $transport)['error'], "$transport: without a CA file of its own");
        }
    }

    /** An internal CA only in the server's trust store: the bundle fails, the second try with the trust store passes. */
    public function test_theBundleFailing_isTriedOnceMoreWithTheServersTrustStore(): void
    {
        $internal = self::trustStore(TlsFixtureServer::internalCa());
        $url = TlsFixtureServer::url('internal');
        foreach (self::WAYS as $transport) {
            $answer = DisabledFunctions::runChild([], ['tls', $url, TlsFixtureServer::otherCa(), '1', $transport], $internal);
            $this->assertSame(['status' => 200, 'error' => null, 'body' => 'ok'], $answer['results'], $transport);
            $answer = DisabledFunctions::runChild([], ['tls', $url, TlsFixtureServer::otherCa(), '0', $transport], $internal);
            $this->assertSame(Outcome::TLS, $answer['results']['error'], "$transport: no second try for a file set in custom_cacert_pem");
        }
        foreach (['multi', 'stream'] as $transport) {
            $answer = DisabledFunctions::runChild([], ['tls', $url, TlsFixtureServer::otherCa(), '1', $transport], self::trustStore(self::NO_FILE));
            $this->assertSame(Outcome::TLS, $answer['results']['error'], "$transport: neither trusts it");
        }
    }

    /**
     * The trust anchor fix of 5.4.0 (an intranet's certificate in the server's trust store keeps working): a self-signed
     * certificate that only the server's trust store trusts (OpenSSL 18 with Matomo's bundle) reads up, as in 5.3.3: the
     * bundle once, then the trust store.
     */
    public function test_aSelfSignedCertificateInTheServersTrustStore_readsUp(): void
    {
        foreach (self::WAYS as $transport) {
            $before = TlsFixtureServer::accepts('self');
            $answer = DisabledFunctions::runChild([], ['tls', TlsFixtureServer::url('self'), TlsFixtureServer::otherCa(), '1', $transport],
                self::trustStore(TlsFixtureServer::trustingCa()));
            $this->assertSame(['status' => 200, 'error' => null, 'body' => 'ok'], $answer['results'], $transport);
            $this->assertSame(self::handshakes($transport, 2, 3), TlsFixtureServer::accepts('self') - $before, "$transport: the bundle, then the trust store");
        }
    }

    /**
     * An internal CA whose server sends its own root along (OpenSSL 19 with Matomo's bundle), the root only in the
     * server's trust store: reads up.
     */
    public function test_aPrivateCaRootSentWithItsLeaf_inTheServersTrustStore_readsUp(): void
    {
        foreach (self::WAYS as $transport) {
            $before = TlsFixtureServer::accepts('chain');
            $answer = DisabledFunctions::runChild([], ['tls', TlsFixtureServer::url('chain'), TlsFixtureServer::otherCa(), '1', $transport],
                self::trustStore(TlsFixtureServer::internalCa()));
            $this->assertSame(['status' => 200, 'error' => null, 'body' => 'ok'], $answer['results'], $transport);
            $this->assertSame(self::handshakes($transport, 2, 3), TlsFixtureServer::accepts('chain') - $before, "$transport: the bundle, then the trust store");
        }
    }

    /**
     * A self-signed certificate or an issuer that neither Matomo's bundle nor the server's trust store knows: the second
     * try runs and the check reads TLS.
     *
     * @dataProvider transports
     */
    public function test_aTrustAnchorNoStoreKnows_isTriedOnceMore_andReadsTls(Capabilities $capabilities, string $way): void
    {
        foreach (['self', 'internal', 'chain'] as $port) {
            $before = TlsFixtureServer::accepts($port);
            $this->assertSame(Outcome::TLS, self::probe(TlsFixtureServer::otherCa(), true, $capabilities, $port)->error, $port);
            $this->assertSame(self::handshakes($way, 2, 3), TlsFixtureServer::accepts($port) - $before, "$port: the bundle, then the trust store");
        }
    }

    /**
     * An expired certificate whose issuer Matomo's bundle knows is a TLS error at once, with one handshake: no trust
     * store changes that. Each probe() has a prober of its own, so no earlier second try of the host is remembered.
     *
     * @dataProvider transports
     */
    public function test_anExpiredCertificate_readsTlsWithoutASecondFetch(Capabilities $capabilities, string $way): void
    {
        $before = TlsFixtureServer::accepts('expired');
        $r = self::probe(TlsFixtureServer::internalCa(), true, $capabilities, 'expired');
        $this->assertSame(Outcome::TLS, $r->error);
        $this->assertSame(self::handshakes($way, 1, 2), TlsFixtureServer::accepts('expired') - $before, 'one verifying handshake (the streams: and the diagnosis)');
        if ($way === 'stream') {
            $this->assertSame(gmdate('Y-m-d'), $r->certNotAfter, 'the diagnosis read the date: expired today');
        }
    }

    /**
     * Review of part 2: a server that sends an expired certificate along with its valid one (as many still sent the old
     * cross-signed root) is no expired certificate: the leaf decides, the strict second try with the trust store follows
     * and verifies.
     */
    public function test_anExpiredCertificateSentAlong_stillGetsTheSecondTry(): void
    {
        foreach (self::WAYS as $transport) {
            $answer = DisabledFunctions::runChild([], ['tls', TlsFixtureServer::url('oldchain'), TlsFixtureServer::otherCa(), '1', $transport],
                self::trustStore(TlsFixtureServer::internalCa()));
            $this->assertSame(['status' => 200, 'error' => null, 'body' => 'ok'], $answer['results'], $transport);
        }
    }

    /**
     * Review of part 2: bytes a broken proxy sends right after its CONNECT answer are never taken for the target's
     * answer: the check reads proxy. (curl reads the answer byte by byte and hands such bytes to TLS, which fails.)
     */
    public function test_bytesAfterTheProxysConnectAnswer_readAsAProxyFailure(): void
    {
        RawHttpFixtureServer::start();
        $guard = new class implements UrlGuard {
            public function check(string $url, bool $instanceTarget = false): GuardDecision
            {
                return $this->checkWithoutResolving($url, $instanceTarget);
            }

            public function checkWithoutResolving(string $url, bool $instanceTarget = false): GuardDecision
            {
                return new GuardDecision(true, null, null, 'localhost', (int) parse_url($url, PHP_URL_PORT), 'https');
            }
        };
        RawHttpFixtureServer::connectExtra("HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\nfake!");
        try {
            [$capabilities] = self::transports()['streams'];
            $prober = new Prober($guard, RawHttpFixtureServer::asProxy(), 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8, TlsFixtureServer::internalCa(), $capabilities);
            $r = $prober->probeAll([new Target(1, 1, 'web1', Kind::WEB, 'https://alias.test:' . parse_url(TlsFixtureServer::url('internal'), PHP_URL_PORT) . '/', 'default')],
                microtime(true) + 30)[1];
            $this->assertSame([null, Outcome::PROXY, ''], [$r->status, $r->error, $r->body]);
        } finally {
            RawHttpFixtureServer::connectExtra('');
        }
    }

    /**
     * A certificate for another host name whose issuer Matomo's bundle knows is a TLS error at once, with one handshake.
     *
     * @dataProvider transports
     */
    public function test_aHostNameMismatch_readsTlsWithoutASecondFetch(Capabilities $capabilities): void
    {
        $before = TlsFixtureServer::accepts('wrongname');
        $this->assertSame(Outcome::TLS, self::probe(TlsFixtureServer::internalCa(), true, $capabilities, 'wrongname')->error);
        $this->assertSame(1, TlsFixtureServer::accepts('wrongname') - $before, 'one handshake, on every way');
    }

    /**
     * The second try verifies as strictly as the first (peer and host), only with the server's trust anchors: an expired
     * or misnamed certificate of a CA that only the trust store knows reads TLS. OpenSSL reports the unknown issuer
     * before the date or the name, so it takes the second handshake to find out.
     */
    public function test_theSecondTry_verifiesPeerAndHostStrictly(): void
    {
        foreach (self::WAYS as $transport) {
            foreach (['expired', 'wrongname'] as $port) {
                $before = TlsFixtureServer::accepts($port);
                $answer = DisabledFunctions::runChild([], ['tls', TlsFixtureServer::url($port), TlsFixtureServer::otherCa(), '1', $transport],
                    self::trustStore(TlsFixtureServer::internalCa()));
                $this->assertSame([null, Outcome::TLS], [$answer['results']['status'], $answer['results']['error']], "$transport, $port");
                // the streams see the expired date in their diagnosis and leave out the trust store
                $this->assertSame(self::handshakes($transport, 2, $port === 'expired' ? 2 : 3), TlsFixtureServer::accepts($port) - $before,
                    "$transport, $port: the bundle, then the trust store");
            }
        }
    }

    /**
     * SHOULD 2: once the server's trust store verified where the bundle lacked the issuer, the host's other checks of the
     * run (a redirect hop, the run's retry phase) start with the trust store: no failing handshake on every hop.
     */
    public function test_aHostTheTrustStoreVerified_startsThereForTheRestOfTheRun(): void
    {
        $stores = ['internal' => TlsFixtureServer::internalCa(), 'self' => TlsFixtureServer::trustingCa()];
        foreach ($stores as $port => $trustStore) {
            foreach (self::WAYS as $transport) {
                $before = TlsFixtureServer::accepts($port);
                $results = self::runInChild(TlsFixtureServer::otherCa(), $trustStore, $transport, 5000,
                    [TlsFixtureServer::url($port, '/hop'), TlsFixtureServer::url($port)]);
                $this->assertSame([[200, null, 1], [200, null, 0]], array_map(static fn(array $r): array => [$r['status'], $r['error'], $r['redirects']], $results), "$port, $transport");
                $this->assertSame(self::handshakes($transport, 4, 5), TlsFixtureServer::accepts($port) - $before,
                    "$port, $transport: the bundle once and the trust store, then the hop and the next check with the trust store only");
            }
        }
    }

    /**
     * Review of the 5.4.0 fixes, NIT 2: the run remembers a host and port, not the host alone. Another port of the same
     * host whose certificate the bundle verifies (and the server's trust store does not) still starts with the bundle.
     */
    public function test_anotherPortOfThatHost_stillStartsWithTheBundle(): void
    {
        foreach (self::WAYS as $transport) {
            $results = self::runInChild(TlsFixtureServer::internalCa(), TlsFixtureServer::trustingCa(), $transport, 5000,
                [TlsFixtureServer::url('self'), TlsFixtureServer::url('internal')]);
            $this->assertSame([[200, null], [200, null]], array_map(static fn(array $r): array => [$r['status'], $r['error']], $results),
                "$transport: self through the trust store, then internal through the bundle");
        }
    }

    /**
     * SHOULD 2: the failed handshake with the bundle is not part of the reported response time (the check answered on its
     * second try), but it counts towards the check's 10 seconds.
     */
    public function test_theFailedHandshake_countsTowardsTheTimeButNotTheResponseTime(): void
    {
        TlsFixtureServer::delay('internal', 400);
        try {
            foreach (self::WAYS as $transport) {
                [$r] = self::runInChild(TlsFixtureServer::otherCa(), TlsFixtureServer::internalCa(), $transport, 5000, [TlsFixtureServer::url('internal')]);
                $this->assertSame([200, null], [$r['status'], $r['error']], $transport);
                $this->assertGreaterThanOrEqual(400, $r['total'], "$transport: the handshake that answered");
                $this->assertLessThan(800, $r['total'], "$transport: without the failed one before it");
                // 600 ms in all: the failed try leaves less than the 400 ms the second handshake (the streams: their
                // diagnosis) waits, so it runs out of time instead of answering. libcurl's connect timeout covers the
                // handshake; some libcurl builds (CI's) then report no connect time, which reads as connect rather than
                // timeout
                [$r] = self::runInChild(TlsFixtureServer::otherCa(), TlsFixtureServer::internalCa(), $transport, 600, [TlsFixtureServer::url('internal')]);
                $this->assertNull($r['status'], "$transport: within the check's time");
                $this->assertContains($r['error'], [Outcome::TIMEOUT, Outcome::CONNECT], "$transport: the time ran out");
            }
        } finally {
            TlsFixtureServer::delay('internal', 0);
        }
    }

    /**
     * The rule of the second try: a trust anchor problem with Matomo's bundle (OpenSSL's verify results 2, 18, 19, 20,
     * 21, 27: the issuer not found, a self-signed certificate or root it lacks, a root not trusted) or a bundle that
     * cannot be loaded (curl 77). Not for a certificate that no trust store makes valid: not yet valid (9), expired (10),
     * revoked (23), rejected (28), another host name (62; curl's own name check leaves 1). With another TLS library
     * libcurl gives no such reason, and every verification failure gets it.
     */
    public function test_secondTry_forEveryTrustAnchorProblem(): void
    {
        foreach (['OpenSSL/3.0.13', 'LibreSSL/3.3.6', 'BoringSSL', 'quictls/3.0.10', 'AWS-LC/1.20.0', 'OpenSSL/1.1.1w (Schannel)'] as $library) {
            foreach ([2, 18, 19, 20, 21, 27] as $verify) {
                $this->assertTrue(TrustFile::secondTry(60, $verify, $library), "$library, a trust anchor problem: $verify");
            }
            foreach ([0, 1, 9, 10, 23, 28, 62] as $verify) {
                $this->assertFalse(TrustFile::secondTry(60, $verify, $library), "$library, a certificate error: $verify");
            }
            $this->assertTrue(TrustFile::secondTry(77, 0, $library), "$library: the file cannot be loaded");
            $this->assertFalse(TrustFile::secondTry(35, 0, $library), "$library: no verification error");
            $this->assertFalse(TrustFile::secondTry(0, 0, $library));
        }
        foreach (['GnuTLS/3.7.9', 'Schannel', 'SecureTransport', 'mbedTLS/2.28.0', 'wolfSSL/5.6.0', '(OpenSSL/1.1.1w) Schannel', ''] as $library) {
            $this->assertTrue(TrustFile::secondTry(60, 66, $library), "$library: no reason to tell");
            $this->assertFalse(TrustFile::secondTry(35, 0, $library), $library);
        }
    }

    /**
     * The second try with the server's trust store is part of the check, not a new one: it runs also when the run's
     * deadline passed during the first try (a new check would not start then), so the address keeps its result.
     */
    /** @dataProvider transports */
    public function test_theSecondTry_runsAfterTheDeadlineToo(Capabilities $capabilities, string $way): void
    {
        $slow = true;
        $guard = new AddressGuard(true, static function (string $host) use (&$slow): array {
            if ($slow) {
                usleep(400000); // the first lookup outlasts the run's deadline
                $slow = false;
            }
            return $host === 'localhost' ? ['127.0.0.1'] : [];
        }, true);
        $prober = new Prober($guard, [], 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8, TlsFixtureServer::otherCa(), $capabilities, true);
        $before = TlsFixtureServer::accepts('internal');
        $responses = $prober->probeAll([new Target(1, 1, 'web1', Kind::WEB, TlsFixtureServer::url('internal'), 'default')], microtime(true) + 0.3);
        $this->assertArrayHasKey(1, $responses, 'a result, not "not measured"');
        $this->assertSame(Outcome::TLS, $responses[1]->error);
        $this->assertSame(self::handshakes($way, 2, 3), TlsFixtureServer::accepts('internal') - $before, 'the second try ran');
    }

    public function test_theCaFile_followsMatomosOrder(): void
    {
        $readable = static fn(string $path): bool => in_array($path, ['/etc/custom.pem', '/matomo/vendor/cacert.pem'], true);
        $this->assertSame(['/etc/custom.pem', false], TrustFile::choose('/etc/custom.pem', '/matomo/vendor/cacert.pem', $readable),
            'custom_cacert_pem first, alone, as Matomo uses it');
        $this->assertSame(['/matomo/vendor/cacert.pem', true], TrustFile::choose('', '/matomo/vendor/cacert.pem', $readable),
            "else Matomo's bundled file, with a second try through the server's trust store");
        $this->assertSame(['/matomo/vendor/cacert.pem', true], TrustFile::choose(null, '/matomo/vendor/cacert.pem', $readable));
        $this->assertSame(['/matomo/vendor/cacert.pem', true], TrustFile::choose('/outside/open_basedir.pem', '/matomo/vendor/cacert.pem', $readable),
            'a custom file this PHP cannot read is skipped');
        $this->assertSame([null, false], TrustFile::choose('', '/gone/cacert.pem', $readable), "else the server's trust store");
        $this->assertSame([null, false], TrustFile::choose('', null, $readable), 'no bundle at all');
    }

    public function test_readable_neverWarns_outsideOpenBasedir(): void
    {
        $this->assertFalse(TrustFile::readable(self::NO_FILE));
        $this->assertTrue(TrustFile::readable(TlsFixtureServer::trustingCa()));
    }
}
