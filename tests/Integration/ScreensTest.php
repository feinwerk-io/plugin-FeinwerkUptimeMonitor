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
use Piwik\Piwik;
use Piwik\Plugins\FeinwerkUptimeMonitor\Controller;
use Piwik\Plugins\FeinwerkUptimeMonitor\External\ExternalResults;
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

    /** A plugin that adds results checked from outside, registered as the seam's event asks (Pro's shape). */
    private static function outsideSource(bool $active, int $reachedAgo = 60, ?bool $alerts = null): void
    {
        Piwik::addAction(ExternalResults::EVENT_SOURCES, static function (&$sources) use ($active, $reachedAgo, $alerts): void {
            $sources[] = ['name' => 'Outside checks', 'active' => $active,
                'reachedAt' => gmdate('Y-m-d\TH:i:s\Z', time() - $reachedAgo),
                'settingsUrl' => 'index.php?module=OutsideChecks&action=index&idSite=1&period=day&date=yesterday']
                + ($alerts !== null ? ['alerts' => $alerts] : []);
        });
    }

    public function test_props_externalActive_withPro(): void
    {
        self::outsideSource(true);

        $props = ScreenProps::for(1, 'page');
        $this->assertTrue($props['external']['active']);
        $this->assertSame('Outside checks', $props['external']['name']);
        // PHPUnit 8 of Matomo 5 has no assertMatchesRegularExpression
        $this->assertSame(1, preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/', $props['external']['reachedAt']));
        $this->assertSame('index.php?module=OutsideChecks&action=index&idSite=1&period=day&date=yesterday',
            $props['external']['settingsUrl']);
        $this->assertTrue(ScreenProps::for(0, 'admin')['external']['active'], 'the admin page names them too');
        $this->assertFalse($props['external']['alerts'], 'a source that does not say it alerts: no alerts');

        FakeAccess::clearAccess(false, [], [1], 'viewer');
        $viewer = ScreenProps::for(1, 'site');
        $this->assertTrue($viewer['external']['active'], 'viewers see the results checked from outside');
        $this->assertNull($viewer['external']['settingsUrl'], 'but no link to settings they cannot open');
    }

    /**
     * Review of the 5.3.0 fixes, SHOULD 2: the screens compare the two sides with the server's margin (the check run's
     * time budget plus one probe minute), the same value as getSitesOverview.
     */
    public function test_props_externalSidesMargin_followsTheRunBudget(): void
    {
        self::outsideSource(true);

        $this->assertSame(120, ScreenProps::for(1, 'page')['external']['sidesMargin']);
        $this->assertSame(120, ScreenProps::for(1, 'site')['external']['sidesMargin'], 'the widgets too');
        $config = \Piwik\Config::getInstance();
        $before = $config->FeinwerkUptimeMonitor;
        try {
            $config->FeinwerkUptimeMonitor = ['run_budget_seconds' => 300];
            $this->assertSame(360, ScreenProps::for(1, 'matomo')['external']['sidesMargin']);
        } finally {
            $config->FeinwerkUptimeMonitor = $before;
        }
    }

    /** The admin page's alert row names an active source that sends alerts itself, never a paused one. */
    public function test_props_externalAlerts_onlyWhileActive(): void
    {
        self::outsideSource(true, 60, true);
        $this->assertTrue(ScreenProps::for(0, 'admin')['external']['alerts']);
    }

    /**
     * L8 review finding 4 (screens only): the alert bit is for the admin page alone; finding 6: the time of the latest
     * results (resultsAt), not of the last contact, which a push sets too.
     */
    public function test_props_externalAlertsOnTheAdminPageOnly_andTheTimeOfTheLatestResults(): void
    {
        Piwik::addAction(ExternalResults::EVENT_SOURCES, static function (&$sources): void {
            $sources[] = ['name' => 'Outside checks', 'active' => true, 'reachedAt' => gmdate('Y-m-d\TH:i:s\Z', time() - 30),
                'resultsAt' => '2026-03-17T11:05:00Z', 'alerts' => true];
        });

        $this->assertTrue(ScreenProps::for(0, 'admin')['external']['alerts']);
        $this->assertSame('2026-03-17T11:05:00Z', ScreenProps::for(0, 'admin')['external']['resultsAt']);
        $this->assertFalse(ScreenProps::for(1, 'page')['external']['alerts'], 'the page never reads it');
        $this->assertFalse(ScreenProps::for(1, 'site')['external']['alerts']);
        $this->assertNull(ScreenProps::for(1, 'page')['external']['resultsAt'], 'nor the time of the latest results');
    }

    public function test_props_externalAlerts_notWhenPaused(): void
    {
        self::outsideSource(true, 3 * 3600, true);
        $this->assertSame([false, false], array_values(array_intersect_key(ScreenProps::for(0, 'admin')['external'],
            ['active' => 1, 'alerts' => 1])), 'stopped more than 2 hours ago: neither active nor alerting');
    }

    public function test_props_externalPaused_onlyForAdmins(): void
    {
        self::outsideSource(false);

        $this->assertSame(['active' => false, 'name' => 'Outside checks'],
            array_intersect_key(ScreenProps::for(1, 'page')['external'], ['active' => 1, 'name' => 1]));
        FakeAccess::clearAccess(false, [1], [1], 'admin');
        $admin = ScreenProps::for(1, 'page')['external'];
        $this->assertFalse($admin['active']);
        $this->assertNotNull($admin['settingsUrl'], 'the website\'s admins get the link to the settings');

        FakeAccess::clearAccess(false, [], [1], 'viewer');
        $this->assertNull(ScreenProps::for(1, 'page')['external'], 'viewers: the page as without a source');
    }

    /** Active, but its last reach is older than two hours: no longer delivering, so paused (the Sentinel rule). */
    public function test_props_externalActiveButNotReached_isPaused(): void
    {
        self::outsideSource(true, 3 * 3600);

        $this->assertFalse(ScreenProps::for(1, 'page')['external']['active']);
        FakeAccess::clearAccess(false, [], [1], 'viewer');
        $this->assertNull(ScreenProps::for(1, 'page')['external']);
    }

    public function test_props_externalNull_withoutSource(): void
    {
        $this->assertNull(ScreenProps::for(1, 'page')['external']);
        $this->assertNull(ScreenProps::for(1, 'matomo')['external']);
        $this->assertNull(ScreenProps::for(0, 'admin')['external']);
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
