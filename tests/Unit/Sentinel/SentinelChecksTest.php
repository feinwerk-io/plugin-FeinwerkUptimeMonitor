<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Sentinel;

require_once __DIR__ . '/SentinelStubs.php';
SentinelStubs::load();

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkSentinel\Check\CheckContext;
use Piwik\Plugins\FeinwerkSentinel\Check\CheckResult;
use Piwik\Plugins\FeinwerkSentinel\Check\Severity;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel\CertificateExpiry;
use Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel\Hints;
use Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel\MatomoUnreachable;
use Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel\SiteUnreachable;
use Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel\SlowTracker;
use Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel\StateCache;
use Piwik\Plugins\FeinwerkUptimeMonitor\Sentinel\UptimeCheck;

/**
 * U01 to U04 and the hint, against copies of Sentinel 5.0.0's check interface (tests/Stubs).
 *
 * @group FeinwerkUptimeMonitor
 */
class SentinelChecksTest extends TestCase
{
    private const NOW = '2026-03-14 10:30:00';

    private static function now(): \DateTimeImmutable
    {
        return new \DateTimeImmutable(self::NOW, new \DateTimeZone('UTC'));
    }

    private static function data(array $override = []): array
    {
        $ui = new Target(1, 0, 'ui', Kind::UI, 'https://matomo.example.com/index.php', 'default');
        $tracker = new Target(2, 0, 'tracker', Kind::TRACKER, 'https://matomo.example.com/matomo.php', 'default');
        $web = new Target(3, 1, 'web:1a2b3c4d', Kind::WEB, 'https://www.shop.example/', 'default');
        $ctr = new Target(4, 1, 'ctr:AbC123', Kind::CONTAINER, 'https://matomo.example.com/js/container_AbC123.js', 'default', ['idContainer' => 'AbC123']);

        return $override + [
            'targets' => [0 => [$ui, $tracker], 1 => [$web, $ctr]],
            'states' => [
                1 => ['local' => self::state(Outcome::UP)],
                2 => ['local' => self::state(Outcome::DOWN, Outcome::TIMEOUT)],
                3 => ['local' => self::state(Outcome::DOWN, Outcome::HTTP_STATUS, 503, '2026-03-24')],
                4 => ['local' => self::state(Outcome::NOT_CHECKABLE, Outcome::CONNECT)],
            ],
            'incidents' => [2 => '2026-03-14 08:00:00', 3 => '2026-03-14 10:00:00'],
            'interval' => 3600,
            'certWarningDays' => 14,
            'slowTrackerMs' => 1000,
            'processing' => ['samples' => 40, 'p50' => 1200],
            'endpointMedian' => 35,
            'proActive' => false,
        ];
    }

    private static function state(string $outcome, ?string $error = null, ?int $status = null, ?string $cert = null, string $at = '2026-03-14 10:00:00'): array
    {
        return ['outcome' => $outcome, 'error' => $error, 'note' => null, 'status' => $status, 'ms_total' => 100,
            'cert_not_after' => $cert, 'checked_at' => $at];
    }

    private static function check(string $class, array $data): UptimeCheck
    {
        $cache = new StateCache($data);
        return new $class(static fn(): StateCache => $cache, static fn(string $key): string => $key);
    }

    /**
     * @return array<string, CheckResult>
     */
    private static function results(UptimeCheck $check, int $idSite): array
    {
        $out = [];
        foreach ($check->evaluate(new CheckContext($idSite, self::now())) as $result) {
            $out[$result->subject()] = $result;
        }
        return $out;
    }

    public function test_ids_scopes_andSeverities_areValidForSentinel(): void
    {
        foreach ([MatomoUnreachable::class => ['U01', 'instance'], SiteUnreachable::class => ['U02', 'site'],
            CertificateExpiry::class => ['U03', 'both'], SlowTracker::class => ['U04', 'instance']] as $class => [$id, $scope]) {
            $check = new $class();
            $this->assertSame($id, $check->getId());
            $this->assertMatchesRegularExpression('/^[A-Za-z][A-Za-z0-9_]{0,31}$/', $check->getId());
            $this->assertSame($scope, $check->getScope());
            $this->assertTrue(Severity::isValid($check->getSeverity()));
            $this->assertSame('hourly', $check->getCadence());
            $this->assertSame([], $check->getDefaultParameters());
            $this->assertSame('FeinwerkUptimeMonitor_Check' . $id . 'Name', $check->getNameKey());
        }
    }

    public function test_down_firesWithWindow(): void
    {
        $results = self::results(self::check(MatomoUnreachable::class, self::data()), 0);
        $tracker = $results['tracker'];
        $this->assertSame(CheckResult::FIRING, $tracker->state());
        $this->assertSame('FeinwerkUptimeMonitor_AlarmU01_tracker', $tracker->messageKey());
        $this->assertSame(['2026-03-14 08:00 UTC', 'FeinwerkUptimeMonitor_Cause_timeout'], $tracker->messageParams());
        $this->assertSame('2026-03-14 08:00:00', $tracker->windowFrom()->format('Y-m-d H:i:s'));
        $this->assertSame(self::NOW, $tracker->windowTo()->format('Y-m-d H:i:s'));
    }

