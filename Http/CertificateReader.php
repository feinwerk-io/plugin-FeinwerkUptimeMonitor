<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Http;

/**
 * Expiry date (`notAfter`, UTC `Y-m-d`) of a server's TLS certificate: from curl's certificate info, or, where curl
 * gives none (other TLS backends, a reused connection), from a TLS handshake of its own.
 */
final class CertificateReader
{
    /**
     * @param array $certinfo curl_getinfo($handle, CURLINFO_CERTINFO): the leaf certificate first
     */
    public static function fromCurlCertInfo(array $certinfo): ?string
    {
        $leaf = $certinfo[0] ?? null;
        if (!is_array($leaf) || empty($leaf['Expire date'])) {
            return null;
        }
        $time = strtotime((string) $leaf['Expire date']);

        return $time === false ? null : gmdate('Y-m-d', $time);
    }

    /**
     * @param array $parsed openssl_x509_parse() of the leaf certificate
     */
    public static function fromParsedX509(array $parsed): ?string
    {
        return isset($parsed['validTo_time_t']) ? gmdate('Y-m-d', (int) $parsed['validTo_time_t']) : null;
    }

    /**
     * Opens a TLS connection to the given address (already checked by the guard) and reads the leaf certificate. Null
     * also where the host disabled a function this needs (Capabilities::canHandshake()).
     *
     * @param Capabilities|null $capabilities the PHP functions there are; default PHP's function_exists
     */
    public static function fromHandshake(string $host, string $ip, int $port, float $timeoutSeconds = 5.0, ?Capabilities $capabilities = null): ?string
    {
        if (!($capabilities ?? new Capabilities())->canHandshake()) {
            return null;
        }
        $address = filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? "[$ip]" : $ip;
        $context = stream_context_create(['ssl' => [
            'capture_peer_cert' => true,
            'peer_name' => $host,
            'SNI_enabled' => true,
            'verify_peer' => false, // the date is wanted even from a certificate that no longer verifies
            'verify_peer_name' => false,
        ]]);
        $socket = @stream_socket_client("ssl://$address:$port", $errno, $errstr, $timeoutSeconds, STREAM_CLIENT_CONNECT, $context);
        if ($socket === false) {
            return null;
        }
        $params = stream_context_get_params($socket);
        fclose($socket);
        $cert = $params['options']['ssl']['peer_certificate'] ?? null;
        if ($cert === null) {
            return null;
        }
        $parsed = openssl_x509_parse($cert);

        return is_array($parsed) ? self::fromParsedX509($parsed) : null;
    }
}
