<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration\Kit;

use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use Twig\TwigFilter;

/**
 * The tip line template rendered with Twig itself (not a string search): a link inside Matomo (the connector in the
 * instance's own Marketplace, external = false) opens in the same tab. `|default(true)` turned false into true, because
 * Twig's default filter also replaces empty values (found by Live Dashboard, 2026-11-19).
 */
class PromoTemplateTest extends TestCase
{
    private function render(array $promo): string
    {
        $loader = new FilesystemLoader();
        $loader->addPath(__DIR__ . '/../../../templates', 'FeinwerkUptimeMonitor');
        $twig = new Environment($loader, ['strict_variables' => false, 'autoescape' => 'html']);
        $twig->addFilter(new TwigFilter('translate', static function (string $key): string {
            return $key;
        }));

        return $twig->render('@FeinwerkUptimeMonitor/_promo.twig', ['promo' => $promo + [
            'id' => 'connector',
            'placement' => 'line',
            'title' => 'Title',
            'text' => 'Text',
            'link' => 'Link',
            'url' => 'index.php?module=Marketplace&action=overview',
            'dismissDays' => 30,
        ]]);
    }

    public function test_a_link_inside_matomo_opens_in_the_same_tab(): void
    {
        $html = $this->render(['external' => false, 'note' => '', 'demo' => false]);

        self::assertStringNotContainsString('target="_blank"', $html);
        self::assertStringNotContainsString('data-fwpromo-demo', $html);
    }

    public function test_an_external_link_opens_in_a_new_tab_with_its_note(): void
    {
        $html = $this->render(['external' => true, 'note' => 'Ask your super user.', 'demo' => true]);

        self::assertStringContainsString('target="_blank" rel="noopener"', $html);
        self::assertStringContainsString('title="Ask your super user."', $html);
        self::assertStringContainsString('data-fwpromo-demo="1"', $html);
    }

    /** Variables of an older caller without these keys: external links in a new tab, no note, no demo. */
    public function test_without_the_newer_keys_the_old_behaviour_stays(): void
    {
        $html = $this->render([]);

        self::assertStringContainsString('target="_blank" rel="noopener"', $html);
        self::assertSame(1, preg_match('/<a class="fwpromo-line__link"[^>]*>/', $html, $link));
        self::assertStringNotContainsString(' title="', $link[0], 'no note on the link');
        self::assertStringNotContainsString('data-fwpromo-demo', $html);
    }
}
