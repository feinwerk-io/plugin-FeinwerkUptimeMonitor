<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Targets;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\DetectedTargets;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\Detector;

/**
 * @group FeinwerkUptimeMonitor
 */
class DetectorTest extends TestCase
{
    private static function detect(string $fixture, string $pageUrl = 'https://www.shop.example/'): DetectedTargets
    {
        $html = (string) file_get_contents(dirname(__DIR__, 2) . '/Fixtures/html/' . $fixture . '.html');
        return (new Detector())->detect($html, $pageUrl);
    }

    public function test_standardSnippet(): void
    {
        $d = self::detect('standard');
        $this->assertSame('https://matomo.example.com/matomo.php', $d->trackerUrl);
        $this->assertSame('https://matomo.example.com/matomo.js', $d->jsUrl);
        $this->assertSame([], $d->containerUrls);
    }

    public function test_protocolRelative_takesThePageScheme(): void
    {
        $this->assertSame('http://matomo.example.com/matomo.php', self::detect('standard', 'http://www.shop.example/')->trackerUrl);
    }

    public function test_renamedTracker(): void
    {
        $d = self::detect('renamed');
        $this->assertSame('https://matomo.example.com/js/tracker.php', $d->trackerUrl);
        $this->assertSame('https://matomo.example.com/js/tracker.js', $d->jsUrl);
    }

    public function test_proxySnippet(): void
    {
        $d = self::detect('proxy');
        $this->assertSame('https://www.shop.example/matomo.php', $d->trackerUrl);
        $this->assertSame('https://www.shop.example/matomo.php', $d->jsUrl);
    }

    public function test_tagManagerEmbed(): void
    {
        $d = self::detect('tagmanager');
        $this->assertNull($d->trackerUrl);
        $this->assertNull($d->jsUrl);
        $this->assertSame([
            'AbC123' => 'https://matomo.example.com/js/container_AbC123.js',
            'XyZ789' => 'https://matomo.example.com/js/container_XyZ789_dev_0123456789abcdef01234567.js',
        ], $d->containerUrls);
    }

    public function test_noSnippet_findsNothing(): void
    {
        $d = self::detect('none');
        $this->assertNull($d->trackerUrl);
        $this->assertNull($d->jsUrl);
        $this->assertSame([], $d->containerUrls);
        $this->assertTrue($d->isEmpty());
    }

    public function test_relativePath_resolvedAgainstThePage(): void
    {
        $d = (new Detector())->detect("<script>var u='/stats/';_paq.push(['setTrackerUrl', u+'matomo.php']);g.src=u+'matomo.js';</script>", 'https://www.shop.example/de/start');
        $this->assertSame('https://www.shop.example/stats/matomo.php', $d->trackerUrl);
        $this->assertSame('https://www.shop.example/stats/matomo.js', $d->jsUrl);
    }
}
