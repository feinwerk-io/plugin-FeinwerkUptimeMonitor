<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration;

use Composer\CaBundle\CaBundle;
use Piwik\Config;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\CheckRunner;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;

/**
 * Audit R2: the checks take the CA file Matomo's own curl requests take (core Http::configCurlCertificate):
 * [General] custom_cacert_pem when set, else Matomo's bundled cacert.pem; no longer the server's trust store alone.
 *
 * @group FeinwerkUptimeMonitor
 */
class TrustFileTest extends IntegrationTestCase
{
    private array $general = [];

    public function setUp(): void
    {
        parent::setUp();
        $this->general = Config::getInstance()->General;
    }

    public function tearDown(): void
    {
        Config::getInstance()->General = $this->general;
        parent::tearDown();
    }

    private static function customCaFile(string $path): void
    {
        $general = Config::getInstance()->General;
        $general['custom_cacert_pem'] = $path;
        Config::getInstance()->General = $general;
    }

    public function test_byDefault_MatomosBundledFile_withTheServersTrustStoreAsSecondTry(): void
    {
        self::customCaFile('');
        $bundle = CaBundle::getBundledCaBundlePath();
        $this->assertFileExists($bundle);
        $this->assertSame([$bundle, true], CheckRunner::trust());
    }

    public function test_customCacertPem_alone_whenThisPhpCanReadIt(): void
    {
        $custom = tempnam(sys_get_temp_dir(), 'fwum-ca');
        try {
            self::customCaFile($custom);
            $this->assertSame([$custom, false], CheckRunner::trust());
            self::customCaFile($custom . '.missing');
            $this->assertSame([CaBundle::getBundledCaBundlePath(), true], CheckRunner::trust(), 'a file that is not there: the bundle');
        } finally {
            unlink($custom);
        }
    }
}
