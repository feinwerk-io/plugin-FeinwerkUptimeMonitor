<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Input;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Input\InvalidParameter;
use Piwik\Plugins\FeinwerkUptimeMonitor\Input\Params;

/**
 * @group FeinwerkUptimeMonitor
 */
class ParamsTest extends TestCase
{
    public function test_oneOf_trimsAndNamesTheAllowedValues(): void
    {
        $this->assertSame('local', Params::oneOf('source', ' local ', ['all', 'local', 'external']));
        try {
            Params::oneOf('source', 'remote', ['all', 'local', 'external']);
            $this->fail('no exception');
        } catch (InvalidParameter $e) {
            $this->assertSame('source', $e->parameter);
            $this->assertSame('remote', $e->value);
            $this->assertSame(['all', 'local', 'external'], $e->allowed);
        }
    }

    public function test_wholeNumber_range(): void
    {
        $this->assertSame(5, Params::wholeNumber('limit', ' 5 ', 1, 1000));
        foreach (['0', '1001', '5.5', 'x', ''] as $bad) {
            try {
                Params::wholeNumber('limit', $bad, 1, 1000);
                $this->fail("no exception for '$bad'");
            } catch (InvalidParameter $e) {
                $this->assertSame(1, $e->min);
                $this->assertSame(1000, $e->max);
            }
        }
    }

    public function test_flag(): void
    {
        $this->assertTrue(Params::flag('apply', '1'));
        $this->assertFalse(Params::flag('apply', 0));
        $this->expectException(InvalidParameter::class);
        Params::flag('apply', 'yes');
    }

    public function test_bareUrl_refusesParameters(): void
    {
        $this->assertSame('https://m.example/matomo.php', Params::bareUrl('url', 'https://m.example/matomo.php'));
        foreach (['https://m.example/matomo.php?idsite=1&rec=1', 'https://m.example/matomo.js#x'] as $bad) {
            try {
                Params::bareUrl('url', $bad);
                $this->fail("no exception for '$bad'");
            } catch (InvalidParameter $e) {
                $this->assertSame('url', $e->parameter);
            }
        }
    }

    public function test_url(): void
    {
        $this->assertSame('https://www.shop.example/matomo.php', Params::url('url', ' https://www.shop.example/matomo.php '));
        foreach (['ftp://x.example/', 'www.shop.example', 'https://u:p@x.example/', 'https://x.example/a b', 'https:///x'] as $bad) {
            try {
                Params::url('url', $bad);
                $this->fail("no exception for '$bad'");
            } catch (InvalidParameter $e) {
                $this->assertSame('url', $e->parameter);
            }
        }
    }
}
