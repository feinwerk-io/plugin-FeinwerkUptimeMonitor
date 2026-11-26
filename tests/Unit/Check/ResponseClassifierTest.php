<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Check;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\ProbeResponse;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\ResponseClassifier;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Prober;

/**
 * @group FeinwerkUptimeMonitor
 */
class ResponseClassifierTest extends TestCase
{
    private const NOW = '2026-03-14 10:00:00';
    private const TRACKER_PAGE = "This resource is part of Matomo. Keep full control of your data.<br>\n";

    private function classify(string $kind, ?int $status, string $body, ?string $error = null, string $finalUrl = 'https://matomo.example.com/x', array $extra = [], ?string $firstUpAt = '2026-03-01 00:00:00'): CheckResult
    {
        $extra += ['matomoHost' => 'matomo.example.com'];
        $target = new Target(7, $kind === Kind::WEB || $kind === Kind::CONTAINER || $kind === Kind::PROXY ? 1 : 0, $kind, $kind, 'https://matomo.example.com/x', 'default', $extra, $firstUpAt);
        $response = new ProbeResponse($status, $body, $error, $finalUrl, ['dns' => 1, 'connect' => 2, 'tls' => 3, 'ttfb' => 4, 'total' => 5], null, 0);

        return (new ResponseClassifier())->classify($target, $response, self::NOW);
    }

    private function assertResult(CheckResult $result, string $outcome, ?string $error, ?string $note = null): void
    {
        $this->assertSame($outcome, $result->outcome, 'outcome');
        $this->assertSame($error, $result->error, 'error');
        $this->assertSame($note, $result->note, 'note');
    }

    public function test_tracker_bareGetPage_isUp(): void
    {
        $result = $this->classify(Kind::TRACKER, 200, self::TRACKER_PAGE);
        $this->assertResult($result, Outcome::UP, null);
        $this->assertSame(7, $result->idTarget);
        $this->assertSame(self::NOW, $result->checkedAt);
        $this->assertSame(5, $result->timings['total']);
    }

    public function test_tracker_200WithoutMarker_isDownContent(): void
    {
        $this->assertResult($this->classify(Kind::TRACKER, 200, '<html>hosting default page</html>'), Outcome::DOWN, Outcome::CONTENT);
    }

    public function test_tracker_503_isTrackingOff(): void
    {
        $this->assertResult($this->classify(Kind::TRACKER, 503, ''), Outcome::DOWN, Outcome::TRACKING_OFF);
    }

    public function test_tracker_redirect_isDownRedirect(): void
    {
        $this->assertResult($this->classify(Kind::TRACKER, 301, ''), Outcome::DOWN, Outcome::REDIRECT);
    }

    public function test_js_trackerCode_isUp(): void
    {
        $this->assertResult($this->classify(Kind::JS, 200, 'var a;Matomo.getAsyncTracker=function(){}'), Outcome::UP, null);
    }

    public function test_proxy_errorBody_isDown(): void
    {
        $this->assertResult($this->classify(Kind::PROXY, 200, '/* there was an error loading matomo.js */'), Outcome::DOWN, Outcome::CONTENT);
    }

    public function test_proxy_trackerCode_isUp(): void
    {
        $this->assertResult($this->classify(Kind::PROXY, 200, 'x.getAsyncTracker=1'), Outcome::UP, null);
    }

    public function test_proxy_forwardingToMatomosEndpoint_isUp(): void
    {
        // an nginx proxy_pass or a CDN worker on the website's host: Matomo's own page for a bare GET
        $this->assertResult($this->classify(Kind::PROXY, 200, self::TRACKER_PAGE), Outcome::UP, null);
        $this->assertResult($this->classify(Kind::JS, 200, self::TRACKER_PAGE), Outcome::DOWN, Outcome::CONTENT, null);
    }

    public function test_detectedProxy_neverUp_failuresAreNotCheckable(): void
    {
        $target = new Target(7, 1, 'proxy', Kind::PROXY, 'https://shop.example/matomo.php', 'detected', ['matomoHost' => 'm.example']);
        $classifier = new ResponseClassifier();
        foreach ([[301, ''], [404, 'not found'], [200, '<html>shop</html>']] as [$status, $body]) {
            $response = new ProbeResponse($status, $body, null, 'https://shop.example/matomo.php', ['total' => 5], null, 0);
            $this->assertSame(Outcome::NOT_CHECKABLE, $classifier->classify($target, $response, self::NOW)->outcome, "HTTP $status");
        }
        $confirmed = new Target(7, 1, 'proxy', Kind::PROXY, 'https://shop.example/matomo.php', 'detected', [], '2026-03-01 00:00:00');
        $response = new ProbeResponse(404, '', null, 'https://shop.example/matomo.php', ['total' => 5], null, 0);
        $this->assertSame(Outcome::DOWN, $classifier->classify($confirmed, $response, self::NOW)->outcome, 'once it answered, a failure is an outage');
    }

