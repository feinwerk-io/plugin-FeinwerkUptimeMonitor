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
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Prober;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\DisabledFunctions;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\HttpFixtureServer;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\TlsFixtureServer;

/**
 * The plugin's code in a PHP whose php.ini disables functions (-d disable_functions), with PHP's own function_exists():
 * the regression of a customer's host, where every API call that checked ended in "Call to undefined function
 * ...\Http\curl_multi_exec()".
 *
 * @group FeinwerkUptimeMonitor
 */
class DisabledFunctionsTest extends TestCase
{
    private static string $base;

    public static function setUpBeforeClass(): void
    {
        self::$base = HttpFixtureServer::start();
    }

    public static function tearDownAfterClass(): void
    {
        HttpFixtureServer::stop();
        TlsFixtureServer::stop();
    }

    public function test_onTheCustomersHost_checksRunThroughCurlExec(): void
    {
        $answer = DisabledFunctions::runChild(DisabledFunctions::SHARED_HOST, ['probe', self::$base]);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $r = $answer['results'];
        $this->assertSame([200, null, 2], [$r[1]['status'], $r[1]['error'], $r[1]['length']]);
        $this->assertSame([200, 2, self::$base . '/ok'], [$r[2]['status'], $r[2]['redirects'], $r[2]['finalUrl']], 'redirects followed');
        $this->assertSame([200, true, Prober::MAX_BODY], [$r[3]['status'], $r[3]['capped'], $r[3]['length']], 'the body cap holds');
        $this->assertSame(200, $r[4]['status']);
    }

    /** @param array<int, array> $r the child's results of the probe mode */
    private function assertTheProbesRan(array $r, string $way): void
    {
        $this->assertSame([200, null, 2], [$r[1]['status'], $r[1]['error'], $r[1]['length']], $way);
        $this->assertSame([200, 2, self::$base . '/ok'], [$r[2]['status'], $r[2]['redirects'], $r[2]['finalUrl']], "$way: redirects followed");
        $this->assertSame([200, true, Prober::MAX_BODY], [$r[3]['status'], $r[3]['capped'], $r[3]['length']], "$way: the body cap holds");
        $this->assertSame(200, $r[4]['status'], $way);
    }

    /** Robustness part 2: curl_exec disabled too, the checks go out through PHP's streams. */
    public function test_withCurlExecDisabledToo_checksRunThroughTheStreams(): void
    {
        $answer = DisabledFunctions::runChild(array_merge(DisabledFunctions::SHARED_HOST, ['curl_exec']), ['probe', self::$base]);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $this->assertTheProbesRan($answer['results'], 'curl_exec and curl_multi_exec disabled');
    }

    /** Every curl function disabled: the same checks through the streams, https too, verified with the given CA file. */
    public function test_withEveryCurlFunctionDisabled_checksRunThroughTheStreams_httpsToo(): void
    {
        $answer = DisabledFunctions::runChild(DisabledFunctions::CURL, ['probe', self::$base]);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $this->assertTheProbesRan($answer['results'], 'no curl');

        $skip = TlsFixtureServer::start();
        if ($skip !== null) {
            $this->markTestSkipped($skip);
        }
        // "multi" asks for every function: this PHP's own function_exists() leaves the streams
        $answer = DisabledFunctions::runChild(DisabledFunctions::CURL, ['tls', TlsFixtureServer::url('internal'), TlsFixtureServer::internalCa(), '1', 'multi']);
        $this->assertSame([true, ['status' => 200, 'error' => null, 'body' => 'ok']], [$answer['ok'], $answer['results'] ?? $answer['error']]);
        $answer = DisabledFunctions::runChild(DisabledFunctions::CURL, ['tls', TlsFixtureServer::url('internal'), TlsFixtureServer::otherCa(), '0', 'multi']);
        $this->assertSame(Outcome::TLS, $answer['results']['error'], 'never without verification');
    }

    /** A PHP without the curl extension at all (php -n: only what is compiled in): the checks go out through the streams. */
    public function test_aPhpWithoutTheCurlExtension_checksThroughTheStreams(): void
    {
        $answer = DisabledFunctions::runChild([], ['probe', self::$base], [], true);
        if (!$answer['ok'] && strpos((string) ($answer['error'] ?? ''), 'curl') === false) {
            $this->fail((string) $answer['error']);
        }
        $check = DisabledFunctions::runChild([], ['functions', 'curl_init'], [], true);
        if (($check['results']['curl_init'] ?? true) === true) {
            $this->markTestSkipped('this PHP has curl compiled in: covered by the disable_functions test');
        }
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $this->assertTheProbesRan($answer['results'], 'php -n');
    }

