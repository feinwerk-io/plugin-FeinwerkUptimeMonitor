<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * At least English, German, French, Spanish and Italian (Peter, 2026-11-19: "bitte alle Plugins mindestens in
 * französisch, spanisch, italienisch, deutsch, englisch ausliefern"): every language file holds the keys of en.json in
 * its order (alphabetical), with the same placeholders, without en or em dashes and without URLs.
 *
 * @group FeinwerkUptimeMonitor
 */
class LanguageFilesTest extends TestCase
{
    private const LANGUAGES = ['en', 'de', 'fr', 'es', 'it'];

    /** @return array<string, string> */
    private static function texts(string $language): array
    {
        $path = __DIR__ . '/../../lang/' . $language . '.json';
        self::assertFileExists($path, "lang/$language.json is missing");
        $data = json_decode((string) file_get_contents($path), true);
        self::assertIsArray($data, "lang/$language.json is no JSON object");
        self::assertSame(['FeinwerkUptimeMonitor'], array_keys($data), "lang/$language.json: one section, the plugin's");

        return $data['FeinwerkUptimeMonitor'];
    }

    /** @return string[] the placeholders of a text, sorted */
    private static function placeholders(string $text): array
    {
        preg_match_all('/%(?:\d+\$)?s/', $text, $m);
        $found = $m[0];
        sort($found);

        return $found;
    }

    public function test_englishKeys_areSortedAlphabetically(): void
    {
        $keys = array_keys(self::texts('en'));
        $sorted = $keys;
        sort($sorted, SORT_STRING);

        $this->assertSame($sorted, $keys);
    }

    public function test_everyLanguage_hasTheKeysOfEnglishInTheirOrder(): void
    {
        $english = array_keys(self::texts('en'));
        foreach (self::LANGUAGES as $language) {
            $this->assertSame($english, array_keys(self::texts($language)), $language);
        }
    }

    /**
     * Exactly the placeholders of en.json, no exception: a translation with an extra %s shows it literally wherever a
     * caller passes no value (kit addendum PageFilterReport 81e3ae1).
     */
    public function test_everyText_keepsThePlaceholdersOfEnglish(): void
    {
        $english = self::texts('en');
        foreach (self::LANGUAGES as $language) {
            foreach (self::texts($language) as $key => $text) {
                $found = self::placeholders($text);
                $this->assertSame(self::placeholders($english[$key]), $found, "$language: $key");
                $this->assertNotSame('', trim($text), "$language: $key is empty");
            }
        }
    }

    /**
     * Documented exceptions to "no URL" (docs/translations.md): the schemes an admin has to type in an address, not links.
     */
    private const SCHEME_HINTS = ['ErrorUrl', 'ErrorHost', 'UiAdminHttpsRedirect', 'UiAdminHttpsRedirectHint', 'UiAdminHttpsTrackerAddress'];

    public function test_noText_hasADashOrAUrl(): void
    {
        foreach (self::LANGUAGES as $language) {
            foreach (self::texts($language) as $key => $text) {
                $this->assertSame(0, preg_match('/[\x{2013}\x{2014}]/u', $text), "$language: $key has an en or em dash");
                if (in_array($key, self::SCHEME_HINTS, true)) {
                    $this->assertSame(0, preg_match('~https?://[A-Za-z0-9]~', $text), "$language: $key names a scheme, never a link");
                    continue;
                }
                $this->assertStringNotContainsString('http', $text, "$language: $key has a URL");
            }
        }
    }
}