    public function test_ui_loginForm_isUp(): void
    {
        $this->assertResult($this->classify(Kind::UI, 200, '<form name="form_login" method="post">'), Outcome::UP, null);
    }

    public function test_ui_manualAddressOnAnotherHost_isUp(): void
    {
        // the target's own URL is https://matomo.example.com/x; a hand-set internal name is its own host
        $target = new Target(7, 0, 'ui', Kind::UI, 'http://matomo.internal/index.php', 'manual', ['matomoHost' => 'matomo.example.com']);
        $response = new ProbeResponse(200, '<form name="form_login">', null, 'http://matomo.internal/index.php', ['total' => 5], null, 0);
        $this->assertSame(Outcome::UP, (new ResponseClassifier())->classify($target, $response, self::NOW)->outcome);
    }

    public function test_ui_loginFormOnForeignHost_isDownContent(): void
    {
        $result = $this->classify(Kind::UI, 200, '<form name="form_login">', null, 'https://parked.example.net/');
        $this->assertResult($result, Outcome::DOWN, Outcome::CONTENT);
    }

    public function test_ui_redirectToSsoHost_isUp(): void
    {
        $result = $this->classify(Kind::UI, 200, '<html>identity provider</html>', null, 'https://sso.example.org/auth', ['loginHost' => 'sso.example.org']);
        $this->assertResult($result, Outcome::UP, null);
    }

    public function test_ui_basicAuth401_isUpProtected(): void
    {
        $this->assertResult($this->classify(Kind::UI, 401, 'auth'), Outcome::UP, null, Outcome::PROTECTED);
        $this->assertResult($this->classify(Kind::UI, 403, 'forbidden'), Outcome::UP, null, Outcome::PROTECTED);
    }

    public function test_ui_500_isDownHttpStatus(): void
    {
        $this->assertResult($this->classify(Kind::UI, 500, 'Error: database'), Outcome::DOWN, Outcome::HTTP_STATUS);
    }

    public function test_ui_maintenance503(): void
    {
        $this->assertResult($this->classify(Kind::UI, 503, 'maintenance'), Outcome::DOWN, Outcome::MAINTENANCE);
    }

    public function test_ui_redirectNotFollowedToTheEnd_isDown(): void
    {
        $this->assertResult($this->classify(Kind::UI, 302, ''), Outcome::DOWN, Outcome::REDIRECT);
    }

    public function test_container_liveRevision_isUp(): void
    {
        $body = '(function(){var c={"id":"AbC123","idsite":1,"versionName":"v3","revision":3,"environment":"live"};})();';
        $this->assertResult($this->classify(Kind::CONTAINER, 200, $body, null, 'https://matomo.example.com/js/container_AbC123.js', ['idContainer' => 'AbC123', 'revision' => 3]), Outcome::UP, null);
    }

    public function test_container_withoutLiveRevision_isCheckedByItsIdOnly(): void
    {
        $body = '{"id":"AbC123","idsite":1,"revision":7}';
        $this->assertResult($this->classify(Kind::CONTAINER, 200, $body, null, 'https://m/x', ['idContainer' => 'AbC123']), Outcome::UP, null);
        $this->assertResult($this->classify(Kind::CONTAINER, 200, '{"id":"Other","revision":7}', null, 'https://m/x', ['idContainer' => 'AbC123']), Outcome::DOWN, Outcome::CONTENT);
    }

    public function test_container_otherRevision_isStale(): void
    {
        $body = '{"id":"AbC123","idsite":1,"revision":2}';
        $this->assertResult($this->classify(Kind::CONTAINER, 200, $body, null, 'https://m/x', ['idContainer' => 'AbC123', 'revision' => 3]), Outcome::DOWN, Outcome::STALE_CONTAINER);
    }

