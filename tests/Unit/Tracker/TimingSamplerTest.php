<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Tracker;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Tracker\TimingSampler;

/**
 * @group FeinwerkUptimeMonitor
 */
class TimingSamplerTest extends TestCase
{
    private array $inserts = [];
    private int $bodyReads = 0;

    private function sampler(int $rate, int $draw = 1, ?\Closure $insert = null): TimingSampler
    {
        return new TimingSampler(
            $rate,
            $insert ?? function (string $at, int $ms, bool $bulk): void {
                $this->inserts[] = [$at, $ms, $bulk];
            },
            static fn(int $min, int $max): int => $draw
        );
    }

    private function body(string $body): \Closure
    {
        return function () use ($body): string {
            $this->bodyReads++;
            return $body;
        };
    }

    private static function server(float $ago = 0.25): array
    {
        return ['REQUEST_TIME_FLOAT' => microtime(true) - $ago];
    }

    public function test_trackingRequest_isSampledWithItsDuration(): void
    {
        $this->sampler(100)->onTrackerEnd(self::server(0.25), ['idsite' => '1', 'rec' => '1'], [], $this->body(''));
        $this->assertCount(1, $this->inserts);
        [$at, $ms, $bulk] = $this->inserts[0];
        $this->assertMatchesRegularExpression('/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/', $at);
        $this->assertGreaterThanOrEqual(240, $ms);
        $this->assertLessThan(2000, $ms);
        $this->assertFalse($bulk);
    }

    public function test_bareGet_isNeverSampled(): void
    {
        $this->sampler(1)->onTrackerEnd(self::server(), [], [], $this->body(''));
        $this->assertSame([], $this->inserts);
    }

    public function test_rateZero_isOff(): void
    {
        $this->sampler(0)->onTrackerEnd(self::server(), ['idsite' => '1'], [], $this->body(''));
        $this->assertSame([], $this->inserts);
        $this->assertSame(0, $this->bodyReads);
    }

    public function test_oneInHundred_withRandomStub(): void
    {
        $this->sampler(100, 1)->onTrackerEnd(self::server(), ['idsite' => '1'], [], $this->body(''));
        $this->sampler(100, 2)->onTrackerEnd(self::server(), ['idsite' => '1'], [], $this->body(''));
        $this->sampler(100, 100)->onTrackerEnd(self::server(), ['idsite' => '1'], [], $this->body(''));
        $this->assertCount(1, $this->inserts);
    }

    public function test_miss_callsNothingElse(): void
    {
        $this->sampler(100, 2)->onTrackerEnd(self::server(), [], [], $this->body('{"requests":["?idsite=1"]}'));
        $this->assertSame([], $this->inserts);
        $this->assertSame(0, $this->bodyReads, 'the request body is only read on a hit');
    }

    public function test_bulkBody_isMarkedBulk(): void
    {
        $this->sampler(1)->onTrackerEnd(self::server(), [], [], $this->body('{"requests":["?idsite=1&rec=1","?idsite=1&rec=1"]}'));
        $this->assertCount(1, $this->inserts);
        $this->assertTrue($this->inserts[0][2]);
    }

    public function test_formEncodedBulk_isMarkedBulk(): void
    {
        // matomo.js: a JSON body with form encoding, which PHP also parses into $_POST
        $this->sampler(1)->onTrackerEnd(self::server(), [], ['{"requests":' => ''], $this->body('{"requests":["?idsite=1&rec=1"]}'));
        $this->assertCount(1, $this->inserts);
        $this->assertTrue($this->inserts[0][2]);
    }

    public function test_beaconBody_counts(): void
    {
        $this->sampler(1)->onTrackerEnd(self::server(), [], [], $this->body('idsite=1&rec=1&action_name=x'));
        $this->assertCount(1, $this->inserts);
        $this->assertFalse($this->inserts[0][2]);
    }

    public function test_noRequestTime_isSkipped(): void
    {
        $this->sampler(1)->onTrackerEnd([], ['idsite' => '1'], [], $this->body(''));
        $this->assertSame([], $this->inserts);
    }

    public function test_failingInsert_isSwallowed(): void
    {
        $sampler = $this->sampler(1, 1, static function (): void {
            throw new \RuntimeException('table missing');
        });
        $sampler->onTrackerEnd(self::server(), ['idsite' => '1'], [], $this->body(''));
        $this->addToAssertionCount(1); // no exception reached the tracker
    }
}
