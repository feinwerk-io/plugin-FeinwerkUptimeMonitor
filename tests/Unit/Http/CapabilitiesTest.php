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

    public function test_curlExecMissingToo_isNoTransport_namingTheMissingFunctions(): void
    {
        $capabilities = self::without(array_merge(DisabledFunctions::SHARED_HOST, ['curl_exec']));
        $this->assertNull($capabilities->transport());
        $this->assertSame(['curl_exec', 'curl_multi_exec'], $capabilities->missingForTransport());
    }

    public function test_aFunctionBothWaysNeed_isNoTransport(): void
    {
        foreach (['curl_init', 'curl_setopt_array', 'curl_getinfo'] as $function) {
            $capabilities = self::without([$function]);
            $this->assertNull($capabilities->transport(), $function);
            $this->assertSame([$function], $capabilities->missingForTransport(), $function);
        }
        $this->assertSame(Capabilities::MULTI, self::without(['curl_errno'])->transport(), 'only the sequential way reads curl_errno');
        $this->assertNull(self::without(['curl_errno', 'curl_multi_select'])->transport());
    }

    public function test_default_isPhpsOwnFunctionExists(): void
    {
        $this->assertTrue((new Capabilities())->has('strlen'));
        $this->assertFalse((new Capabilities())->has('fwum_no_such_function'));
    }
}
