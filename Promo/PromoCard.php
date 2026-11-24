<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Promo;

/**
 * The kit's card in the dashboard widgets "Uptime: Matomo" and "Uptime: Website" (Peter, 2026-11-24, 7b: the footer
 * plus the card in the dashboard widgets; the kit's single-card form, Page Filter Report docs/footer.md "The card in
 * dashboard widgets"; copied from Live Dashboard). The card shows the tip line's message of the day: its title as the
 * bold name, its sentence and a short link. Its id ends in "-card", so hiding the card never hides the line of the same
 * message and the other way round (localStorage fwpromo:<id>:dismissed, javascripts/promocard.js). Markup in
 * vue/src/PromoCard.vue, styles in stylesheets/promocard.css. Pure.
 */
final class PromoCard
{
    /** appended to the message id: a key of its own for the card */
    public const ID_SUFFIX = '-card';

    public const LINE = 'line';
    public const CARD = 'card';

    /**
     * The dashboard's one card is a pausable place shared by all Feinwerk plugins (kit promocard.js 5, Page Filter
     * Report 2b6e3f5; Peter, 2026-11-24: "Ein × blendet alles 30 Tage aus"): an x empties the place "card" for 30 days,
     * the closed card itself stays away 90 days. Demo mode keeps the plain hiding for the browser session (0 and 0).
     */
    public const PAUSE_PLACE = 'card';
    public const PAUSE_DAYS = 30;
    public const ITEM_DAYS = 90;

    /**
     * The tip line on the uptime page (Visitors > Uptime), the card in a dashboard widget (house rule: in a dashboard
     * widget the promotion is the card, never the tip line). Nothing in a Widgetize embed.
     *
     * @param bool $fullBoard   the screen is the uptime page itself, not one of its widgets
     * @param bool $embedded    Widgetize (module=Widgetize or disableLink=1, PromoLine::isEmbedded())
     * @param bool $inDashboard the request loads a dashboard widget (Matomo's dashboard sends widget=1)
     * @return string|null LINE, CARD or null
     */
    public static function placeFor(bool $fullBoard, bool $embedded, bool $inDashboard): ?string
    {
        if ($embedded) {
            return null;
        }

        return $fullBoard && !$inDashboard ? self::LINE : self::CARD;
    }

    /**
     * Variables of templates/_promoCard.twig from the tip line's variables (PromoLine::variables()), null without a line.
     *
     * @param array<string, mixed>|null $line
     * @return array{id: string, days: int, pauseDays: int, demo: bool, name: string, text: string, link: string, url: string, external: bool, note: string, title: string}|null
     */
    public static function fromLine(?array $line, string $more): ?array
    {
        if ($line === null) {
            return null;
        }

        return [
            'id' => $line['id'] . self::ID_SUFFIX,
            // the card stays away longer than the place's pause, so after the pause another message can show
            'days' => $line['demo'] ? (int) $line['dismissDays'] : self::ITEM_DAYS,
            'pauseDays' => $line['demo'] ? 0 : self::PAUSE_DAYS,
            'demo' => (bool) $line['demo'],
            'name' => (string) $line['title'],
            // the line's sentence may end in a colon that its link finishes; the card's short link does not
            'text' => rtrim((string) $line['text'], " \t:"),
            // a short link: the card sits in a narrow dashboard column; the line's long link text becomes its title
            'link' => $more,
            'url' => (string) $line['url'],
            'external' => (bool) $line['external'],
            'note' => (string) $line['note'],
            'title' => (string) $line['note'] !== '' ? (string) $line['note'] : (string) $line['link'],
        ];
    }
}
