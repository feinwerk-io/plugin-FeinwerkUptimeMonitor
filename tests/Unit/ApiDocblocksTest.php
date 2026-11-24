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
 * Every public API method explains itself to people and AI clients (house rule docs/ai-mcp.md): a first sentence,
 * one described @param per parameter, an @return. No public static method (Matomo would offer it over HTTP).
 * Reads API.php as text: the unit tests load no Matomo code.
 *
 * @group FeinwerkUptimeMonitor
 */
class ApiDocblocksTest extends TestCase
{
    private static function source(): string
    {
        return (string) file_get_contents(dirname(__DIR__, 2) . '/API.php');
    }

    public function test_noPublicStaticMethods(): void
    {
        $this->assertDoesNotMatchRegularExpression('/public\s+static\s+function/', self::source());
    }

    public function test_everyPublicMethodIsDocumented(): void
    {
        preg_match_all('~/\*\*((?:(?!\*/).)*)\*/\s*public\s+function\s+(\w+)\(([^)]*)\)~s', self::source(), $methods, PREG_SET_ORDER);
        $this->assertGreaterThanOrEqual(13, count($methods));
        foreach ($methods as [, $doc, $name, $params]) {
            $lines = array_map(static fn(string $l): string => trim(ltrim(trim($l), '*')), explode("\n", $doc));
            $text = implode(' ', array_filter($lines, static fn(string $l): bool => $l !== '' && $l[0] !== '@'));
            $this->assertMatchesRegularExpression('/^[A-Z].{20,}[.:]/', $text, "$name: first sentence");
            preg_match_all('/\$(\w+)/', $params, $names);
            foreach ($names[1] as $param) {
                $this->assertMatchesRegularExpression('/@param\s+\S+\s+\$' . $param . '\s+\S.{5,}/', $doc, "$name: @param \$$param with a description");
            }
            $this->assertMatchesRegularExpression('/@return\s+\S+\s+\S/', $doc, "$name: @return with type and shape");
        }
    }
}
