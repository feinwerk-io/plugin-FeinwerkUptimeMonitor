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

    public function test_withCurlExecDisabledToo_everyCheckIsNotCheckable_neverAnError(): void
    {
        $answer = DisabledFunctions::runChild(array_merge(DisabledFunctions::SHARED_HOST, ['curl_exec']), ['probe', self::$base]);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $this->assertCount(4, $answer['results']);
        foreach ($answer['results'] as $id => $r) {
            $this->assertSame([null, Outcome::PHP_DISABLED], [$r['status'], $r['error']], "target $id");
        }
    }

    public function test_withoutCurl_everyCheckIsNotCheckable_neverAnError(): void
    {
        $answer = DisabledFunctions::runChild(['curl_init'], ['probe', self::$base]);
        $this->assertTrue($answer['ok'], $answer['error'] ?? '');
        $this->assertSame([Outcome::PHP_DISABLED], array_values(array_unique(array_column($answer['results'], 'error'))));
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
