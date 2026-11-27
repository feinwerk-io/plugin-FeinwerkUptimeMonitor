<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Http;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Capabilities;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\DisabledFunctions;

/**
 * Which way the prober can send its requests with the PHP functions there are.
 *
 * @group FeinwerkUptimeMonitor
 */
class CapabilitiesTest extends TestCase
{
    private static function without(array $disabled): Capabilities
    {
        return new Capabilities(DisabledFunctions::except($disabled));
    }

    /**
     * UI review of 5.4.0, L7: the curl functions are missing because PHP's curl extension is not installed (the hint
     * then names the extension), not because php.ini disables them (the hint names disable_functions).
     */
    public function test_curlMissing_onlyWithoutTheExtension(): void
    {
        $curl = ['curl_init', 'curl_setopt_array', 'curl_getinfo', 'curl_exec', 'curl_errno', 'curl_multi_init', 'curl_multi_exec'];
        $this->assertFalse((new Capabilities())->curlMissing(), 'here: installed');
        $this->assertFalse((new Capabilities(DisabledFunctions::except($curl), null, null, static fn(string $e): bool => true))->curlMissing(),
            'installed, its functions disabled in php.ini');
        $this->assertTrue((new Capabilities(DisabledFunctions::except($curl), null, null, static fn(string $e): bool => $e !== 'curl'))->curlMissing(),
            'not installed');
        $this->assertFalse((new Capabilities(null, null, null, static fn(string $e): bool => $e !== 'curl'))->curlMissing(),
            'the functions are there (a polyfill): nothing missing');
    }

    /**
     * Matomo's [General] enable_internet_features (Peter's 2a): the checks may send requests unless the runner says
     * they may not; the PHP functions stay what they are.
     */
    public function test_internet_allowedByDefault_offOnlyWhenSaid(): void
    {
        $this->assertTrue((new Capabilities())->internetAllowed(), 'no Matomo here: allowed');
        $off = self::without([])->withInternet(false);
        $this->assertFalse($off->internetAllowed());
        $this->assertSame(Capabilities::MULTI, $off->transport(), 'the functions are still there');
        $this->assertTrue(self::without([])->withInternet(true)->internetAllowed());
        $original = new Capabilities();
        $original->withInternet(false);
        $this->assertTrue($original->internetAllowed(), 'a copy: the shared instance stays as it was');
    }

    public function test_everythingThere_isMulti_andNothingMissing(): void
    {
        $this->assertSame(Capabilities::MULTI, self::without([])->transport());
        $this->assertSame([], self::without([])->missingForTransport());
    }

    public function test_theCustomersHost_isSequential(): void
    {
        $capabilities = self::without(DisabledFunctions::SHARED_HOST);
        $this->assertSame(Capabilities::SEQUENTIAL, $capabilities->transport());
        $this->assertSame([], $capabilities->missingForTransport(), 'the checks run: nothing to report');
    }

    /** Never a half multi path: each function the multi loop calls must be there, else one transfer after the other. */
    public function test_anyMultiFunctionMissing_isSequential(): void
    {
        foreach (['curl_multi_init', 'curl_multi_add_handle', 'curl_multi_exec', 'curl_multi_select', 'curl_multi_info_read',
            'curl_multi_remove_handle', 'curl_multi_close'] as $function) {
            $this->assertSame(Capabilities::SEQUENTIAL, self::without([$function])->transport(), $function);
        }
    }

    /**
     * Robustness part 2: curl_exec disabled too, or no curl at all (the extension missing, or every curl function in
     * disable_functions): the checks go out through PHP's own streams, and nothing is missing to report.
     */
    public function test_withoutAnyCurlWay_theStreamsCarryTheChecks(): void
    {
        foreach ([array_merge(DisabledFunctions::SHARED_HOST, ['curl_exec']), ['curl_init'], ['curl_setopt_array'], ['curl_getinfo'],
            ['curl_errno', 'curl_multi_select']] as $disabled) {
            $capabilities = self::without($disabled);
            $this->assertSame(Capabilities::STREAM, $capabilities->transport(), implode(',', $disabled));
            $this->assertSame([], $capabilities->missingForTransport(), implode(',', $disabled) . ': the checks run');
        }
    }

    /** curl first: the streams only where neither curl way works */
    public function test_curl_staysFirst(): void
    {
        $this->assertSame(['curl_multi', 'curl_exec', 'streams', 'none'], [self::without([])->transportName(),
            self::without(['curl_multi_exec'])->transportName(), self::without(['curl_init'])->transportName(),
            self::without(['curl_init', 'stream_select'])->transportName()], "the API's names");
        $this->assertSame(Capabilities::MULTI, self::without(['stream_socket_client', 'stream_select'])->transport());
        $this->assertSame(Capabilities::SEQUENTIAL, self::without(['curl_multi_exec', 'stream_socket_client'])->transport());
    }

