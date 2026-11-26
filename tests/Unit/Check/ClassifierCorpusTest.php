<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Check;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\ProbeResponse;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\ResponseClassifier;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Prober;

/**
 * Sample answers shared with the outside check service (feinwerk-uptime keeps a byte-identical copy of
 * `tests/Fixtures/classifier-corpus.json`): its classifier and this one must turn every case into the same outcome,
 * error and note. A case's body is `pad_before` times "x" followed by `body`, cut to what the prober keeps (and then
 * marked as capped).
 *
 * @group FeinwerkUptimeMonitor
 */
class ClassifierCorpusTest extends TestCase
{
    private const FIRST_UP = '2026-03-01 00:00:00';
    private const NOW = '2026-03-14 10:00:00';

    private static function corpus(): array
    {
        $json = (string) file_get_contents(__DIR__ . '/../../Fixtures/classifier-corpus.json');

        return json_decode($json, true, 512, JSON_THROW_ON_ERROR);
    }

    public function test_everyCorpusCase_classifiesAsExpected(): void
    {
        $cases = self::corpus()['cases'];
        $this->assertGreaterThan(50, count($cases));
        $classifier = new ResponseClassifier();
        foreach ($cases as $case) {
            $kind = $case['target']['kind'];
            $target = new Target(
                7,
                in_array($kind, Kind::INSTANCE, true) ? 0 : 1,
                $kind,
                $kind,
                $case['target']['url'],
                $case['target']['url_source'],
                $case['target']['extra'],
                $case['target']['first_up'] ? self::FIRST_UP : null
            );
            $cap = in_array($kind, [Kind::UI, Kind::CONTAINER], true) ? Prober::MAX_BODY_LARGE : Prober::MAX_BODY;
            $whole = str_repeat('x', $case['response']['pad_before']) . $case['response']['body'];
            $response = new ProbeResponse(
                $case['response']['status'],
                substr($whole, 0, $cap),
                $case['response']['error'],
                $case['response']['final_url'],
                ['dns' => 0, 'connect' => 0, 'tls' => 0, 'ttfb' => 0, 'total' => 0],
                null,
                0,
                // the prober stops reading past its cap (the service's scan: BodyFacts.capped)
                $case['response']['error'] === null && strlen($whole) > $cap
            );
            $result = $classifier->classify($target, $response, self::NOW);
            $this->assertSame(
                $case['expect'],
                ['outcome' => $result->outcome, 'error' => $result->error, 'note' => $result->note],
                $case['name']
            );
        }
    }

    public function test_markers_areTheClassifiersConstants(): void
    {
        $this->assertSame([
            'tracker' => ResponseClassifier::MARKER_TRACKER,
            'js' => ResponseClassifier::MARKER_JS,
            'login' => ResponseClassifier::MARKER_LOGIN,
            'proxy_error' => ResponseClassifier::MARKER_PROXY_ERROR,
        ], self::corpus()['markers']);
    }
}
