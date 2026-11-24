<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration;

use Piwik\Http\HttpCodeException;
use Piwik\NoAccessException;
use Piwik\Option;
use Piwik\Plugins\FeinwerkUptimeMonitor\API;
use Piwik\Plugins\FeinwerkUptimeMonitor\Feedback\PluginFeedback;
use Piwik\Plugins\FeinwerkUptimeMonitor\FeinwerkUptimeMonitor;
use Piwik\Plugins\FeinwerkUptimeMonitor\Widgets\GetMatomoStatus;
use Piwik\Plugins\FeinwerkUptimeMonitor\Widgets\GetUptimePage;
use Piwik\Tests\Framework\Fixture;
use Piwik\Tests\Framework\Mock\FakeAccess;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;

/**
 * The feedback thumbs under the uptime page: the API's access rules, nothing sent in test mode, the user's throttles removed
 * with the user, and the question only on the uptime page itself.
 *
 * @group FeinwerkUptimeMonitor
 */
class FeedbackTest extends IntegrationTestCase
{
    public function provideContainerConfig()
    {
        return ['Piwik\\Access' => new FakeAccess()];
    }

    public function setUp(): void
    {
        parent::setUp();
        Fixture::loadAllTranslations();
        FakeAccess::$superUser = true;
        Fixture::createWebsite('2026-01-01 00:00:00', 1, 'Shop', 'https://example.com');
        FakeAccess::clearAccess(false, [], [1], 'viewer');
        $_GET['idSite'] = 1;
    }

    public function tearDown(): void
    {
        unset($_GET['idSite'], $_GET['module']);
        Fixture::resetTranslations();
        parent::tearDown();
    }

    public function test_aViewer_canVote_butNothingLeavesInTestMode(): void
    {
        $this->assertSame(['sent' => false], API::getInstance()->sendFeedback(1, 'page', 'up'));
    }

    /**
     * @dataProvider wrongVotes
     */
    public function test_aWrongTopicOrVote_isABadRequest_namingTheAllowedValues(string $topic, string $vote, string $message): void
    {
        try {
            API::getInstance()->sendFeedback(1, $topic, $vote);
            $this->fail('bad request expected');
        } catch (\Exception $e) {
            $this->assertInstanceOf(HttpCodeException::class, $e);
            $this->assertSame(400, $e->getCode());
            $this->assertSame($message, $e->getMessage());
        }
    }

    public static function wrongVotes(): array
    {
        return [
            'topic' => ['pages', 'up', 'The parameter \'topic\' does not accept \'pages\'. Allowed: page.'],
            'vote' => ['page', 'maybe', 'The parameter \'vote\' does not accept \'maybe\'. Allowed: up, down.'],
        ];
    }

    public function test_withoutAccessToTheSite_noVote(): void
    {
        FakeAccess::clearAccess(false, [], [], 'stranger');
        $this->expectException(NoAccessException::class);
        API::getInstance()->sendFeedback(1, 'page', 'up');
    }

    public function test_anonymous_noVote(): void
    {
        FakeAccess::clearAccess(false, [], [1], 'anonymous');
        $this->expectException(NoAccessException::class);
        API::getInstance()->sendFeedback(1, 'page', 'up');
    }

    public function test_deletingAUser_removesItsThrottles(): void
    {
        Option::set(PluginFeedback::throttleOption('anna', 'page'), '123');
        Option::set(PluginFeedback::throttleOption('bert', 'page'), '456');

        (new FeinwerkUptimeMonitor())->deleteUserFeedback('anna');

        $this->assertFalse(Option::get(PluginFeedback::throttleOption('anna', 'page')));
        $this->assertSame('456', Option::get(PluginFeedback::throttleOption('bert', 'page')));
    }

    private static function config(string $html): array
    {
        $json = html_entity_decode((string) preg_replace('/^.*config="([^"]*)".*$/s', '$1', $html), ENT_QUOTES);
        return (array) json_decode($json, true);
    }

    public function test_theQuestion_onlyOnTheUptimePage(): void
    {
        $page = self::config((new GetUptimePage())->render());
        $this->assertIsArray($page['feedback']);
        $this->assertStringContainsString('mtm_source=FeinwerkUptimeMonitor', $page['feedback']['supportUrl']);

        $this->assertNull(self::config((new GetMatomoStatus())->render())['feedback'], 'not in dashboard widgets');

        $_GET['module'] = 'Widgetize';
        try {
            $this->assertNull(self::config((new GetUptimePage())->render())['feedback'], 'not in Widgetize embeds');
        } finally {
            unset($_GET['module']);
        }
    }
}