    public function test_up_isNormal(): void
    {
        $this->assertSame(CheckResult::NORMAL, self::results(self::check(MatomoUnreachable::class, self::data()), 0)['ui']->state());
    }

    public function test_staleState_isUnknown(): void
    {
        $data = self::data();
        $data['states'][2]['local'] = self::state(Outcome::DOWN, Outcome::TIMEOUT, null, null, '2026-03-14 07:00:00');
        $this->assertSame(CheckResult::UNKNOWN, self::results(self::check(MatomoUnreachable::class, $data), 0)['tracker']->state());
    }

    public function test_notCheckable_isUnknown(): void
    {
        $this->assertSame(CheckResult::UNKNOWN, self::results(self::check(SiteUnreachable::class, self::data()), 1)['ctr:AbC123']->state());
    }

    public function test_siteCheck_namesTheHostAndTheHttpStatus(): void
    {
        $web = self::results(self::check(SiteUnreachable::class, self::data()), 1)['web:1a2b3c4d'];
        $this->assertSame('FeinwerkUptimeMonitor_AlarmU02_web', $web->messageKey());
        $this->assertSame(['www.shop.example', '2026-03-14 10:00 UTC', 'FeinwerkUptimeMonitor_Cause_http_status 503'], $web->messageParams());
        $this->assertLessThanOrEqual(64, strlen($web->subject()));
    }

    public function test_proActive_silencesU01U02(): void
    {
        $data = self::data(['proActive' => true]);
        $this->assertSame([], self::check(MatomoUnreachable::class, $data)->evaluate(new CheckContext(0, self::now())));
        $this->assertSame([], self::check(SiteUnreachable::class, $data)->evaluate(new CheckContext(1, self::now())));
        $this->assertNotSame([], self::check(CertificateExpiry::class, $data)->evaluate(new CheckContext(1, self::now())));
    }

    public function test_cert_warningAndCritical(): void
    {
        $data = self::data();
        $cert = self::results(self::check(CertificateExpiry::class, $data), 1)['web:1a2b3c4d'];
        $this->assertSame(CheckResult::FIRING, $cert->state());
        $this->assertSame(Severity::WARNING, $cert->severity());
        $this->assertSame(['www.shop.example', '2026-03-24', 10], $cert->messageParams());

        $data['states'][3]['local']['cert_not_after'] = '2026-03-16';
        $this->assertSame(Severity::CRITICAL, self::results(self::check(CertificateExpiry::class, $data), 1)['web:1a2b3c4d']->severity());
        $data['states'][3]['local']['cert_not_after'] = '2026-03-01';
        $expired = self::results(self::check(CertificateExpiry::class, $data), 1)['web:1a2b3c4d'];
        $this->assertSame('FeinwerkUptimeMonitor_AlarmU03Expired', $expired->messageKey());
        $data['states'][3]['local']['cert_not_after'] = '2027-01-01';
        $this->assertSame(CheckResult::NORMAL, self::results(self::check(CertificateExpiry::class, $data), 1)['web:1a2b3c4d']->state());
    }

    public function test_cert_ofMatomosHost_isNotRepeatedPerWebsite(): void
    {
        $data = self::data();
        $data['targets'][1][1] = new Target(4, 1, 'ctr:AbC123', Kind::CONTAINER, 'https://matomo.example.com/js/container_AbC123.js',
            'default', ['idContainer' => 'AbC123', 'matomoHost' => 'matomo.example.com']);
        $data['states'][4]['local'] = self::state(Outcome::UP, null, 200, '2026-03-16');
        $this->assertArrayNotHasKey('ctr:AbC123', self::results(self::check(CertificateExpiry::class, $data), 1));
    }

    public function test_slowTracker_usesProcessingWhenEnoughSamples(): void
    {
        $slow = self::check(SlowTracker::class, self::data())->evaluate(new CheckContext(0, self::now()))[0];
        $this->assertSame(CheckResult::FIRING, $slow->state());
        $this->assertSame([1200, 1000], $slow->messageParams());

        $few = self::check(SlowTracker::class, self::data(['processing' => ['samples' => 5, 'p50' => 5000]]))->evaluate(new CheckContext(0, self::now()))[0];
        $this->assertSame(CheckResult::NORMAL, $few->state(), 'falls back to the endpoint median of 35 ms');

        $none = self::check(SlowTracker::class, self::data(['processing' => ['samples' => 0, 'p50' => null], 'endpointMedian' => null]))->evaluate(new CheckContext(0, self::now()))[0];
        $this->assertSame(CheckResult::UNKNOWN, $none->state());
    }

    public function test_hint_textAndMerge(): void
    {
        $this->assertSame([], Hints::hints(null));
        $hints = Hints::hints('2026-03-14 08:05:00');
        $this->assertSame([['key' => 'FeinwerkUptimeMonitor_HintSiteDown', 'params' => ['2026-03-14 08:05 UTC']]], $hints);
        $other = ['key' => 'FeinwerkTrackingSpamScore_SentinelHintAutoBlocks', 'params' => [3]];
        $old = ['key' => 'FeinwerkUptimeMonitor_HintSiteDown', 'params' => ['old']];
        $this->assertSame([$other, $hints[0]], Hints::merge([$other, $old], $hints));
    }
}
