<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Http;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Capabilities;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\CertificateReader;
use Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures\DisabledFunctions;

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

    /**
     * Audit T7: on a 32-bit PHP validTo_time_t overflows for dates from 2038 on; the date string openssl_x509_parse()
     * gives as well (UTCTime YYMMDDHHMMSSZ, from 2050 GeneralizedTime YYYYMMDDHHMMSSZ) is read first.
     */
    public function test_fromX509Data_readsTheDateString_first(): void
    {
        $this->assertSame('2026-12-27', CertificateReader::fromParsedX509(['validTo' => '261227112800Z', 'validTo_time_t' => 0]));
        $this->assertSame('2051-01-01', CertificateReader::fromParsedX509(['validTo' => '20510101000000Z', 'validTo_time_t' => -1]),
            'after 2038, where a 32-bit time overflows');
        $this->assertSame('1999-06-30', CertificateReader::fromParsedX509(['validTo' => '990630000000Z']), 'UTCTime 50 to 99 is 19xx');
        $this->assertSame('2027-03-12', CertificateReader::fromParsedX509(['validTo' => 'garbage', 'validTo_time_t' => gmmktime(12, 0, 0, 3, 12, 2027)]),
            'an unreadable string: the timestamp');
    }

    /** Whether a certificate is valid at a moment (UTC YmdHis), from its date strings: the stream transport's diagnosis. */
    public function test_isCurrent_comparesTheDateStrings(): void
    {
        $parsed = ['validFrom' => '261101000000Z', 'validTo' => '261227112800Z'];
        $this->assertTrue(CertificateReader::isCurrent($parsed, '20261127120000'));
        $this->assertFalse(CertificateReader::isCurrent($parsed, '20261227112801'), 'expired a second ago');
        $this->assertFalse(CertificateReader::isCurrent($parsed, '20261031235959'), 'not yet valid');
        $this->assertTrue(CertificateReader::isCurrent(['validFrom' => '20500101000000Z', 'validTo' => '20510101000000Z'], '20500601000000'));
        $this->assertNull(CertificateReader::isCurrent(['validTo' => '261227112800Z'], '20261127120000'), 'no start: cannot tell');
    }

    /** The handshake of its own needs these functions; without one of them no date, and no call to a missing function. */
    public function test_handshake_withoutItsFunctions_isNoDate(): void
    {
        foreach (['stream_context_create', 'stream_socket_client', 'stream_context_get_params', 'openssl_x509_parse'] as $function) {
            $this->assertNull(CertificateReader::fromHandshake('localhost', '127.0.0.1', 1, 0.5, new Capabilities(DisabledFunctions::except([$function]))), $function);
        }
        $this->assertNull(CertificateReader::fromHandshake('localhost', '127.0.0.1', 1, 0.5, new Capabilities(DisabledFunctions::except(DisabledFunctions::SHARED_HOST))),
            'the customer\'s host: nothing listening there');
    }
}
