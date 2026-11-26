<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Promo;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Promo\PromoCard;
use Piwik\Plugins\FeinwerkUptimeMonitor\Promo\PromoLine;

/**
 * Where the board shows its promotion and the card in its dashboard widgets (Peter, 2026-11-19: the tip line under the
 * board page, the card in the dashboard widgets; the kit's single-card form).
 *
 * @group Plugins
 * @group FeinwerkUptimeMonitor
 */
class PromoCardTest extends TestCase
{
    public function test_the_line_on_the_boards_page_the_card_in_a_dashboard_nothing_in_an_embed(): void
    {
        self::assertSame(PromoCard::LINE, PromoCard::placeFor(true, false, false), 'Visitors > Live Dashboard');
        self::assertSame(PromoCard::CARD, PromoCard::placeFor(false, false, true), 'a dashboard widget');
        self::assertSame(PromoCard::CARD, PromoCard::placeFor(true, false, true), 'the whole board on a dashboard: the card, never the line');
        self::assertSame(PromoCard::CARD, PromoCard::placeFor(false, false, false), 'a part of the board is a dashboard widget only');
        foreach ([[true, false], [true, true], [false, false], [false, true]] as [$fullBoard, $inDashboard]) {
            self::assertNull(PromoCard::placeFor($fullBoard, true, $inDashboard), 'Widgetize');
        }
    }

    public function test_the_card_shows_the_message_of_the_tip_line_under_a_key_of_its_own(): void
    {
        $translate = static function (string $key): string {
            return '[' . $key . ']';
        };
        $line = PromoLine::variables('campaigns', 'de', $translate);
        $card = PromoCard::fromLine($line, 'Learn more');

        // the card's link is short (a narrow dashboard column); the line's long link text goes into its title
        self::assertSame([
            'id' => 'campaigns-card',
            'days' => 90,
            'pauseDays' => 30,
            'demo' => false,
            'name' => '[FeinwerkUptimeMonitor_PromoCampaignsTitle]',
            'text' => '[FeinwerkUptimeMonitor_PromoCampaignsText]',
            'link' => 'Learn more',
            'url' => 'https://campaigns.feinwerk.io/de/matomo?mtm_campaign=plugin-promo&mtm_source=FeinwerkUptimeMonitor&mtm_content=campaigns',
            'external' => true,
            'note' => '',
            'title' => '[FeinwerkUptimeMonitor_PromoCampaignsLink]',
        ], $card);
        self::assertNotSame($line['id'], $card['id'], 'hiding the card never hides the line');
        self::assertNull(PromoCard::fromLine(null, 'Learn more'));
    }

    /** The line's sentence may end in a colon (its link finishes it there); the card's short link does not, so it goes. */
    public function test_the_card_sentence_does_not_end_in_a_colon(): void
    {
        $line = [
            'id' => 'connector', 'dismissDays' => 30, 'demo' => false, 'title' => 'Feinwerk Connector',
            'text' => 'Exclusive Plugins for Matomo by Feinwerk, free, freemium and premium: ', 'link' => 'Install it',
            'url' => 'x', 'external' => true, 'note' => '',
        ];
        self::assertSame('Exclusive Plugins for Matomo by Feinwerk, free, freemium and premium', PromoCard::fromLine($line, 'Learn more')['text']);
    }

    /** For a super user the connector's link stays inside Matomo; an admin gets the note that the super user installs. */
    public function test_the_connector_card_keeps_where_its_link_leads(): void
    {
        $translate = static function (string $key): string {
            return '[' . $key . ']';
        };
        $super = PromoCard::fromLine(PromoLine::variables('connector', 'de', $translate, 'line', false, ['superUser' => true, 'marketplace' => true]), 'More');
        $admin = PromoCard::fromLine(PromoLine::variables('connector', 'en', $translate, 'line', false, ['superUser' => false, 'marketplace' => false]), 'More');

        self::assertSame(['connector-card', false, ''], [$super['id'], $super['external'], $super['note']]);
        self::assertStringStartsWith('index.php?module=Marketplace', $super['url']);
        self::assertSame([true, '[FeinwerkUptimeMonitor_PremiumAskSuperUser]'], [$admin['external'], $admin['note']]);
        self::assertSame('[FeinwerkUptimeMonitor_PremiumAskSuperUser]', $admin['title'], 'the admin note wins the title');
    }

    /** Demo mode (test instances): the card's x keeps it away for the browser session only. */
    public function test_in_demo_the_card_hides_for_the_session_only(): void
    {
        $line = PromoLine::variables('hosting', 'en', static function (string $key): string {
            return $key;
        }, 'line', true);

        self::assertSame([0, 0, true], [PromoCard::fromLine($line, 'More')['days'], PromoCard::fromLine($line, 'More')['pauseDays'],
            PromoCard::fromLine($line, 'More')['demo']]);
    }

    /** Pausable place (kit promocard.js 5): an x pauses the dashboard's card place 30 days, the card itself 90 days. */
    public function test_the_card_place_pauses_30_days_the_card_stays_away_90(): void
    {
        $line = PromoLine::variables('hosting', 'en', static function (string $key): string {
            return $key;
        }, 'line');
        $card = PromoCard::fromLine($line, 'More');

        self::assertSame([90, 30, 'card'], [$card['days'], $card['pauseDays'], PromoCard::PAUSE_PLACE]);
    }

    /**
     * The kit's pausable card place in PromoCard.vue, static guards only: Vue renders only the slot div, and the group is
     * never built from raw HTML. How the card behaves (its group, template, link, demo mode, rebuild, the dashboard's
     * one place when widgets are minimised or restored) is checked in a browser: tests/js/run-uptimepage-check.sh.
     */
    public function test_the_vue_card_owns_only_its_slot_and_builds_no_raw_html(): void
    {
        $vue = (string) file_get_contents(__DIR__ . '/../../../vue/src/PromoCard.vue');
        $code = (string) preg_replace('/<!--.*?-->/s', '', $vue);
        $markup = substr($code, 0, (int) strpos($code, '<script'));

        // Vue owns the slot only: no child elements in its template, so Vue never patches what the kit removes
        self::assertSame(1, preg_match('/<template>\s*<div\s+ref="slot"\s+class="fwum-promo-card-slot"\s*\/>\s*<\/template>/', $markup));
        self::assertSame(0, preg_match('/innerHTML|outerHTML|insertAdjacentHTML|v-html|createContextualFragment/', $code), 'no raw HTML');
        self::assertSame(0, preg_match('/(?<![\w:-])id="|(?<![\w-])src=|url\(/', $markup), 'no ids, nothing loaded');
    }

    /** The card sits in the widgets only (the uptime page has the tip line): what the server sends where. */
    public function test_the_widgets_show_the_card_the_page_the_line(): void
    {
        $props = (string) file_get_contents(__DIR__ . '/../../../Widgets/ScreenProps.php');
        // the page on a dashboard is a widget too: card, no tip line, no feedback row
        self::assertStringContainsString("\$ownPage = \$variant === 'page' && !\$embedded && !\$onDashboard;", $props);
        self::assertStringContainsString("'promo' => \$ownPage ? self::promo(\$idSite) : null", $props);
        self::assertStringContainsString("'feedback' => \$ownPage ? self::feedback() : null", $props);
        self::assertStringContainsString("!\$embedded && (\$onDashboard || \$variant !== 'page') && \$variant !== 'admin'", $props);
    }
}
