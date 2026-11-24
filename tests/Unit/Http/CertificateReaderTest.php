<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Http;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\CertificateReader;

/**
 * @group FeinwerkUptimeMonitor
 */
class CertificateReaderTest extends TestCase
{
    public function test_parsesExpireDateOfTheLeafCertificate(): void
    {
        // shape of curl_getinfo($handle, CURLINFO_CERTINFO) with the OpenSSL backend: leaf first, then the chain
        $certinfo = [
            ['Subject' => 'CN = matomo.example.com', 'Start date' => 'Jan 10 00:00:00 2026 GMT', 'Expire date' => 'Apr 10 23:59:59 2026 GMT'],
            ['Subject' => 'CN = R11', 'Expire date' => 'Mar 12 23:59:59 2027 GMT'],
        ];
        $this->assertSame('2026-04-10', CertificateReader::fromCurlCertInfo($certinfo));
    }

    public function test_emptyOrBroken_isNull(): void
    {
        $this->assertNull(CertificateReader::fromCurlCertInfo([]));
        $this->assertNull(CertificateReader::fromCurlCertInfo([['Subject' => 'x']]));
        $this->assertNull(CertificateReader::fromCurlCertInfo([['Expire date' => 'not a date']]));
    }

    public function test_fromX509Data_usesValidToTimestamp(): void
    {
        $this->assertSame('2027-03-12', CertificateReader::fromParsedX509(['validTo_time_t' => gmmktime(12, 0, 0, 3, 12, 2027)]));
        $this->assertNull(CertificateReader::fromParsedX509([]));
    }
}