    public function test_container_revision30_isNotRevision3(): void
    {
        $body = '{"id":"AbC123","revision":30}';
        $this->assertResult($this->classify(Kind::CONTAINER, 200, $body, null, 'https://m/x', ['idContainer' => 'AbC123', 'revision' => 3]), Outcome::DOWN, Outcome::STALE_CONTAINER);
    }

    public function test_container_otherContainer_isDownContent(): void
    {
        $this->assertResult($this->classify(Kind::CONTAINER, 200, '{"id":"Other","revision":3}', null, 'https://m/x', ['idContainer' => 'AbC123', 'revision' => 3]), Outcome::DOWN, Outcome::CONTENT);
    }

    public function test_web_2xx_isUp_4xx_isDown(): void
    {
        $this->assertResult($this->classify(Kind::WEB, 204, ''), Outcome::UP, null);
        $this->assertResult($this->classify(Kind::WEB, 404, 'nope'), Outcome::DOWN, Outcome::HTTP_STATUS);
    }

    public function test_connectFailure_neverUp_isNotCheckable(): void
    {
        $this->assertResult($this->classify(Kind::WEB, null, '', Outcome::CONNECT, 'https://x/', [], null), Outcome::NOT_CHECKABLE, Outcome::CONNECT);
        $this->assertResult($this->classify(Kind::WEB, null, '', Outcome::DNS, 'https://x/', [], null), Outcome::NOT_CHECKABLE, Outcome::DNS);
        $this->assertResult($this->classify(Kind::WEB, null, '', Outcome::BLOCKED, 'https://x/', [], null), Outcome::NOT_CHECKABLE, Outcome::BLOCKED);
    }

    public function test_connectTimeout_neverUp_isNotCheckable(): void
    {
        // the prober reports a timeout before the TCP connection was established as `connect`
        $this->assertResult($this->classify(Kind::UI, null, '', Outcome::CONNECT, 'https://x/', [], null), Outcome::NOT_CHECKABLE, Outcome::CONNECT);
    }

    public function test_connectFailure_afterUp_isDown(): void
    {
        $this->assertResult($this->classify(Kind::WEB, null, '', Outcome::CONNECT), Outcome::DOWN, Outcome::CONNECT);
    }

    public function test_blocked_afterUp_isStillNotCheckable(): void
    {
        // a guard refusal is a configuration matter, never an outage of the target
        $this->assertResult($this->classify(Kind::WEB, null, '', Outcome::BLOCKED), Outcome::NOT_CHECKABLE, Outcome::BLOCKED);
    }

    public function test_timeoutAfterConnect_isDown(): void
    {
        $this->assertResult($this->classify(Kind::WEB, null, '', Outcome::TIMEOUT, 'https://x/', [], null), Outcome::DOWN, Outcome::TIMEOUT);
        $this->assertResult($this->classify(Kind::WEB, null, '', Outcome::PROTOCOL, 'https://x/', [], null), Outcome::DOWN, Outcome::PROTOCOL);
    }

    public function test_tls_neverUp_isNotCheckable_afterUp_isDown(): void
    {
        $this->assertResult($this->classify(Kind::WEB, null, '', Outcome::TLS, 'https://x/', [], null), Outcome::NOT_CHECKABLE, Outcome::TLS);
        $this->assertResult($this->classify(Kind::WEB, null, '', Outcome::TLS), Outcome::DOWN, Outcome::TLS);
    }

    public function test_proxyFailure_isNeverAnOutage(): void
    {
        $this->assertResult($this->classify(Kind::TRACKER, null, '', Outcome::PROXY), Outcome::NOT_CHECKABLE, Outcome::PROXY);
    }

    public function test_ui_403FromForeignHost_isDown(): void
    {
        $this->assertResult($this->classify(Kind::UI, 403, 'challenge', null, 'https://edge.cdn.example/'), Outcome::DOWN, Outcome::CONTENT);
    }

    public function test_web_basicAuth_neverUp_isNotCheckable(): void
    {
        foreach ([401, 403, 407, 429] as $status) {
            $this->assertResult($this->classify(Kind::WEB, $status, '', null, 'https://x/', [], null), Outcome::NOT_CHECKABLE, Outcome::HTTP_STATUS, Outcome::PROTECTED);
        }
        $this->assertResult($this->classify(Kind::WEB, 403, ''), Outcome::DOWN, Outcome::HTTP_STATUS);
    }

