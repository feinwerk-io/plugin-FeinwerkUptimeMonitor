<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Http;

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
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\RawHttpFixtureServer;

/**
 * Every prober test again on the way of a host without curl (the extension missing, or curl_exec and curl_multi_exec
 * both disabled): PHP's own streams (Http\StreamTransport), one transfer after the other, with the same pinning, Host
 * and SNI, proxy rules, body caps, redirects and timings. Plus: the request it sends, and the same results as curl on
 * the fixtures, also for chunked, compressed, interim and malformed answers (tests/Fixtures/raw-server.php).
 *
 * @group FeinwerkUptimeMonitor
 */
class StreamProberTest extends ProberTest
{
    private static string $raw;

    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();
        self::$raw = RawHttpFixtureServer::start();
    }

    public static function tearDownAfterClass(): void
    {
        RawHttpFixtureServer::stop();
        parent::tearDownAfterClass();
    }

    protected static function capabilities(array $alsoDisabled = []): Capabilities
    {
        return new Capabilities(DisabledFunctions::except(array_merge(DisabledFunctions::CURL, $alsoDisabled)));
    }

    private static function raw(int $id, string $kind, string $path): Target
    {
        return new Target($id, 0, $kind . $id, $kind, self::$raw . $path, 'default');
    }

    /** @return array<string, string> the header lines of a request head, by lower-case name */
    private static function headersOf(string $head): array
    {
        $headers = [];
        foreach (array_slice(explode("\r\n", $head), 1) as $line) {
            [$name, $value] = array_pad(explode(':', $line, 2), 2, '');
            $headers[strtolower($name)] = trim($value);
        }

        return $headers;
    }

    public function test_usesTheStreamWay_andSendsThisRequest(): void
    {
        $this->assertSame(Capabilities::STREAM, static::prober()->transport());
        $this->assertSame([], static::prober()->missingFunctions(), 'nothing to report: the checks run');
        $r = static::prober()->probeAll([self::raw(1, Kind::WEB, '/echo')], microtime(true) + 30)[1];
        $this->assertSame(200, $r->status);
        $this->assertSame("GET /echo HTTP/1.1\r\nHost: 127.0.0.1:" . RawHttpFixtureServer::port() . "\r\nUser-Agent: FeinwerkUptimeMonitor-Test\r\n"
            . "Accept: */*\r\nCache-Control: no-cache\r\nAccept-Encoding: gzip, deflate\r\nConnection: close", $r->body);
    }

    /** The same request headers as curl's, plus Connection: close; the encodings curl decodes may be more (brotli). */
    public function test_theRequest_carriesCurlsHeaders(): void
    {
        $curl = self::headersOf(self::curlMultiProber()->probeAll([self::raw(1, Kind::WEB, '/echo')], microtime(true) + 30)[1]->body);
        $stream = self::headersOf(static::prober()->probeAll([self::raw(1, Kind::WEB, '/echo')], microtime(true) + 30)[1]->body);
        foreach (['host', 'user-agent', 'accept', 'cache-control'] as $name) {
            $this->assertSame($curl[$name], $stream[$name], $name);
        }
        $this->assertSame('close', $stream['connection']);
    }

    /** Without zlib's inflate the answer is asked for without an encoding; a compressed one anyway reads as protocol. */
    public function test_withoutInflate_noEncodingIsAskedFor(): void
    {
        $prober = new Prober(new AddressGuard(true), [], 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8, null, static::capabilities(['inflate_add']));
        $responses = $prober->probeAll([self::raw(1, Kind::WEB, '/echo'), self::raw(2, Kind::WEB, '/gzip')], microtime(true) + 30);
        $this->assertArrayNotHasKey('accept-encoding', self::headersOf($responses[1]->body));
        $this->assertSame([null, Outcome::PROTOCOL], [$responses[2]->status, $responses[2]->error]);
    }

    public function test_oldLibcurl_pinsOneAddress_ipv4First(): void
    {
        $this->markTestSkipped('a libcurl matter: the streams try every approved address');
    }

    public function test_parallel_eightAtOnce(): void
    {
        $this->markTestSkipped('one transfer after the other on this way: test_oneTransferAfterTheOther');
    }

    public function test_oneTransferAfterTheOther(): void
    {
        $start = microtime(true);
        $responses = static::prober()->probeAll([self::target(1, Kind::WEB, '/slow?s=1'), self::target(2, Kind::WEB, '/slow?s=1')], microtime(true) + 30);
        $this->assertSame([200, 200], [$responses[1]->status, $responses[2]->status]);
        $this->assertGreaterThanOrEqual(1.9, microtime(true) - $start, 'not side by side');
    }

    /**
     * The same results as curl_multi on the same answers: framing (Content-Length, chunked with extensions and trailers,
     * until close, HTTP/1.0, bare LF, LF lines with a CRLF empty line), interim answers, gzip and deflate (zlib and raw),
     * the caps on the decoded bytes (one chunk longer than the cap too), redirects resolved as curl resolves them (an empty
     * Location skipped), the headers the classifier reads, lower-case "http/1.1", continuation lines that hide a field,
     * and the malformed answers curl refuses (protocol), also a head of 300 KB.
     */
    public function test_theSameResultsAsCurl(): void
    {
        $paths = ['/ok', '/chunked', '/chunked-and-length', '/chunked-split', '/continue', '/many-interim', '/gzip', '/x-gzip',
            '/gzip-chunked', '/deflate', '/raw-deflate', '/gzip-bomb', '/bad-gzip', '/br', '/short', '/bad-chunk', '/short-chunked',
            '/http09', '/empty', '/lf', '/no-reason', '/not-modified', '/until-close', '/http10', '/kept', '/kept-long', '/rel/a/b',
            '/rq', '/netpath', '/dots', '/fragment', '/to-ftp', '/no-location', '/two-locations', '/404', '/huge-head',
            '/long-chunk-line', '/lf-crlf-end', '/lowercase', '/folded-length', '/folded-location', '/folded-first', '/same-length-twice',
            '/empty-location', '/big-chunk'];
        $targets = [];
        foreach ($paths as $i => $path) {
            $targets[] = self::raw($i + 1, Kind::WEB, $path);
        }
        $targets[] = self::raw(100, Kind::CONTAINER, '/gzip-bomb');
        $targets[] = self::raw(101, Kind::TRACKER, '/continue');
        foreach (['/ok', '/r1', '/big', '/bytes?n=' . Prober::MAX_BODY, '/bytes?n=' . (Prober::MAX_BODY + 1), '/nothing-here', '/db-down', '/basic',
            '/matomo.js', '/container', '/empty/matomo.php'] as $i => $path) {
            $targets[] = self::target(200 + $i, Kind::WEB, $path);
        }
        $targets[] = self::target(220, Kind::TRACKER, '/matomo.php');
        $targets[] = self::target(221, Kind::UI, '/loop');
        $targets[] = self::target(222, Kind::CONTAINER, '/bytes?n=' . (Prober::MAX_BODY_LARGE + 1));
        $targets[] = new Target(223, 0, 'web223', Kind::WEB, 'http://127.0.0.1:1/', 'default');
        $shape = static function (array $responses): array {
            $out = [];
            foreach ($responses as $id => $r) {
                $out[$id] = [$r->status, $r->error, $r->redirects, $r->finalUrl, $r->capped, strlen($r->body), md5($r->body), $r->headers,
                    $r->certNotAfter, array_keys($r->timings)];
            }
            return $out;
        };
        $curl = $shape(self::curlMultiProber(1000, 3000)->probeAll($targets, microtime(true) + 60));
        $stream = $shape(static::prober(null, 1000, 3000)->probeAll($targets, microtime(true) + 60));
        $this->assertCount(count($targets), $curl);
        foreach ($curl as $id => $expected) {
            $this->assertSame($expected, $stream[$id], "target $id: " . ($targets[array_search($id, array_map(static fn(Target $t): int => $t->id, $targets), true)]->url));
        }
        // some hand-checked values, so that the comparison is no comparison of two wrong answers
        $this->assertSame([200, md5('hello world')], [$stream[2][0], $stream[2][6]], '/chunked');
        $this->assertSame([200, null, Prober::MAX_BODY, true], [$stream[12][0], $stream[12][1], $stream[12][5], $stream[12][4]], 'the bomb: capped where it is decoded');
        $this->assertSame([null, Outcome::PROTOCOL], [$stream[15][0], $stream[15][1]], '/short');
        $this->assertSame([1, 'ftp://127.0.0.1/x', Outcome::BLOCKED], [$stream[32][2], $stream[32][3], $stream[32][1]], 'only http and https');
        $this->assertSame(['access-control-allow-credentials' => 'true'], $stream[101][7], 'the final answer after the interim ones');
    }

    /**
     * Heads read as curl reads them, checked by hand: a CRLF empty line after LF lines ends the head, a lower-case
     * "http/1.1" starts a status line, an empty Location is none (the next one counts), one chunk longer than the cap is
     * read up to the cap. As RFC 9112 says: a line that starts with a space or a tab continues the field before (5.2;
     * before the first field it is skipped, 2.2), and two different Content-Length values are a broken answer (6.3).
     * curl 7.74 differs there: it reads a continuation line on its own (an empty Location then stays empty), takes the
     * last Content-Length, and reads every lower-case status line as 200.
     */
    public function test_heads_asCurlReadsThem_andAsRfc9112Says(): void
    {
        $paths = [1 => '/lf-crlf-end', '/lowercase', '/lowercase-404', '/empty-location', '/folded-length', '/folded-location', '/folded-first',
            '/folded-kept', '/folded-location-value', '/two-lengths', '/same-length-twice', '/big-chunk'];
        $targets = [];
        foreach ($paths as $id => $path) {
            $targets[] = self::raw($id, Kind::WEB, $path);
        }
        $r = static::prober()->probeAll($targets, microtime(true) + 30);
        $other = self::$raw . '/other';
        $expected = [
            1 => [200, null, 'ok', 0, false, []],
            [200, null, 'ok', 0, false, []],
            [404, null, 'not found', 0, false, []],
            [200, null, 'other', 1, false, []],
            [200, null, 'okEXTRA', 0, false, []],
            [302, null, '', 0, false, []],
            [200, null, 'okEXTRA', 0, false, []],
            [200, null, 'ok', 0, false, ['access-control-allow-credentials' => 'true']],
            [200, null, 'other', 1, false, []],
            [null, Outcome::PROTOCOL, '', 0, false, []],
            [200, null, 'ok', 0, false, []],
            [200, null, str_repeat('c', Prober::MAX_BODY), 0, true, []],
        ];
        foreach ($expected as $id => $want) {
            $x = $r[$id];
            $this->assertSame($want, [$x->status, $x->error, $x->body, $x->redirects, $x->capped, $x->headers], $paths[$id]);
        }
        $this->assertSame([$other, $other], [$r[4]->finalUrl, $r[9]->finalUrl]);
    }

    /** The timings as curl reports them: the first byte after the server's second, no TLS time for http, all within total. */
    public function test_theTimings_asCurlReportsThem(): void
    {
        foreach (['curl' => self::curlMultiProber(), 'streams' => static::prober()] as $way => $prober) {
            $t = $prober->probeAll([self::target(1, Kind::WEB, '/slow?s=1')], microtime(true) + 30)[1]->timings;
            $this->assertGreaterThanOrEqual(950, $t['ttfb'], "$way: the server answered after a second");
            $this->assertLessThan(1500, $t['ttfb'], $way);
            $this->assertSame(0, $t['tls'], "$way: http");
            $this->assertLessThanOrEqual($t['ttfb'], $t['connect'], $way);
            $this->assertGreaterThanOrEqual($t['ttfb'], $t['total'], $way);
        }
    }

    /**
     * A server that sends a byte now and then never waits less than a read timeout: the check still ends within its time.
     * Every read gets only what is left of the 10 seconds (here 1.5), the head as well as the body.
     */
    public function test_aServerThatDrips_endsWithinTheCheckTime(): void
    {
        foreach (['/drip', '/drip-head'] as $path) {
            $start = microtime(true);
            $r = static::prober(null, 1000, 1500)->probeAll([self::raw(1, Kind::WEB, $path)], microtime(true) + 30)[1];
            $this->assertSame([null, Outcome::TIMEOUT], [$r->status, $r->error], $path);
            $this->assertLessThan(2.2, microtime(true) - $start, "$path: within the check's time");
        }
    }

    /**
     * A compression bomb (40 MB of one letter in 40 KB of gzip, sent in one piece) never fills memory: the decoder gets
     * the compressed bytes in small slices, and reading stops at the cap on the decoded bytes.
     */
    public function test_aCompressionBomb_staysWithinMemory(): void
    {
        if (!function_exists('memory_reset_peak_usage')) {
            $this->markTestSkipped('needs PHP 8.2 to measure the peak');
        }
        memory_reset_peak_usage();
        $before = memory_get_usage();
        $r = static::prober()->probeAll([self::raw(1, Kind::WEB, '/gzip-bomb-whole')], microtime(true) + 30)[1];
        $peak = memory_get_peak_usage() - $before;
        $this->assertSame([200, null, true, Prober::MAX_BODY], [$r->status, $r->error, $r->capped, strlen($r->body)]);
        $this->assertLessThan(4 * 1024 * 1024, $peak, 'never the 8 MB that one read of 8 KB could inflate to');
    }

    /**
     * A head of tiny lines (300 KB of "a:" lines, within the head's limit) is broken past 2000 header lines and never
     * fills memory: the lines are counted before anything is built, and only the fields the answer reads are kept. curl
     * reads it (200); no website sends that many lines.
     */
    public function test_aHeadOfManyTinyLines_isBroken_withinMemory(): void
    {
        if (!function_exists('memory_reset_peak_usage')) {
            $this->markTestSkipped('needs PHP 8.2 to measure the peak');
        }
        memory_reset_peak_usage();
        $before = memory_get_usage();
        $r = static::prober()->probeAll([self::raw(1, Kind::WEB, '/tiny-lines')], microtime(true) + 30)[1];
        $peak = memory_get_peak_usage() - $before;
        $this->assertSame([null, Outcome::PROTOCOL], [$r->status, $r->error]);
        $this->assertLessThan(2 * 1024 * 1024, $peak, 'never the 30 MB of a list of every line');
    }

    /** Up to 2000 header lines in all, interim answers counted too, as the head's size; one more is a broken answer. */
    public function test_headerLines_upTo2000_moreIsBroken_interimAnswersCounted(): void
    {
        $responses = static::prober()->probeAll([self::raw(1, Kind::WEB, '/lines-2000'), self::raw(2, Kind::WEB, '/lines-2001'),
            self::raw(3, Kind::WEB, '/lines-interim')], microtime(true) + 30);
        $this->assertSame([200, null, 'ok'], [$responses[1]->status, $responses[1]->error, $responses[1]->body]);
        $this->assertSame([null, Outcome::PROTOCOL], [$responses[2]->status, $responses[2]->error]);
        $this->assertSame([null, Outcome::PROTOCOL], [$responses[3]->status, $responses[3]->error], '1000 lines of an interim answer and 1001');
    }

    /**
     * Without PHP's TLS functions the streams still check http addresses; an https address is not checkable (note
     * php_disabled), nothing is sent to it, and the functions are named for the admin page.
     */
    public function test_withoutTheTlsFunctions_httpsIsNotCheckable_httpStillIs(): void
    {
        $prober = new Prober(new AddressGuard(true), [], 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8, null, static::capabilities(['stream_socket_enable_crypto']));
        $before = count(RawHttpFixtureServer::requests());
        $responses = $prober->probeAll([self::raw(1, Kind::WEB, '/ok'),
            new Target(2, 0, 'web2', Kind::WEB, 'https://127.0.0.1:' . RawHttpFixtureServer::port() . '/ok', 'default')], microtime(true) + 30);
        $this->assertSame([200, null], [$responses[1]->status, $responses[1]->error]);
        $this->assertSame([null, Outcome::PHP_DISABLED, ''], [$responses[2]->status, $responses[2]->error, $responses[2]->body]);
        $this->assertCount($before + 1, RawHttpFixtureServer::requests(), 'nothing sent to the https address');
        $this->assertSame(['stream_socket_enable_crypto'], $prober->missingFunctions());
    }

    /** The streams connect to the approved addresses only: none approved, no connection, never one by the name. */
    public function test_noApprovedAddress_isNoConnection_neverByTheName(): void
    {
        $guard = new class implements UrlGuard {
            public function check(string $url, bool $instanceTarget = false): GuardDecision
            {
                return new GuardDecision(true, null, null, 'localhost', (int) parse_url($url, PHP_URL_PORT), 'http', []);
            }

            public function checkWithoutResolving(string $url, bool $instanceTarget = false): GuardDecision
            {
                return $this->check($url, $instanceTarget);
            }
        };
        $r = static::prober($guard)->probeAll([new Target(1, 0, 'web1', Kind::WEB, 'http://localhost:' . HttpFixtureServer::port() . '/ok', 'default')], microtime(true) + 30)[1];
        $this->assertSame([null, Outcome::CONNECT], [$r->status, $r->error], 'the fixture server on localhost was not reached');
    }

    /**
     * Bytes that may not stand in a request line never reach it as they are: Prober::withHost() rebuilds every URL with
     * parse_url(), which turns control bytes into "_" (on every way), and the streams percent-encode the rest (space,
     * non-ASCII).
     */
    public function test_controlBytesInTheAddress_areNeverSentRaw(): void
    {
        $guard = new class implements UrlGuard {
            public function check(string $url, bool $instanceTarget = false): GuardDecision
            {
                return new GuardDecision(true, '127.0.0.1', null, '127.0.0.1', (int) parse_url($url, PHP_URL_PORT), 'http', ['127.0.0.1']);
            }

            public function checkWithoutResolving(string $url, bool $instanceTarget = false): GuardDecision
            {
                return $this->check($url, $instanceTarget);
            }
        };
        static::prober($guard)->probeAll([new Target(1, 0, 'web1', Kind::WEB, self::$raw . "/a\x00b\x7fc\xc3\xbc?q=\x01", 'default')], microtime(true) + 30);
        $requests = RawHttpFixtureServer::requests();
        $line = strtok((string) end($requests), "\r\n");
        $this->assertSame('GET /a_b_c%C3%BC?q=_ HTTP/1.1', $line);
    }
}
