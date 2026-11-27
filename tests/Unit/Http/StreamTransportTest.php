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
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Capabilities;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\GuardDecision;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Prober;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\StreamTransport;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\DisabledFunctions;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\RawHttpFixtureServer;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\TlsFixtureServer;

/**
 * StreamTransport on its own, with a clock of the test's: the waits at the very end of a check's time, which no real
 * clock hits on purpose (a read that starts with less than a microsecond left).
 *
 * @group FeinwerkUptimeMonitor
 */
class StreamTransportTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        RawHttpFixtureServer::start();
    }

    public static function tearDownAfterClass(): void
    {
        RawHttpFixtureServer::stop();
        TlsFixtureServer::stop();
    }

    private static function transport(?\Closure $clock = null): StreamTransport
    {
        return new StreamTransport(new Capabilities(DisabledFunctions::except(DisabledFunctions::CURL)), 'FeinwerkUptimeMonitor-Test', [], $clock);
    }

    /**
     * A clock that runs with the real time until $after seconds past its first reading (the start of fetch()), then
     * stands still half a microsecond before the deadline of a transfer of $totalMs: every wait from then on has less
     * than a microsecond left. It counts from 1000 s, so that half a microsecond is exact in a float (at today's epoch
     * a float steps by about 0.24 microseconds).
     *
     * @param float|null $left set to the time the transfer has left once the clock stands still
     */
    private static function clockStandingStillBeforeTheDeadline(float $after, int $totalMs, ?float &$left): \Closure
    {
        $base = microtime(true);
        $start = null;
        $left = null;

        return static function () use ($base, $after, $totalMs, &$start, &$left): float {
            $now = 1000.0 + (microtime(true) - $base);
            $start ??= $now;
            if ($now - $start < $after) {
                return $now;
            }
            $still = $start + $totalMs / 1000 - 5e-7;
            $left = $start + $totalMs / 1000 - $still;

            return $still;
        };
    }

    /** A clock that runs with the real time until $after seconds past its first reading, then reads a second past the deadline of a transfer of $totalMs. */
    private static function clockJumpingPastTheDeadline(float $after, int $totalMs): \Closure
    {
        $start = null;

        return static function () use ($after, $totalMs, &$start): float {
            $now = microtime(true);
            $start ??= $now;

            return $now - $start < $after ? $now : $start + $totalMs / 1000 + 1.0;
        };
    }

    private function assertTheClockStoodStillJustBeforeTheDeadline(?float $left): void
    {
        $this->assertNotNull($left, 'the clock stood still during the transfer');
        $this->assertGreaterThan(0.0, $left);
        $this->assertLessThan(1e-6, $left);
    }

    private static function tls(string $path): array
    {
        $url = TlsFixtureServer::url('internal', $path);
        return [$url, new GuardDecision(true, '127.0.0.1', null, 'localhost', (int) parse_url($url, PHP_URL_PORT), 'https', ['127.0.0.1'])];
    }

    public static function remainingTimes(): array
    {
        return [
            'a tenth of a microsecond' => [1e-7, null],
            'half a microsecond' => [5e-7, null],
            'just under a millisecond' => [0.000999, null],
            'nothing' => [0.0, null],
            'past' => [-0.5, null],
            'a millisecond' => [0.001, [0, 1000]],
            'a quarter second' => [0.25, [0, 250000]],
            'just under a second' => [0.9999999, [0, 999999]],
            'a second' => [1.0, [1, 0]],
            'two and a half seconds' => [2.5, [2, 500000]],
            'ten seconds' => [10.0, [10, 0]],
        ];
    }

    /**
     * What a read or write may wait: under a millisecond is a timeout before the stream is touched. Never 0 seconds and
     * 0 microseconds: on a TLS stream PHP then waits without any limit, on plain TCP it does not wait at all.
     *
     * @dataProvider remainingTimes
     */
    public function test_streamTimeout_underAMillisecond_isATimeout_neverZero(float $left, ?array $expected): void
    {
        $this->assertSame($expected, StreamTransport::streamTimeout($left));
    }

    public static function chunkSizes(): array
    {
        return [
            'zero' => ['0', PHP_INT_MAX, 0],
            'zeros' => ['000', PHP_INT_MAX, 0],
            'upper case' => ['A', PHP_INT_MAX, 10],
            'fifteen digits' => ['fffffffffffffff', PHP_INT_MAX, 1152921504606846975],
            '32-bit: the largest' => ['7fffffff', 0x7fffffff, 2147483647],
            '32-bit: the largest with leading zeros' => ['00000007fffffff', 0x7fffffff, 2147483647],
            '32-bit: one more' => ['80000000', 0x7fffffff, null],
            '32-bit: one more with leading zeros' => ['000000080000000', 0x7fffffff, null],
            '32-bit: would wrap to the last chunk' => ['100000000', 0x7fffffff, null],
            '32-bit: would wrap to 16 bytes' => ['100000010', 0x7fffffff, null],
        ];
    }

    /**
     * A chunk size larger than PHP's integers (on 32-bit PHP above 7fffffff) is refused before hexdec(), which would give
     * a float that (int) wraps into a small size: 100000000 into the last chunk, 100000010 into one of 16 bytes.
     *
     * @dataProvider chunkSizes
     */
    public function test_chunkSize_largerThanAnInteger_isRefused_neverWrapped(string $digits, int $max, ?int $expected): void
    {
        $this->assertSame($expected, StreamTransport::chunkSize($digits, $max));
    }

    /** An https server that says nothing after the request: a timeout at the end of the check's time. */
    public function test_aSilentTlsServer_isATimeout_withinTheLimit(): void
    {
        $skip = TlsFixtureServer::start();
        if ($skip !== null) {
            $this->markTestSkipped($skip);
        }
        [$url, $decision] = self::tls('/silent');
        $start = microtime(true);
        $r = self::transport()->fetch($url, $decision, false, TlsFixtureServer::internalCa(), false, 1500, 1500, Prober::MAX_BODY);
        $this->assertSame([null, Outcome::TIMEOUT], [$r->status, $r->error]);
        $this->assertGreaterThan(1.4, microtime(true) - $start, 'it waited for the answer');
        $this->assertLessThan(2.2, microtime(true) - $start, 'never when the server gives up (4 s)');
    }

    /**
     * The request written with less than a microsecond left (the handshake took until then): a timeout at once, never
     * a TLS read without a limit that only the server ends.
     */
    public function test_aSilentTlsServer_theRequestAtTheLastMicrosecond_isATimeout_withinTheLimit(): void
    {
        $skip = TlsFixtureServer::start();
        if ($skip !== null) {
            $this->markTestSkipped($skip);
        }
        [$url, $decision] = self::tls('/silent');
        $clock = self::clockStandingStillBeforeTheDeadline(0.3, 3000, $left);
        TlsFixtureServer::delay('internal', 600);
        try {
            $start = microtime(true);
            $r = self::transport($clock)->fetch($url, $decision, false, TlsFixtureServer::internalCa(), false, 3000, 3000, Prober::MAX_BODY);
            $elapsed = microtime(true) - $start;
        } finally {
            TlsFixtureServer::delay('internal', 0);
        }
        $this->assertTheClockStoodStillJustBeforeTheDeadline($left);
        $this->assertSame([null, Outcome::TIMEOUT], [$r->status, $r->error]);
        $this->assertLessThan(3.0, $elapsed, 'within the check time, not when the server gives up (4.6 s)');
    }

    /**
     * The attack of the review: an https server drips its answer until just before the check's deadline and then falls
     * silent. A read that starts with less than a microsecond left is a timeout at once.
     */
    public function test_aTlsServerThatDripsThenFallsSilent_aReadAtTheLastMicrosecond_isATimeout_withinTheLimit(): void
    {
        $skip = TlsFixtureServer::start();
        if ($skip !== null) {
            $this->markTestSkipped($skip);
        }
        [$url, $decision] = self::tls('/drip');
        $clock = self::clockStandingStillBeforeTheDeadline(0.45, 3000, $left);
        $start = microtime(true);
        $r = self::transport($clock)->fetch($url, $decision, false, TlsFixtureServer::internalCa(), false, 3000, 3000, Prober::MAX_BODY);
        $elapsed = microtime(true) - $start;
        $this->assertTheClockStoodStillJustBeforeTheDeadline($left);
        $this->assertSame([null, Outcome::TIMEOUT], [$r->status, $r->error]);
        $this->assertLessThan(3.0, $elapsed, 'within the check time, not when the server gives up (5.5 s)');
    }

    /**
     * Plain http: a read at the last microsecond is a timeout, never the end of the answer (an empty read that did not
     * wait is no close by the server).
     */
    public function test_aDrippingPlainServer_aReadAtTheLastMicrosecond_isATimeout_notTheEnd(): void
    {
        $url = RawHttpFixtureServer::baseUrl() . '/drip';
        $decision = new GuardDecision(true, '127.0.0.1', null, '127.0.0.1', RawHttpFixtureServer::port(), 'http', ['127.0.0.1']);
        $clock = self::clockStandingStillBeforeTheDeadline(0.45, 3000, $left);
        $start = microtime(true);
        $r = self::transport($clock)->fetch($url, $decision, false, null, false, 3000, 3000, Prober::MAX_BODY);
        $elapsed = microtime(true) - $start;
        $this->assertTheClockStoodStillJustBeforeTheDeadline($left);
        $this->assertSame([null, Outcome::TIMEOUT], [$r->status, $r->error]);
        $this->assertLessThan(3.0, $elapsed);
    }

    /**
     * A read that moved nothing and ended after the check's deadline is a timeout, whatever PHP's own flag says: here
     * the server's close, which comes when the time is already up.
     */
    public function test_anEmptyRead_afterTheDeadline_isATimeout(): void
    {
        $url = RawHttpFixtureServer::baseUrl() . '/close-late';
        $decision = new GuardDecision(true, '127.0.0.1', null, '127.0.0.1', RawHttpFixtureServer::port(), 'http', ['127.0.0.1']);
        $r = self::transport(self::clockJumpingPastTheDeadline(0.3, 3000))->fetch($url, $decision, false, null, false, 3000, 3000, Prober::MAX_BODY);
        $this->assertSame([null, Outcome::TIMEOUT], [$r->status, $r->error]);
        $r = self::transport()->fetch($url, $decision, false, null, false, 3000, 3000, Prober::MAX_BODY);
        $this->assertSame([null, Outcome::PROTOCOL], [$r->status, $r->error], 'with the time left: closed early (curl\'s 18)');
    }
}
