<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Check;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;

class TargetTest extends TestCase
{
    /** Matomo's own addresses may be the server's loopback; addresses a website admin set never are (review L8 #7, #8). */
    public function test_instanceAddress_matomosTargetsAndDefaultContainers(): void
    {
        $this->assertTrue((new Target(1, 0, 'ui', Kind::UI, 'http://m/', 'default'))->isInstanceAddress());
        $this->assertTrue((new Target(2, 0, 'tracker', Kind::TRACKER, 'http://m/x.php', 'manual'))->isInstanceAddress(), 'set by a super user');
        $this->assertTrue((new Target(3, 4, 'ctr:A', Kind::CONTAINER, 'http://m/js/container_A.js', 'default'))->isInstanceAddress());
        $this->assertFalse((new Target(4, 4, 'ctr:A', Kind::CONTAINER, 'http://127.0.0.1/c.js', 'manual'))->isInstanceAddress());
        $this->assertFalse((new Target(5, 4, 'ctr:A', Kind::CONTAINER, 'http://shop/c.js', 'detected'))->isInstanceAddress());
        $this->assertFalse((new Target(6, 4, 'web:x', Kind::WEB, 'http://shop/', 'default'))->isInstanceAddress());
    }

    public function test_withExtra_keepsEverythingElse(): void
    {
        $target = new Target(7, 4, 'ctr:A', Kind::CONTAINER, 'http://m/c.js', 'detected', ['idContainer' => 'A', 'revision' => 2], '2026-03-01 00:00:00', true, '2026-03-02 00:00:00');
        $fresh = $target->withExtra(['revision' => 3] + $target->extra);
        $this->assertSame(['revision' => 3, 'idContainer' => 'A'], $fresh->extra);
        $this->assertSame([7, 4, 'ctr:A', 'detected', '2026-03-01 00:00:00', '2026-03-02 00:00:00'],
            [$fresh->id, $fresh->idSite, $fresh->key, $fresh->urlSource, $fresh->firstUpAt, $fresh->lastCheckedAt]);
        $this->assertSame(2, $target->extra['revision'], 'the original is unchanged');
    }
}
