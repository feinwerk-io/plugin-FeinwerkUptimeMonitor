<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Feedback\PluginFeedback;

/** Feedback thumbs (under the uptime page): what goes to Feinwerk (nothing personal) and where the support button leads. */
class PluginFeedbackTest extends TestCase
{
    public function testPayloadFollowsTheStoreContract(): void
    {
        $ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
        $this->assertSame([
            'plugin' => 'FeinwerkUptimeMonitor',
            'plugin_version' => '1.0.0-beta.2',
            'matomo_version' => '6.0.0-b6',
            'topic' => 'page',
            'vote' => 'down',
            'browser' => 'Chrome 141',
            'language' => 'de',
        ], PluginFeedback::payload('page', 'down', '1.0.0-beta.2', '6.0.0-b6', $ua, 'de'));
    }

    public function testUnknownBrowserAndLanguageAreNull(): void
    {
        $payload = PluginFeedback::payload('page', 'up', '1.0.0', '6.0.0', 'curl/8.5.0', '');
        $this->assertNull($payload['browser']);
        $this->assertNull($payload['language']);
    }

    public function testPluginNameMatchesTheStorePattern(): void
    {
        $this->assertSame(1, preg_match('/^Feinwerk[A-Za-z0-9]{3,52}$/', PluginFeedback::payload('page', 'up', '1', '6', '', 'en')['plugin']));
    }

    public function testSendsNoBrowserDetailsInHeaders(): void
    {
        $_SERVER['HTTP_USER_AGENT'] = 'Mozilla/5.0 (Windows NT 10.0) Chrome/141.0.0.0 Safari/537.36';
        $_SERVER['HTTP_VIA'] = '1.1 corporate-proxy.example';
        $seen = [];
        $transport = function (...$args) use (&$seen) {
            $seen = ['userAgent' => $args[3], 'via' => $_SERVER['HTTP_VIA'] ?? null, 'headers' => $args[15]];
            return ['status' => 202, 'data' => '{"ok":true}'];
        };
        $this->assertTrue((new PluginFeedback($transport))->send(['plugin' => 'FeinwerkUptimeMonitor']));
        $this->assertSame(PluginFeedback::USER_AGENT, $seen['userAgent']);
        $this->assertStringNotContainsString('Mozilla', $seen['userAgent']);
        $this->assertNull($seen['via'], 'the incoming proxy chain must not go into the Via header');
        $this->assertSame('1.1 corporate-proxy.example', $_SERVER['HTTP_VIA'], 'restored after the request');
        unset($_SERVER['HTTP_USER_AGENT'], $_SERVER['HTTP_VIA']);
    }

    public function testOnlyUpOrDown(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        PluginFeedback::payload('page', 'maybe', '1.0.0', '6.0.0', '', 'en');
    }

    public function testBrowserIsFamilyAndMajorVersionOnly(): void
    {
        $this->assertSame('Edge 140', PluginFeedback::browser('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.3485.54'));
        $this->assertSame('Firefox 143', PluginFeedback::browser('Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0'));
        $this->assertSame('Safari 18', PluginFeedback::browser('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'));
        $this->assertSame('Opera 122', PluginFeedback::browser('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 OPR/122.0.0.0'));
        $this->assertSame('', PluginFeedback::browser('curl/8.5.0'));
    }

    public function testSupportOpensTheContactFormWithThePluginsTopic(): void
    {
        $this->assertStringStartsWith('https://feinwerk.io/de/kontakt?service=plugins', PluginFeedback::supportUrl('de'));
        $this->assertStringStartsWith('https://feinwerk.io/en/contact?service=plugins', PluginFeedback::supportUrl('en'));
        $this->assertStringStartsWith('https://feinwerk.io/en/contact?service=plugins', PluginFeedback::supportUrl('fr'));
    }

    public function testOnlyTheQuestionsThePluginAsks(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        PluginFeedback::payload('pricing', 'up', '1.0.0', '6.0.0', '', 'en');
    }