    public function test_noWayAtAll_isNoTransport_namingEveryWaysMissingFunctions(): void
    {
        $capabilities = self::without(array_merge(DisabledFunctions::SHARED_HOST, ['curl_exec', 'stream_socket_client']));
        $this->assertNull($capabilities->transport());
        $this->assertSame(['curl_exec', 'curl_multi_exec', 'stream_socket_client'], $capabilities->missingForTransport());
    }

    /** Never a half stream way: each function it calls must be there. */
    public function test_anyStreamFunctionMissing_withoutCurl_isNoTransport(): void
    {
        foreach (['stream_socket_client', 'stream_context_create', 'stream_set_blocking', 'stream_select', 'stream_set_timeout',
            'stream_get_meta_data', 'restore_error_handler'] as $function) {
            $capabilities = self::without(['curl_init', $function]);
            $this->assertNull($capabilities->transport(), $function);
            $this->assertSame(['curl_init', $function], $capabilities->missingForTransport(), $function);
        }
    }

    /**
     * HTTPS through the streams needs PHP's openssl functions; without them the streams still check http addresses, and
     * the functions are named (an https address is not checkable, note php_disabled).
     */
    public function test_streams_withoutTheTlsFunctions_checkHttpOnly_namingThem(): void
    {
        $this->assertTrue(self::without(['curl_init'])->canStreamTls());
        foreach (['stream_socket_enable_crypto', 'stream_context_get_params', 'openssl_x509_parse'] as $function) {
            $capabilities = self::without(['curl_init', $function]);
            $this->assertSame(Capabilities::STREAM, $capabilities->transport(), $function);
            $this->assertFalse($capabilities->canStreamTls(), $function);
            $this->assertSame([$function], $capabilities->missingForTransport(), $function);
        }
        $this->assertSame([], self::without(['openssl_x509_parse'])->missingForTransport(), 'curl does TLS itself');
        $this->assertSame(['curl_init', 'stream_select', 'stream_socket_enable_crypto'],
            self::without(['curl_init', 'stream_select', 'stream_socket_enable_crypto'])->missingForTransport(), 'no way: every one');
    }

    /**
     * Every stream, openssl, zlib or socket function the stream transport calls is checked: taking any one of them away
     * (on a host without curl) takes away the stream way, its https or its decoding, so it is never called missing.
     */
    public function test_everyFunctionTheStreamTransportCalls_isChecked(): void
    {
        $called = [];
        $tokens = \PhpToken::tokenize((string) file_get_contents(dirname(__DIR__, 3) . '/Http/StreamTransport.php'));
        foreach ($tokens as $i => $token) {
            if (!$token->is(T_STRING) || !preg_match('/^(stream_|openssl_|inflate_|deflate_|gz|zlib_|fsockopen|socket_|pfsockopen)/', $token->text)) {
                continue;
            }
            $next = $tokens[$i + 1] ?? null;
            $previous = null;
            for ($j = $i - 1; $j >= 0 && $tokens[$j]->isIgnorable(); $j--) {
            }
            $previous = $tokens[$j] ?? null;
            if ($next !== null && $next->text === '(' && !($previous !== null && in_array($previous->text, ['->', '::', 'function', '?->'], true))) {
                $called[$token->text] = true;
            }
        }
        $this->assertGreaterThanOrEqual(8, count($called), 'the scan finds the calls: ' . implode(', ', array_keys($called)));
        foreach (array_keys($called) as $function) {
            $capabilities = self::without(array_merge(DisabledFunctions::CURL, [$function]));
            $this->assertTrue($capabilities->transport() !== Capabilities::STREAM || !$capabilities->canStreamTls() || !$capabilities->canInflate(),
                "$function is called by StreamTransport but not checked");
        }
    }

    /** gzip and deflate answers are asked for only where zlib's incremental inflate is there */
    public function test_inflate_onlyWithBothFunctions(): void
    {
        $this->assertTrue(self::without([])->canInflate());
        $this->assertFalse(self::without(['inflate_init'])->canInflate());
        $this->assertFalse(self::without(['inflate_add'])->canInflate());
    }

    public function test_default_isPhpsOwnFunctionExists(): void
    {
        $this->assertTrue((new Capabilities())->has('strlen'));
        $this->assertFalse((new Capabilities())->has('fwum_no_such_function'));
    }
}
