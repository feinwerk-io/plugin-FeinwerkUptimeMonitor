<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Http;

/**
 * The CA file the checks verify certificates with, in the order of Matomo's own curl requests
 * (core Http::configCurlCertificate, the same at 5.0.0 and 6.0.0): [General] custom_cacert_pem when it is set, else
 * Matomo's bundled cacert.pem (composer/ca-bundle, CaBundle::getBundledCaBundlePath()). Unlike Matomo, a file this PHP
 * cannot read (missing, or outside open_basedir) is skipped, and without any file the server's own trust store
 * verifies (libcurl's default, php.ini curl.cainfo).
 *
 * With the bundle, a verification that fails for a trust anchor problem (the bundle lacks the certificate's issuer,
 * or the certificate or its root is self-signed and not in the bundle) is tried once more with the server's trust store
 * (secondTry()): an internal CA or a self-signed certificate installed only there keeps working as in 5.3.3. An
 * expired, not yet valid, revoked or wrongly named certificate whose issuer the bundle knows is a TLS error at once,
 * with one handshake: no trust store changes that (L8 review of 5.4.0, SHOULD 2, and its trust anchor correction). The
 * second try verifies as strictly as the first (peer and host name). A custom_cacert_pem is the administrator's
 * explicit choice and is used alone, as Matomo does. Verification is never switched off.
 */
final class TrustFile
{
    /** curl: the peer's certificate did not verify, and the CA file could not be loaded */
    private const CURLE_PEER_FAILED_VERIFICATION = 60;
    private const CURLE_SSL_CACERT_BADFILE = 77;
    /**
     * OpenSSL's verify results (CURLINFO_SSL_VERIFYRESULT) that mean "the CA file holds no trust anchor for it", which
     * another trust store may hold: X509_V_ERR_UNABLE_TO_GET_ISSUER_CERT (2), DEPTH_ZERO_SELF_SIGNED_CERT (18, a
     * self-signed certificate), SELF_SIGNED_CERT_IN_CHAIN (19, an internal root sent along),
     * UNABLE_TO_GET_ISSUER_CERT_LOCALLY (20), UNABLE_TO_VERIFY_LEAF_SIGNATURE (21), CERT_UNTRUSTED (27, a root not
     * trusted for TLS servers). Not: CERT_NOT_YET_VALID (9), CERT_HAS_EXPIRED (10), CERT_REVOKED (23), CERT_REJECTED
     * (28), HOSTNAME_MISMATCH (62), nor 1, which curl leaves after its own host name check (and before any verification).
     * The number, not curl_error()'s text: OpenSSL's wording changes between versions ("self signed" in 1.1.1,
     * "self-signed" in 3.0), the numbers do not, and curl_multi and curl_exec give the same.
     */
    private const TRUST_ANCHOR_MISSING = [2, 18, 19, 20, 21, 27];
    /** TLS libraries whose verify results are OpenSSL's X509_V_ERR codes */
    private const OPENSSL_FAMILY = '/^(OpenSSL|LibreSSL|BoringSSL|quictls|AWS-LC)\b/i';

    /**
     * Whether a transfer that failed with Matomo's bundle is tried once more with the server's trust store: when curl
     * could not load the bundle (77), or the certificate did not verify (60) for a trust anchor problem (OpenSSL's
     * verify results 2, 18, 19, 20, 21, 27: TRUST_ANCHOR_MISSING). Not for an expired, not yet valid, revoked or wrongly
     * named certificate. With a TLS library that gives no OpenSSL verify results (GnuTLS, Schannel, Secure Transport,
     * mbedTLS, wolfSSL) every verification failure is tried once more, as the reason cannot be told. The prober then
     * uses the trust store for that host for the rest of the run.
     *
     * @param int $curlError curl's error number of the transfer
     * @param int $verifyResult CURLINFO_SSL_VERIFYRESULT of the transfer
     * @param string $tlsLibrary curl_version()'s ssl_version, e.g. "OpenSSL/3.0.13"; in a build with several TLS
     *                           libraries those in parentheses are not in use
     */
    public static function secondTry(int $curlError, int $verifyResult, string $tlsLibrary): bool
    {
        if ($curlError === self::CURLE_SSL_CACERT_BADFILE) {
            return true;
        }
        if ($curlError !== self::CURLE_PEER_FAILED_VERIFICATION) {
            return false;
        }
        $active = trim((string) preg_replace('/\([^)]*\)/', '', $tlsLibrary));

        return !preg_match(self::OPENSSL_FAMILY, $active) || in_array($verifyResult, self::TRUST_ANCHOR_MISSING, true);
    }

    /**
     * @param string|null $custom [General] custom_cacert_pem ('' or null: not set)
     * @param string|null $bundled Matomo's bundled cacert.pem, null when there is none
     * @param \Closure|null $readable (string $path): bool, default self::readable() (tests)
     * @return array{0: ?string, 1: bool} the file (null: the server's trust store) and whether a failed verification
     *               is tried once more with the server's trust store
     */
    public static function choose(?string $custom, ?string $bundled, ?\Closure $readable = null): array
    {
        $readable ??= static fn(string $path): bool => self::readable($path);
        if ($custom !== null && $custom !== '' && $readable($custom)) {
            return [$custom, false];
        }
        if ($bundled !== null && $bundled !== '' && $readable($bundled)) {
            return [$bundled, true];
        }

        return [null, false];
    }

    /** Whether this PHP can read the file; without a warning for a path outside open_basedir. */
    public static function readable(string $path): bool
    {
        return @is_file($path) && @is_readable($path);
    }
}