    /** Without curl and without the stream functions: not checkable, never an error, every way's missing ones named. */
    public function test_withoutCurlAndTheStreams_everyCheckIsNotCheckable_neverAnError(): void
    {
        foreach ([array_merge(DisabledFunctions::SHARED_HOST, ['curl_exec', 'stream_socket_client']), ['curl_init', 'stream_select']] as $disabled) {
            $answer = DisabledFunctions::runChild($disabled, ['probe', self::$base]);
            $this->assertTrue($answer['ok'], $answer['error'] ?? '');
            $this->assertCount(4, $answer['results']);
            foreach ($answer['results'] as $id => $r) {
                $this->assertSame([null, Outcome::PHP_DISABLED], [$r['status'], $r['error']], implode(',', $disabled) . ": target $id");
            }
        }
    }

    /**
     * Without restore_error_handler (Matomo itself never calls it) the streams are no way: every check is not checkable,
     * the function is named, and no \Error ends the run with PHP's warnings swallowed for the rest of the process.
     */
    public function test_withoutRestoreErrorHandler_theStreamsAreNoWay_neverAnError(): void
    {
        $answer = DisabledFunctions::runChild(array_merge(DisabledFunctions::SHARED_HOST, ['curl_exec', 'usleep', 'restore_error_handler']),
            ['probe', self::$base]);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $this->assertCount(4, $answer['results']);
        foreach ($answer['results'] as $id => $r) {
            $this->assertSame([null, Outcome::PHP_DISABLED], [$r['status'], $r['error']], "target $id");
        }
    }

    public function test_withoutTheLookups_namesAreNotCheckable_addressesStillWork(): void
    {
        $answer = DisabledFunctions::runChild(['gethostbynamel', 'dns_get_record'], ['probe', self::$base, 'names']);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $r = $answer['results'];
        $this->assertSame([200, 200, 200, 200], [$r[1]['status'], $r[2]['status'], $r[3]['status'], $r[4]['status']]);
        $this->assertSame([null, Outcome::PHP_DISABLED], [$r[5]['status'], $r[5]['error']], 'localhost is a name');
    }

    public function test_withoutDnsGetRecord_namesResolveIpv4Only(): void
    {
        $answer = DisabledFunctions::runChild(['dns_get_record'], ['probe', self::$base, 'names']);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $this->assertSame(200, $answer['results'][5]['status']);
    }

    public function test_withoutTheAddressFunctions_nothingIsCheckable_neverAnError(): void
    {
        $answer = DisabledFunctions::runChild(['inet_pton', 'inet_ntop'], ['probe', self::$base]);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $this->assertSame([Outcome::PHP_DISABLED], array_values(array_unique(array_column($answer['results'], 'error'))));
    }

    public function test_certificateHandshake_withoutStreamSocketClient_isNoDate_neverAnError(): void
    {
        $answer = DisabledFunctions::runChild(['stream_socket_client'], ['handshake', '127.0.0.1', (string) HttpFixtureServer::port()]);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $this->assertNull($answer['results']);
    }

    /** The processing time of tracking requests: random_int disabled must never break a tracking request. */
    public function test_trackingSample_withoutRandomInt_stillSamples_neverAnError(): void
    {
        $answer = DisabledFunctions::runChild(['random_int'], ['sample']);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $this->assertSame(1, $answer['results']);
        $answer = DisabledFunctions::runChild(['random_int', 'mt_rand'], ['sample']);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $this->assertSame(0, $answer['results'], 'no random number: no sample');
    }

    public function test_retryPause_withoutSleep_neverAnError(): void
    {
        $answer = DisabledFunctions::runChild(['sleep'], ['pause']);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $this->assertGreaterThanOrEqual(0.9, $answer['results'], 'usleep instead');
    }

    /** Audit D3: without idn_to_ascii a website address with umlauts is still checked, in punycode. */
    public function test_internationalisedHost_withoutIdnToAscii_isCheckedInPunycode(): void
    {
        $answer = DisabledFunctions::runChild(['idn_to_ascii'], ['idn', 'https://müller.de/']);
        $this->assertTrue($answer['ok'], (string) ($answer['error'] ?? ''));
        $this->assertSame(['allowed' => true, 'reason' => null, 'host' => 'xn--mller-kva.de', 'refusedWithoutLookup' => false], $answer['results']);
    }

    public function test_timeLimit_withoutSetTimeLimitOrIniGet_neverAnError(): void
    {
        foreach ([['set_time_limit'], ['ini_get']] as $disabled) {
            $answer = DisabledFunctions::runChild($disabled, ['timelimit'], ['max_execution_time' => '30']);
            $this->assertTrue($answer['ok'], $answer['error'] ?? '');
            $this->assertFalse($answer['results'], implode(',', $disabled));
        }
        $answer = DisabledFunctions::runChild([], ['timelimit'], ['max_execution_time' => '30']);
        $this->assertSame([true, true], [$answer['ok'], $answer['results']], 'with both: raised');
    }
}
