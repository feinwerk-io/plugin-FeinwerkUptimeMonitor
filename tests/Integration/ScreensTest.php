<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration;

use Piwik\Category\CategoryList;
use Piwik\NoAccessException;
use Piwik\Plugins\FeinwerkUptimeMonitor\Controller;
use Piwik\Plugins\FeinwerkUptimeMonitor\Widgets\GetSiteStatus;
use Piwik\Plugins\FeinwerkUptimeMonitor\Widgets\GetUptimePage;
use Piwik\Plugins\FeinwerkUptimeMonitor\Widgets\ScreenProps;
use Piwik\Tests\Framework\Fixture;
use Piwik\Tests\Framework\Mock\FakeAccess;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;
use Piwik\Widget\WidgetConfig;
use Piwik\Widget\WidgetsList;

/**
 * The page under Visitors, the two dashboard widgets and the admin page (server side).
 *
 * @group FeinwerkUptimeMonitor
 */
class ScreensTest extends IntegrationTestCase
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
        Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Shop', 'https://www.shop.example/');
        $_GET['idSite'] = '1';
    }

    public function tearDown(): void
    {
        unset($_GET['idSite'], $_GET['disableLink'], $_GET['widget']);
        Fixture::resetTranslations();
        parent::tearDown();
    }

    private static function widget(string $action): ?WidgetConfig
    {
        foreach (WidgetsList::get()->getWidgetConfigs() as $config) {
            if ($config->getModule() === 'FeinwerkUptimeMonitor' && $config->getAction() === $action) {
                return $config;
            }
        }
        return null;
    }

    public function test_subcategory_listedUnderVisitors_forViewers(): void
    {
        FakeAccess::clearAccess(false, [], [1], 'viewer');
        $page = self::widget('getUptimePage');
        $this->assertNotNull($page);
        $this->assertSame('General_Visitors', $page->getCategoryId());
        $this->assertSame('FeinwerkUptimeMonitor_Uptime', $page->getSubcategoryId());
        $this->assertTrue($page->isWide());
        $this->assertTrue($page->isEnabled());
        $this->assertNotNull(CategoryList::get()->getCategory('General_Visitors')->getSubcategory('FeinwerkUptimeMonitor_Uptime'));
    }

    public function test_dashboardWidgets_viewAccess(): void
    {
        FakeAccess::clearAccess(false, [], [1], 'viewer');
        foreach (['getMatomoStatus', 'getSiteStatus'] as $action) {
            $widget = self::widget($action);
            $this->assertNotNull($widget, $action);
            $this->assertSame('FeinwerkUptimeMonitor_Widgets', $widget->getCategoryId());
            $this->assertTrue($widget->isEnabled(), $action);
        }
        FakeAccess::clearAccess(false, [], [], 'nobody');
        $config = new WidgetConfig();
        GetSiteStatus::configure($config);
        $this->assertFalse($config->isEnabled(), 'no view access, no widget');
    }

    public function test_page_mountsTheVueAppWithItsProps(): void
    {
        FakeAccess::clearAccess(false, [], [1], 'viewer');
        $html = (new GetUptimePage())->render();
        $this->assertStringContainsString('vue-entry="FeinwerkUptimeMonitor.UptimePage"', $html);
        $config = json_decode(html_entity_decode((string) preg_replace('/^.*config="([^"]*)".*$/s', '$1', $html), ENT_QUOTES), true);
        $this->assertSame(1, $config['idSite']);
        $this->assertSame('page', $config['variant']);
        $this->assertFalse($config['isAdmin']);
        $this->assertFalse($config['isSuperUser']);
        $this->assertFalse($config['feedback']['enabled'], 'never a vote from tests');
        $this->assertStringContainsString('mtm_source=FeinwerkUptimeMonitor', $config['feedback']['supportUrl']);
    }

    public function test_widgetize_hasNoFeedbackProps_andIsMarkedEmbedded(): void
    {
        $_GET['disableLink'] = '1';
        $props = ScreenProps::for(1, 'site');
        $this->assertTrue($props['embedded']);
        $this->assertNull($props['feedback']);
    }

    /**
     * Regression (Peter, 2026-11-25: "Das große Uptime widget via Visitors->Uptime ist immer noch kaputt"): on a
     * dashboard Matomo's widget frame has no padding, so the page must know it is a widget and bring its own.
     */
    public function test_page_onADashboard_isMarkedAsWidget(): void
    {
        $this->assertFalse(ScreenProps::for(1, 'page')['inWidget'], 'Visitors > Uptime: the card of Matomo pads it');
        $_GET['widget'] = '1';
        $props = ScreenProps::for(1, 'page');
        $this->assertTrue($props['inWidget'], 'on a dashboard');
        $this->assertNull($props['feedback'], 'no feedback row in a widget');
        $this->assertFalse(ScreenProps::for(1, 'site')['inWidget'], 'the small widgets pad themselves');
        unset($_GET['widget']);
        $_GET['disableLink'] = '1';
        $this->assertTrue(ScreenProps::for(1, 'page')['inWidget'], 'an embed is a widget frame too');
    }

    public function test_page_withoutViewAccess_isRefused(): void
    {
        FakeAccess::clearAccess(false, [], [], 'nobody');
        $this->expectException(NoAccessException::class);
        (new GetUptimePage())->render();
    }

    public function test_admin_onlySuperUser_andPassesLanguageAndCronLine(): void
    {
        $html = (new Controller())->admin();
        $this->assertStringContainsString('vue-entry="FeinwerkUptimeMonitor.AdminPage"', $html);
        $this->assertStringContainsString('lang="en"', $html);
        $this->assertStringContainsString('feinwerkuptimemonitor:check', html_entity_decode($html));

        FakeAccess::clearAccess(false, [1], [1], 'admin');
        $this->expectException(NoAccessException::class);
        (new Controller())->admin();
    }
}
