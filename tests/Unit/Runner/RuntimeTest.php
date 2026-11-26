<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Runner;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Capabilities;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\Runtime;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\DisabledFunctions;

/**
 * The retry pause and the time limit of a check run on hosts that disable sleep, ini_get or set_time_limit: a call
 * to a disabled function would throw before the run stores its results.
 *
 * @group FeinwerkUptimeMonitor
 */
class RuntimeTest extends TestCase
{
    private static function without(array $disabled): Capabilities
    {
        return new Capabilities(DisabledFunctions::except($disabled));
    }

    public function test_pause_withoutSleep_takesUsleep(): void
    {
        $start = microtime(true);
        Runtime::pause(self::without(['sleep']), 1);
        $this->assertGreaterThanOrEqual(0.9, microtime(true) - $start);
    }

    public function test_pause_withoutSleepAndUsleep_isNoPause(): void
    {
        $start = microtime(true);
        Runtime::pause(self::without(['sleep', 'usleep']), 2);
        $this->assertLessThan(0.5, microtime(true) - $start);
    }

    /**
     * Like Matomo's SettingsServer::setMaxExecutionTime: only what the host has. A lower limit is raised, none (0) or
     * a higher one stays; without ini_get the limit is unknown and stays (setting one could cap a console run).
     */
    public function test_raiseTimeLimit_onlyWithWhatTheHostHas(): void
    {
        $set = [];
        $setter = static function (int $seconds) use (&$set): void {
            $set[] = $seconds;
        };
        $read = static fn(): string => '30';
        $this->assertTrue(Runtime::raiseTimeLimit(self::without([]), 180, $read, $setter));
        $this->assertSame([180], $set);
        $this->assertFalse(Runtime::raiseTimeLimit(self::without([]), 180, static fn(): string => '0', $setter), 'no limit stays none');
        $this->assertFalse(Runtime::raiseTimeLimit(self::without([]), 180, static fn(): string => '300', $setter), 'a higher one stays');
        $this->assertFalse(Runtime::raiseTimeLimit(self::without(['set_time_limit']), 180, $read, $setter));
        $this->assertFalse(Runtime::raiseTimeLimit(self::without(['ini_get']), 180, static function (): string {
            throw new \LogicException('ini_get is disabled');
        }, $setter));
        $this->assertSame([180], $set, 'set only once');
    }
}
