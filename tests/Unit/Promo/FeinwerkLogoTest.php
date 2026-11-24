<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Promo;

use PHPUnit\Framework\TestCase;

/**
 * The Feinwerk logo in banners (Peter, 2026-11-13: "in die banner, wo möglich bitte generell noch das feinwerk-logo
 * unterbringen"; docs/promotions.md): one shared partial, nothing loaded, no font dependency, hidden from screen readers,
 * in the banner, the boxes and the section tile, never in the one-line footer, the tip line or the dashboard card.
 */
class FeinwerkLogoTest extends TestCase
{
    private const INCLUDE = "{% include '@FeinwerkUptimeMonitor/_feinwerkLogo.twig' %}";

    public function test_the_logo_loads_nothing_and_needs_no_font(): void
    {
        $logo = $this->file('templates/_feinwerkLogo.twig');

        self::assertStringContainsString('aria-hidden="true"', $logo);
        self::assertStringContainsString('<svg class="fwlogo__mark"', $logo);
        self::assertSame(0, preg_match('/<text\b|<image\b|<img\b|\bhref=|\bsrc=|url\(/', $logo), 'inline only');
        self::assertSame(0, preg_match('/\burl\(|@import|@font-face/', $this->file('stylesheets/feinwerklogo.css')));
    }

    /**
     * Peter, 2026-11-17: "feinwerk logo immer dabei": at the start of the tip line; the feedback row stays without. This
     * plugin has only the tip line (no banner, box or card); its screens render the Vue copy of the line.
     */
    public function test_the_tip_line_shows_it_the_feedback_row_does_not(): void
    {
        $line = $this->file('templates/_promo.twig');
        self::assertSame(1, substr_count($line, self::INCLUDE));
        self::assertLessThan(strpos($line, 'fwpromo-line__text'), strpos($line, self::INCLUDE), 'the logo starts the line');

        $vue = $this->file('vue/src/PromoLine.vue');
        self::assertSame(1, substr_count($vue, '<FeinwerkLogo />'));
        self::assertLessThan(strpos($vue, 'fwpromo-line__text'), strpos($vue, '<FeinwerkLogo />'), 'the logo starts the Vue line');
        self::assertStringNotContainsString('FeinwerkLogo', $this->file('vue/src/FeedbackBar.vue'));
    }

    /** The Vue copy of the logo draws the same mark as the partial (the three rings of dots and the core). */
    public function test_the_vue_logo_matches_the_partial(): void
    {
        $vue = $this->file('vue/src/FeinwerkLogo.vue');
        foreach (['class="fwlogo"', 'aria-hidden="true"', 'class="fwlogo__mark"', 'viewBox="0 0 48 48"', 'class="fwlogo__core"',
            'r="5.4"', "opacity: '0.9', r: '2.9'", "opacity: '0.55', r: '2.5'", "opacity: '0.35', r: '2.1'",
            'class="fwlogo__word">feinwerk', '> plugins</span>'] as $part) {
            self::assertStringContainsString($part, $vue);
        }
        self::assertSame(0, preg_match('/<img\b|\bsrc=|\bhref=/', $vue), 'inline only');
    }

    /** In the tip line at text height, and on narrow screens only the round mark (no size containment on the line). */
    public function test_in_the_tip_line_at_text_height_and_only_the_mark_on_narrow_screens(): void
    {
        $css = (string) preg_replace('~/\*.*?\*/~s', '', $this->file('stylesheets/promo.css'));

        self::assertSame(0, preg_match('/container-type/', $css), 'containment could collapse the line elsewhere');
        self::assertSame(1, preg_match('/\.fwpromo-line \.fwlogo \.fwlogo__mark\s*\{[^}]*width:\s*14px[^}]*height:\s*14px/', $css));
        self::assertSame(1, preg_match('/@media \(max-width:\s*600px\)\s*\{\s*\.fwpromo-line \.fwlogo \.fwlogo__word\s*\{\s*display:\s*none/', $css));
    }

    public function test_light_and_dark_use_the_colours_of_the_store_logo(): void
    {
        $css = $this->file('stylesheets/feinwerklogo.css');

        // feinwerk-plugins-logo.svg (light) and -logo-white.svg (dark)
        foreach (['#0e7c7b', '#1a1714', '#6b6359', '#9fd8d2', '#e8e6e1', '#6b7180'] as $colour) {
            self::assertStringContainsString($colour, $css);
        }
        self::assertStringContainsString('[data-theme-mode="dark"] .fwlogo', $css);
        self::assertStringContainsString('[data-theme-mode="auto"] .fwlogo', $css);
    }

    private function file(string $path): string
    {
        return (string) file_get_contents(__DIR__ . '/../../../' . $path);
    }
}