    public function test_container_prettyPrinted_isUp(): void
    {
        $body = "{\n    \"id\": \"AbC123\",\n    \"revision\": 3\n}";
        $this->assertResult($this->classify(Kind::CONTAINER, 200, $body, null, 'https://m/x', ['idContainer' => 'AbC123', 'revision' => 3]), Outcome::UP, null);
    }

    /** A container whose kept body (4 MiB, Prober::MAX_BODY_LARGE) ends with `$tail`; `$capped`: the file went on. */
    private function classifyCutContainer(string $tail, int $liveRevision, bool $capped): CheckResult
    {
        $target = new Target(7, 1, Kind::CONTAINER, Kind::CONTAINER, 'https://matomo.example.com/x', 'default', ['matomoHost' => 'matomo.example.com', 'idContainer' => 'AbC123', 'revision' => $liveRevision], '2026-03-01 00:00:00');
        $body = str_repeat('x', Prober::MAX_BODY_LARGE - strlen($tail)) . $tail;
        $response = new ProbeResponse(200, $body, null, 'https://m/x', ['total' => 5], null, 0, $capped);

        return (new ResponseClassifier())->classify($target, $response, self::NOW);
    }

    /** Regression: revision 30 cut at the cap read as revision 3, so an outdated container counted as current. */
    public function test_container_revisionCutAtTheCap_isNotCheckable_notCurrent(): void
    {
        $this->assertResult($this->classifyCutContainer('{"id":"AbC123","revision":3', 3, true), Outcome::NOT_CHECKABLE, Outcome::CONTENT, Outcome::TOO_LARGE);
    }

    /** Regression: the same cut "3" may be the live revision 30, so it is no outdated container either. */
    public function test_container_revisionCutAtTheCap_isNotCheckable_notStale(): void
    {
        $this->assertResult($this->classifyCutContainer('{"id":"AbC123","revision":3', 30, true), Outcome::NOT_CHECKABLE, Outcome::CONTENT, Outcome::TOO_LARGE);
        $this->assertResult($this->classifyCutContainer('{"id":"AbC123","revision": ', 3, true), Outcome::NOT_CHECKABLE, Outcome::CONTENT, Outcome::TOO_LARGE);
    }

    /**
     * Regression (5.1.5 review, item 3): a cut before the "revision" key or inside it read no revision at all, and the
     * container counted as outdated (down, stale_container). Without a whole revision number nothing is outdated.
     */
    public function test_container_cutBeforeOrInsideTheRevisionKey_isNotCheckable(): void
    {
        foreach (['{"id":"AbC123","idsite":1,', '{"id":"AbC123","idsite":1,"revis', '{"id":"AbC123","revision"'] as $tail) {
            $this->assertResult($this->classifyCutContainer($tail, 3, true), Outcome::NOT_CHECKABLE, Outcome::CONTENT, Outcome::TOO_LARGE);
        }
        // the same file read whole has no revision: outdated
        $this->assertResult($this->classifyCutContainer('{"id":"AbC123","idsite":1,', 3, false), Outcome::DOWN, Outcome::STALE_CONTAINER);
    }

    /** A cut before the id proves nothing either; a whole file without it is another file. */
    public function test_container_cutBeforeTheId_isNotCheckable(): void
    {
        $this->assertResult($this->classifyCutContainer('{"idsite":1,', 3, true), Outcome::NOT_CHECKABLE, Outcome::CONTENT, Outcome::TOO_LARGE);
        $this->assertResult($this->classifyCutContainer('{"idsite":1,', 3, false), Outcome::DOWN, Outcome::CONTENT);
    }

    public function test_container_revisionAtTheEndOfAWholeBody_counts(): void
    {
        // a file of exactly 4 MiB that ends there was read whole: its last number is complete
        $this->assertResult($this->classifyCutContainer('{"id":"AbC123","revision":3', 3, false), Outcome::UP, null);
        $this->assertResult($this->classifyCutContainer('{"id":"AbC123","revision":3', 30, false), Outcome::DOWN, Outcome::STALE_CONTAINER);
    }

    public function test_container_revisionBeforeTheCut_counts(): void
    {
        $this->assertResult($this->classifyCutContainer('{"id":"AbC123","revision":3,"environment":"li', 3, true), Outcome::UP, null);
        $this->assertResult($this->classifyCutContainer('{"id":"AbC123","revision":30,"environment":"li', 3, true), Outcome::DOWN, Outcome::STALE_CONTAINER);
    }
}