    public function testMatomosHttpClientStaysOffInTestMode(): void
    {
        // whatever the caller checked: in a test run (PIWIK_TEST_MODE, set by tests/bootstrap.php) no vote leaves
        $this->assertFalse((new PluginFeedback())->isEnabled(), "Matomo's HTTP client in test mode");
        $this->assertTrue((new PluginFeedback(static fn (...$args) => ['status' => 202]))->isEnabled(), 'a test double');
    }

    public function testSendAsksTheClassFirst(): void
    {
        $calls = 0;
        $transport = static function (...$args) use (&$calls) {
            $calls++;
            return ['status' => 202, 'data' => ''];
        };
        $off = new class ($transport) extends PluginFeedback {
            public function isEnabled(): bool
            {
                return false;
            }
        };
        $this->assertFalse($off->send(['plugin' => 'FeinwerkUptimeMonitor']));
        $this->assertSame(0, $calls, 'nothing may reach the transport');
    }

    public function testAnErrorInTheHttpClientIsNotShownToTheUser(): void
    {
        // e.g. a TypeError when curl cannot start: the vote is lost quietly, the editor shows no API error
        $broken = new PluginFeedback(static function (...$args) {
            throw new \TypeError('curl could not start');
        });
        $this->assertFalse($broken->send(['plugin' => 'FeinwerkUptimeMonitor']));
    }

    public function testNothingIsSentWhenMatomoHasItsInternetFeaturesOff(): void
    {
        // [General] enable_internet_features = 0: Matomo's HTTP client does not check it, so the kit must
        $this->assertFalse(PluginFeedback::enabledBy([], false));
        $this->assertFalse(PluginFeedback::enabledBy(['feedback' => '1'], false));
        $this->assertTrue(PluginFeedback::enabledBy([], true));
    }

    public function testEachQuestionHasItsOwnThrottle(): void
    {
        $preview = PluginFeedback::throttleOption('anna', 'page');
        $this->assertNotSame($preview, PluginFeedback::throttleOption('anna', 'report'), 'a second question on the page still counts');
        $this->assertNotSame($preview, PluginFeedback::throttleOption('bert', 'page'));
    }

    public function testDeletingAUserCatchesItsThrottles(): void
    {
        // the LIKE pattern the plugin deletes with (FeinwerkUptimeMonitor::deleteUserFeedback)
        $like = '/^' . str_replace('%', '.*', preg_quote(PluginFeedback::userOptionPattern('anna'), '/')) . '$/';
        $this->assertSame(1, preg_match($like, PluginFeedback::throttleOption('anna', 'page')));
        $this->assertSame(0, preg_match($like, PluginFeedback::throttleOption('bert', 'page')));
    }

    public function testEveryWayOfWritingOffSwitchesItOff(): void
    {
        // Matomo's INI reader turns off, no and false into PHP false
        foreach ([false, '0', '', 'off', 'no', 'false', 'OFF', ' 0 '] as $off) {
            $this->assertFalse(PluginFeedback::enabledBy(['feedback' => $off]), var_export($off, true));
        }
        foreach ([true, '1', 'on', 'yes'] as $on) {
            $this->assertTrue(PluginFeedback::enabledBy(['feedback' => $on]), var_export($on, true));
        }
    }

    public function testNothingIsSentInMatomosTestMode(): void
    {
        $this->assertFalse(PluginFeedback::enabledBy([], true, true));
    }

    public function testAServerSendsAtMostTwentyVotesAMinute(): void
    {
        $stored = null;
        for ($i = 0; $i < 20; $i++) {
            $stored = PluginFeedback::countVote($stored, 960 + $i);
            $this->assertNotNull($stored, "vote $i");
        }
        $this->assertNull(PluginFeedback::countVote($stored, 1019), 'the 21st vote in the same minute');
        $this->assertNotNull(PluginFeedback::countVote($stored, 1020), 'the next minute');
    }

    public function testFeedbackCanBeSwitchedOffInTheConfig(): void
    {
        $this->assertTrue(PluginFeedback::enabledBy([]));
        $this->assertTrue(PluginFeedback::enabledBy(['feedback' => '1']));
        $this->assertFalse(PluginFeedback::enabledBy(['feedback' => '0']));
    }
}
