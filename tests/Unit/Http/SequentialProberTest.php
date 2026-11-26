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
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Prober;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\UrlGuard;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\DisabledFunctions;

/**
 * Every prober test again on the way a customer's host needs: curl_multi_exec disabled, so one curl_exec after the
 * other, with the same options, pinning, body cap, redirects and timings. Plus: both ways give the same results, and
 * without any way every check is not checkable instead of an error.
 *
 * @group FeinwerkUptimeMonitor
 */
class SequentialProberTest extends ProberTest
{
    private static function sharedHost(array $alsoDisabled = []): Capabilities
    {
        return new Capabilities(DisabledFunctions::except(array_merge(DisabledFunctions::SHARED_HOST, $alsoDisabled)));
    }

    protected static function prober(?UrlGuard $guard = null, int $connectMs = 2000, int $totalMs = 5000, int $parallel = 8, array $proxy = []): Prober
    {
        return new Prober($guard ?? new AddressGuard(true), $proxy, 'FeinwerkUptimeMonitor-Test', $connectMs, $totalMs, $parallel, null, self::sharedHost());
    }

    public function test_usesTheSequentialWay(): void
    {
        $this->assertSame(Capabilities::SEQUENTIAL, static::prober()->transport());
        $this->assertSame(Capabilities::SEQUENTIAL, static::prober(null, 2000, 5000, 8, self::UNREACHABLE_PROXY)->transport(), 'with a proxy too');
        $this->assertSame(Capabilities::MULTI, parent::prober()->transport());
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

    /** One after the other takes longer: a transfer starts only before the run's deadline, the rest is not measured. */
    public function test_aTransferStartsOnlyBeforeTheDeadline(): void
    {
        $targets = [];
        for ($i = 1; $i <= 3; $i++) {
            $targets[] = self::target($i, Kind::WEB, '/slow?s=1&n=' . $i);
        }
        $responses = static::prober()->probeAll($targets, microtime(true) + 1.5);
        $this->assertSame([1, 2], array_keys($responses), 'the third would start after the deadline');
        $this->assertSame([200, 200], [$responses[1]->status, $responses[2]->status]);
    }

    public function test_theSameResultsAsTheMultiWay(): void
    {
        $targets = [
            self::target(1, Kind::WEB, '/ok'),
            self::target(2, Kind::WEB, '/r1'),
            self::target(3, Kind::TRACKER, '/r1'),
            self::target(4, Kind::UI, '/loop'),
            self::target(5, Kind::WEB, '/big'),
            self::target(6, Kind::WEB, '/bytes?n=' . Prober::MAX_BODY),
            self::target(7, Kind::WEB, '/bytes?n=' . (Prober::MAX_BODY + 1)),
            self::target(8, Kind::CONTAINER, '/bytes?n=' . (Prober::MAX_BODY_LARGE + 1)),
            self::target(9, Kind::WEB, '/nothing-here'),
            self::target(10, Kind::WEB, '/db-down'),
            self::target(11, Kind::WEB, '/basic'),
            self::target(12, Kind::TRACKER, '/matomo.php'),
            self::target(13, Kind::JS, '/matomo.js'),
            self::target(14, Kind::CONTAINER, '/container'),
            new Target(15, 0, 'web15', Kind::WEB, 'http://127.0.0.1:1/', 'default'),
        ];
        $shape = static function (array $responses): array {
            $out = [];
            foreach ($responses as $id => $r) {
                $out[$id] = [$r->status, $r->error, $r->redirects, $r->finalUrl, $r->capped, strlen($r->body), md5($r->body),
                    $r->certNotAfter, array_keys($r->timings)];
            }
            return $out;
        };
        // the fixture server speaks plain HTTP: the certificate date is null on both ways
        $multi = $shape(parent::prober(null, 1000, 3000)->probeAll($targets, microtime(true) + 60));
        $sequential = $shape(static::prober(null, 1000, 3000)->probeAll($targets, microtime(true) + 60));
        $this->assertCount(15, $multi);
        $this->assertSame($multi, $sequential);
        $this->assertSame(Outcome::CONNECT, $sequential[15][1]);
    }

    public function test_noWayToSendRequests_everyTargetIsNotCheckable_neverAnError(): void
    {
        $prober = new Prober(new AddressGuard(true), [], 'ua', 2000, 5000, 8, null, self::sharedHost(['curl_exec']));
        $this->assertNull($prober->transport());
        $this->assertSame(['curl_exec', 'curl_multi_exec'], $prober->missingFunctions());

        $responses = $prober->probeAll([self::target(1, Kind::WEB, '/ok'), self::target(2, Kind::TRACKER, '/matomo.php')], microtime(true) + 30);
        $this->assertSame([1, 2], array_keys($responses));
        foreach ($responses as $r) {
            $this->assertSame([null, Outcome::PHP_DISABLED, ''], [$r->status, $r->error, $r->body]);
        }
        $this->assertSame([], $prober->probeAll([self::target(1, Kind::WEB, '/ok')], microtime(true) - 1), 'the deadline still counts');
    }

    public function test_theCustomersHost_needsNothingMore(): void
    {
        $this->assertSame([], static::prober()->missingFunctions());
    }
}
