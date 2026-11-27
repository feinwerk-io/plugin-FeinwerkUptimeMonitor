<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Http;

use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;

/**
 * One GET through PHP's own streams, for hosts without curl (the extension missing, or curl_exec and curl_multi_exec
 * both disabled), with what the curl ways guarantee:
 *
 * - connected only to the addresses the guard approved (stream_socket_client to the IP literal, each address in turn,
 *   a dead one getting half of the connect time that is left, as curl gives it); Host, SNI, the certificate's name and
 *   a proxy's CONNECT carry the guard's ASCII host; only http and https; Matomo's [proxy] only when Prober says so:
 *   CONNECT with Basic Proxy-Authorization for https, the absolute URI for http
 * - TLS 1.2 and 1.3 with verify_peer and verify_peer_name, the given CA file or else PHP's default (openssl.cafile,
 *   openssl.capath, the system store), the peer certificate captured for its expiry date. A verification that fails
 *   with Matomo's bundle is diagnosed when Prober asks ($diagnose): PHP gives no OpenSSL verify result, so a second
 *   connection reads the server's certificate without verifying and sends nothing. A certificate outside its dates is a
 *   TLS error at once (OpenSSL's 9 and 10), any other failure a trust anchor problem (TrustFile's 2, 18, 19, 20, 21, 27):
 *   Prober tries once more with the server's trust store, as strictly. A wrong name is told by PHP's own check after a
 *   finished handshake (the certificate was captured), never retried.
 * - HTTP/1.1 with the curl ways' User-Agent, Accept and Cache-Control, Connection: close, Accept-Encoding gzip and
 *   deflate only where zlib's inflate is there; interim answers skipped, chunked and Content-Length framing, gzip and
 *   deflate (zlib or raw) decoded piece by piece, the body cap on the decoded bytes, the head limited to 300 KB (a line
 *   to 100 KB, as curl) and 2000 header lines, of which only the fields it reads are kept; Prober::KEPT_HEADERS of the
 *   final answer, the first Location.
 * - the connect time (TCP, TLS and CONNECT) and the check's whole time hold: the handshake runs without blocking under
 *   stream_select, every read and write waits only for what is left (under a millisecond left is a timeout, never a
 *   stream timeout of 0 and 0, streamTimeout()), and a read or write that moved nothing after the deadline is a timeout.
 * - errors as the curl ways map curl's: connect, tls, timeout, proxy, protocol (curl's 1, 18, 27, 52, 56, 61).
 *
 * Every function it calls beyond fwrite, fread, feof, fclose and set_error_handler is checked first (Capabilities:
 * STREAMS with restore_error_handler, STREAM_TLS, INFLATE); Prober takes this way only when they are there.
 *
 * What the streams cannot measure as curl does: the connect time includes PHP's socket setup, the first byte is the end
 * of the first read that returned data, and with a proxy the tls time includes the CONNECT exchange (as curl's
 * appconnect time does).
 */
final class StreamTransport
{
    private const READ = 8192;
    /** curl refuses a header line over 100 KB and a head over 300 KB (also counting interim answers) */
    private const MAX_HEADER_LINE = 102400;
    private const MAX_HEAD = 307200;
    /**
     * header lines in all (interim answers too), as Node.js counts a response's headers: no website sends more, and the
     * lines are counted before anything is built (curl 7.74 has no such limit and reads them)
     */
    private const MAX_HEADER_LINES = 2000;
    /** the fields answer() reads besides Prober::KEPT_HEADERS; every other field is skipped while the head is read */
    private const FRAMING_HEADERS = ['location', 'content-length', 'content-encoding', 'transfer-encoding'];
    private const MAX_CHUNK_LINE = 16384;
    /** compressed bytes per inflate_add(): at most about 1 MB out of each (deflate's limit is about 1032 to 1) */
    private const INFLATE_SLICE = 1024;
    /** the longest wait of one stream_select() during the handshake (it may also wait to write) */
    private const HANDSHAKE_SLICE = 0.2;

    private const CRYPTO = STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;

    /** @var resource|null */
    private $socket = null;
    private string $buffer = '';
    private float $deadline = 0.0;
    private ?float $firstByte = null;
    /** the body's sink took no more: capped, or its encoding broken */
    private bool $stopped = false;
    /** @var \Closure(): float */
    private \Closure $clock;

    /**
     * @param array $proxy Matomo's [proxy] settings: host, port, username, password
     * @param \Closure|null $clock (): float, the time in seconds; default microtime(true) (tests)
     */
    public function __construct(private Capabilities $capabilities, private string $userAgent, private array $proxy, ?\Closure $clock = null)
    {
        $this->clock = $clock ?? static fn(): float => microtime(true);
    }

    private function now(): float
    {
        return ($this->clock)();
    }

    /**
     * @param string $url the URL with the guard's host (Prober::withHost())
     * @param GuardDecision $decision the guard's decision: host, port and the approved addresses
     * @param bool $proxied through Matomo's [proxy] (Prober::usesProxyFor())
     * @param string|null $caFile the CA file to verify with; null: PHP's default (the server's trust store)
     * @param bool $diagnose tell a trust anchor problem from a certificate error when the verification fails
     * @param int $connectMs the time for the connection (TCP, a proxy's CONNECT and the handshake)
     * @param int $totalMs the time for the whole transfer
     * @param int $cap the most bytes of the decoded body kept
     */
    public function fetch(string $url, GuardDecision $decision, bool $proxied, ?string $caFile, bool $diagnose, int $connectMs, int $totalMs, int $cap): StreamResult
    {
        $start = $this->now();
        $this->deadline = $start + $totalMs / 1000;
        $connectBy = min($this->deadline, $start + $connectMs / 1000);
        $this->buffer = '';
        $this->firstByte = null;
        $this->stopped = false;
        $ms = static fn(?float $at): int => $at === null ? 0 : max(0, (int) round(($at - $start) * 1000));
        $parts = parse_url($url);
        $scheme = is_array($parts) ? strtolower((string) ($parts['scheme'] ?? '')) : '';
        if (!in_array($scheme, ['http', 'https'], true) || $decision->host === '') {
            return new StreamResult(Outcome::BLOCKED);
        }
        $https = $scheme === 'https';
        $ssl = ['verify_peer' => true, 'verify_peer_name' => true, 'allow_self_signed' => false, 'peer_name' => $decision->host,
            'SNI_enabled' => true, 'capture_peer_cert' => true, 'crypto_method' => self::CRYPTO, 'disable_compression' => true]
            + ($caFile !== null ? ['cafile' => $caFile] : []);

        try {
            $tcp = null;
            $error = $this->open($decision, $proxied, $https, $https ? $ssl : [], $connectBy, $tcp);
            if ($error !== null) {
                return new StreamResult($error, null, '', false, [], null, $ms($tcp), 0, 0, $ms($this->now()));
            }
            $tls = null;
            $cert = null;
            if ($https) {
                $failure = $this->handshake($connectBy);
                $cert = $this->peerDate();
                $tls = $this->now();
                if ($failure !== null) {
                    $trustAnchor = false;
                    $lost = 0;
                    $error = $failure === 'timeout' ? Outcome::TIMEOUT : Outcome::TLS;
                    if ($failure === 'cafile') {
                        // the CA file could not be loaded (curl's 77): the server's trust store may verify
                        $trustAnchor = $diagnose;
                    } elseif ($failure === 'verify' && $diagnose) {
                        $this->close();
                        $before = $this->now();
                        [$trustAnchor, $diagnosed] = $this->diagnose($decision, $proxied, $connectBy);
                        $cert ??= $diagnosed;
                        $lost = $ms($this->now()) - $ms($before);
                        if ($trustAnchor === null) {
                            [$trustAnchor, $error] = [false, Outcome::TIMEOUT];
                        }
                    }

                    return new StreamResult($error, null, '', false, [], null, $ms($tcp), max(0, $ms($tls) - $ms($tcp)), 0, $ms($tls),
                        $cert, $trustAnchor, $lost);
                }
            }
            $connect = $ms($tcp);
            $tlsMs = $https ? max(0, $ms($tls) - $connect) : 0;

            $error = $this->send($this->request($parts, $decision, $proxied && !$https));
            if ($error === null) {
                $answer = $this->answer($cap, $proxied);
                $error = $answer['error'];
            }
            $total = $ms($this->now());
            if ($error !== null) {
                return new StreamResult($error, null, '', false, [], null, $connect, $tlsMs, $ms($this->firstByte), $total, $cert);
            }

            return new StreamResult(null, $answer['status'], $answer['body'], $answer['capped'], $answer['headers'], $answer['location'],
                $connect, $tlsMs, $ms($this->firstByte), $total, $cert);
        } finally {
            $this->close();
        }
    }

    /**
     * Connects to the approved addresses (or Matomo's proxy, with CONNECT for https) and leaves the socket open.
     *
     * @param float|null $tcp set to when the TCP connection stood
     * @return string|null an Outcome error, null when connected
     */
    private function open(GuardDecision $decision, bool $proxied, bool $https, array $ssl, float $connectBy, ?float &$tcp): ?string
    {
        $context = stream_context_create($ssl !== [] ? ['ssl' => $ssl] : []);
        if ($proxied) {
            $host = (string) $this->proxy['host'];
            $addresses = [filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? '[' . $host . ']' : $host];
            $port = (int) $this->proxy['port'];
        } else {
            // the approved addresses only: never a name PHP would look up itself
            $addresses = array_map(static fn(string $ip): string => filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? '[' . $ip . ']' : $ip,
                array_values(array_filter($decision->ips, static fn($ip): bool => is_string($ip) && filter_var($ip, FILTER_VALIDATE_IP) !== false)));
            $port = $decision->port;
        }
        $count = count($addresses);
        foreach ($addresses as $i => $address) {
            $left = $connectBy - $this->now();
            if ($left <= 0) {
                break;
            }
            // as curl: each address but the last gets half of what is left, so that a dead one leaves time for the next
            $wait = $i === $count - 1 ? $left : $left / 2;
            $socket = self::quietly(static fn() => stream_socket_client('tcp://' . $address . ':' . $port, $errno, $errstr, $wait, STREAM_CLIENT_CONNECT, $context));
            if (is_resource($socket)) {
                $this->socket = $socket;
                $tcp = $this->now();
                break;
            }
        }
        if ($this->socket === null) {
            return $proxied ? Outcome::PROXY : Outcome::CONNECT;
        }
        if (!$proxied || !$https) {
            return null;
        }

        // the tunnel: CONNECT to the guard's host and port, within the connect time
        $target = self::authority($decision->host, $decision->port, null);
        $saved = $this->deadline;
        $this->deadline = $connectBy;
        $error = $this->send("CONNECT $target HTTP/1.1\r\nHost: $target\r\nUser-Agent: {$this->userAgent}\r\n" . $this->proxyAuthorization() . "\r\n");
        $head = $error === null ? $this->head() : null;
        $this->deadline = $saved;
        if (is_array($head) && $head['status'] >= 200 && $head['status'] < 300 && $this->buffer === '') {
            $this->firstByte = null;
            return null;
        }
        // a refusal, or bytes after the proxy's answer before anything was asked (a broken proxy): never taken for the
        // target's answer

        return $head === 'timeout' || $error === Outcome::TIMEOUT ? Outcome::TIMEOUT : Outcome::PROXY;
    }

    /**
     * The TLS handshake on the open socket without blocking, so that $by holds.
     *
     * @return string|null null when done; else timeout, name (PHP's name check after a finished handshake), cafile (the
     *                     CA file could not be loaded) or verify (the handshake failed: verification or protocol)
     */
    private function handshake(float $by): ?string
    {
        stream_set_blocking($this->socket, false);
        try {
            while (true) {
                $message = '';
                $done = self::quietly(fn() => stream_socket_enable_crypto($this->socket, true, self::CRYPTO), $message);
                if ($done === true) {
                    return null;
                }
                if ($done === false) {
                    if ($this->peerCertificate() !== null && preg_match('/did not match|unable to locate peer certificate/i', $message)) {
                        // the chain verified (the certificate was captured after the handshake) and PHP's own check of
                        // the name refused it, in PHP's own words. Should a PHP capture it on a failed verification too,
                        // or word it otherwise, this is read as verify: one more connection, never a lost second try
                        return 'name';
                    }
                    // PHP's own words for a CA file it could not use ("failed loading cafile stream", "Unable to set
                    // verify locations"); OpenSSL's reason for a failed verification is not in its message
                    return preg_match('/cafile|verify locations/i', $message) ? 'cafile' : 'verify';
                }
                $left = $by - $this->now();
                if ($left <= 0) {
                    return 'timeout';
                }
                $read = [$this->socket];
                $write = $except = null;
                $wait = min($left, self::HANDSHAKE_SLICE);
                $selected = self::quietly(static fn() => stream_select($read, $write, $except, 0, (int) ($wait * 1000000)));
                if ($selected === false && $this->capabilities->has('usleep')) {
                    usleep(5000); // a select that fails at once (a signal) would spin until $by
                }
            }
        } finally {
            if (is_resource($this->socket)) {
                stream_set_blocking($this->socket, true);
            }
        }
    }

    /**
     * After a failed verification: the server's certificate read without verifying, on a connection of its own that
     * sends nothing. It only decides whether a second, equally strict try with the server's trust store follows. The
     * leaf's dates decide: an expired certificate sent along (an old cross-signed root) may not be in the path the trust
     * store builds, and the strict try finds out.
     *
     * @return array{0: ?bool, 1: ?string} whether it is a trust anchor problem (the leaf within its dates; null: the
     *                                     check's time ran out before it could tell), and the leaf's expiry date
     */
    private function diagnose(GuardDecision $decision, bool $proxied, float $connectBy): array
    {
        $tcp = null;
        // a moment of its own, within the check's time, also when the first try used up the connect time
        $by = min($this->deadline, max($connectBy, $this->now() + 1.0));
        $ssl = ['verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true, 'peer_name' => $decision->host,
            'SNI_enabled' => true, 'capture_peer_cert' => true, 'crypto_method' => self::CRYPTO];
        $failure = $this->open($decision, $proxied, true, $ssl, $by, $tcp) ?? $this->handshake($by);
        if ($failure !== null) {
            // the time ran out, as a second try would have; else no certificate to read and no certificate problem
            // either (a protocol the server refuses, a reset)
            return [$this->now() >= $by ? null : false, null];
        }
        $certificate = $this->peerCertificate();
        $parsed = $certificate !== null ? self::quietly(static fn() => openssl_x509_parse($certificate)) : false;
        if (!is_array($parsed)) {
            return [false, null];
        }

        // expired or not yet valid (OpenSSL's 10, 9): no trust store changes that
        return [CertificateReader::isCurrent($parsed, gmdate('YmdHis')) !== false, CertificateReader::fromParsedX509($parsed)];
    }

    /** @return mixed the captured peer certificate of the open socket, null without one */
    private function peerCertificate()
    {
        $params = is_resource($this->socket) ? self::quietly(fn() => stream_context_get_params($this->socket)) : false;

        return is_array($params) ? ($params['options']['ssl']['peer_certificate'] ?? null) : null;
    }

    /** the expiry date of the captured peer certificate (CertificateReader::fromParsedX509()) */
    private function peerDate(): ?string
    {
        $certificate = $this->peerCertificate();
        $parsed = $certificate !== null ? self::quietly(static fn() => openssl_x509_parse($certificate)) : false;

        return is_array($parsed) ? CertificateReader::fromParsedX509($parsed) : null;
    }

    /**
     * The request head: origin-form, or the absolute URI through a proxy for http; Host with a port only when it is not
     * the scheme's default (as curl).
     */
    private function request(array $parts, GuardDecision $decision, bool $absolute): string
    {
        $scheme = strtolower((string) $parts['scheme']);
        $host = self::authority($decision->host, $decision->port, $scheme);
        $target = self::encode((string) ($parts['path'] ?? '')) ?: '/';
        if (isset($parts['query'])) {
            $target .= '?' . self::encode((string) $parts['query']);
        }
        $headers = ['Host: ' . $host, 'User-Agent: ' . $this->userAgent, 'Accept: */*', 'Cache-Control: no-cache'];
        if ($this->capabilities->canInflate()) {
            $headers[] = 'Accept-Encoding: gzip, deflate';
        }
        $head = 'GET ' . ($absolute ? $scheme . '://' . $host . $target : $target) . " HTTP/1.1\r\n" . implode("\r\n", $headers) . "\r\n";
        if ($absolute) {
            $head .= $this->proxyAuthorization();
        }

        return $head . "Connection: close\r\n\r\n";
    }

    private function proxyAuthorization(): string
    {
        return empty($this->proxy['username']) ? ''
            : 'Proxy-Authorization: Basic ' . base64_encode($this->proxy['username'] . ':' . ($this->proxy['password'] ?? '')) . "\r\n";
    }

    /** host (an IPv6 address in brackets) and the port, without the scheme's default port (scheme null: always) */
    private static function authority(string $host, int $port, ?string $scheme): string
    {
        $authority = filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? '[' . $host . ']' : $host;
        $default = $scheme === null ? 0 : (['http' => 80, 'https' => 443][$scheme] ?? 0);

        return $port === $default ? $authority : $authority . ':' . $port;
    }

    /** bytes that may not stand in a request line (controls, space, DEL, non-ASCII) percent-encoded */
    private static function encode(string $part): string
    {
        return (string) preg_replace_callback('/[\x00-\x20\x7f-\xff]/', static fn(array $m): string => sprintf('%%%02X', ord($m[0])), $part);
    }

    /**
     * The stream_set_timeout() arguments for a read or write that may wait $left seconds: [seconds, microseconds], never
     * longer than $left; null under a millisecond, which is a timeout before the stream is touched. Never 0 and 0: PHP
     * then waits without any limit on a TLS stream (its openssl layer counts a timeout only when one of the two is set),
     * and not at all on plain TCP (an empty read that is no close by the server). Public for its unit test.
     *
     * @return array{0: int, 1: int}|null
     */
    public static function streamTimeout(float $left): ?array
    {
        if (!($left >= 0.001)) {
            return null;
        }

        return [(int) $left, (int) (fmod($left, 1.0) * 1000000)];
    }

    /** Sets the stream's timeout to what is left of the time; false (a timeout) when under a millisecond is left. */
    private function arm(): bool
    {
        $timeout = self::streamTimeout($this->deadline - $this->now());
        if ($timeout === null) {
            return false;
        }
        stream_set_timeout($this->socket, $timeout[0], $timeout[1]);

        return true;
    }

    /**
     * After a read or write that moved nothing: whether it ended for the time. PHP's own flag, or the time itself, as a
     * read that waited until the deadline is a timeout whatever PHP says about it.
     */
    private function timedOut(): bool
    {
        return stream_get_meta_data($this->socket)['timed_out'] || $this->now() >= $this->deadline;
    }

    /** @return string|null Outcome::TIMEOUT or PROTOCOL when the request could not be written, else null */
    private function send(string $data): ?string
    {
        while ($data !== '') {
            if (!$this->arm()) {
                return Outcome::TIMEOUT;
            }
            $written = self::quietly(fn() => fwrite($this->socket, $data));
            if (!is_int($written) || $written <= 0) {
                return $this->timedOut() ? Outcome::TIMEOUT : Outcome::PROTOCOL;
            }
            $data = (string) substr($data, $written);
        }

        return null;
    }

    /**
     * Reads more bytes into the buffer, waiting only for what is left of the time.
     *
     * @return string|null null when bytes came; else timeout, eof or error
     */
    private function fill(): ?string
    {
        if (!$this->arm()) {
            return 'timeout';
        }
        $data = self::quietly(fn() => fread($this->socket, self::READ));
        if (is_string($data) && $data !== '') {
            $this->firstByte ??= $this->now();
            $this->buffer .= $data;
            return null;
        }
        if ($this->timedOut()) {
            return 'timeout';
        }

        return $data === false ? 'error' : 'eof';
    }

    /**
     * The final answer's head, after any interim (1xx) ones.
     *
     * @return array{status: int, headers: list<array{0: string, 1: string}>}|string the head, or why there is none:
     *         timeout, error (the read failed), protocol (no HTTP answer, too large, closed early)
     */
    private function head()
    {
        $read = 0;
        $lines = 0;
        while (true) {
            $end = self::headEnd($this->buffer);
            if ($end === null) {
                if (strlen($this->buffer) >= 5 && strncasecmp($this->buffer, 'HTTP/', 5) !== 0) {
                    return 'protocol'; // HTTP/0.9 or no HTTP at all: curl refuses it
                }
                if ($read + strlen($this->buffer) > self::MAX_HEAD) {
                    return 'protocol';
                }
                $why = $this->fill();
                if ($why !== null) {
                    return $why === 'eof' ? 'protocol' : $why;
                }
                continue;
            }
            [$at, $length] = $end;
            $block = substr($this->buffer, 0, $at);
            $this->buffer = (string) substr($this->buffer, $at + $length);
            $read += $at + $length;
            if ($read > self::MAX_HEAD) {
                return 'protocol';
            }
            $head = self::parseHead($block, $lines);
            if ($head === null) {
                return 'protocol';
            }
            if ($head['status'] >= 100 && $head['status'] < 200) {
                continue; // an interim answer (100 Continue, 103 Early Hints): the final one follows
            }

            return $head;
        }
    }

    /**
     * One head without its empty line: the status and the fields answer() reads (Prober::KEPT_HEADERS and
     * FRAMING_HEADERS), every other field skipped as the lines are walked; an interim answer's fields are only counted.
     * A status line in lower case ("http/1.1 200 OK") is read as curl accepts it (curl 7.74 then reads 200 whatever the
     * code, this reads the code). A line that starts with a space or a tab continues the field before, its line end read
     * as a space (obs-fold, RFC 9112 5.2, as a user agent must), so it never stands as a field of its own; one after a
     * field that is not kept goes with that field, one before the first field is skipped (2.2). curl 7.74 reads such a
     * line on its own and never as a field.
     *
     * @param int $lines the header lines counted so far, also of interim answers; raised by this head's
     * @return array{status: int, headers: list<array{0: string, 1: string}>}|null null when broken: no status line, a line
     *         over MAX_HEADER_LINE, more than MAX_HEADER_LINES header lines in all
     */
    private static function parseHead(string $block, int &$lines): ?array
    {
        $size = strlen($block);
        $eol = strpos($block, "\n");
        $first = $eol === false ? $size : $eol;
        if ($first > self::MAX_HEADER_LINE
            || !preg_match('~^HTTP/\d(?:\.\d)? +(\d{3})(?:[ \t].*)?$~i', rtrim(substr($block, 0, $first), "\r"), $m)) {
            return null;
        }
        $status = (int) $m[1];
        $interim = $status >= 100 && $status < 200;
        $headers = [];
        $fold = null; // the kept field a continuation line goes on with
        for ($at = $first + 1; $at < $size; $at = $end + 1) {
            $end = strpos($block, "\n", $at);
            $end = $end === false ? $size : $end;
            if (++$lines > self::MAX_HEADER_LINES || $end - $at > self::MAX_HEADER_LINE) {
                return null;
            }
            if ($interim) {
                continue;
            }
            $line = substr($block, $at, $end - $at);
            if ($line !== '' && ($line[0] === ' ' || $line[0] === "\t")) {
                if ($fold !== null) {
                    $headers[$fold][1] = trim($headers[$fold][1] . ' ' . trim($line));
                    if (strlen($headers[$fold][1]) > self::MAX_HEADER_LINE) {
                        return null;
                    }
                }
                continue;
            }
            $fold = null;
            $colon = strpos($line, ':');
            if ($colon === false || $colon === 0) {
                continue;
            }
            $name = strtolower(trim(substr($line, 0, $colon)));
            if (in_array($name, Prober::KEPT_HEADERS, true) || in_array($name, self::FRAMING_HEADERS, true)) {
                $headers[] = [$name, trim(substr($line, $colon + 1))];
                $fold = array_key_last($headers);
            }
        }

        return ['status' => $status, 'headers' => $headers];
    }

    /**
     * Where the head ends: at the first empty line, CRLF or LF, also after LF lines (as curl, which ends the head at a line
     * that starts with CR or LF); a CR before the line end stays with the last line, which is trimmed.
     *
     * @return array{0: int, 1: int}|null the head's length and the length of the line end and empty line after it, null
     *                                    before the end
     */
    private static function headEnd(string $buffer): ?array
    {
        if (!preg_match('/\n\r?\n/', $buffer, $match, PREG_OFFSET_CAPTURE)) {
            return null;
        }

        return [$match[0][1], strlen($match[0][0])];
    }

    /**
     * The final answer: head and body, the body framed by chunked, Content-Length or the close, decoded, capped.
     *
     * @return array{error: ?string, status?: int, headers?: array<string, string>, body?: string, capped?: bool, location?: ?string}
     */
    private function answer(int $cap, bool $proxied): array
    {
        // curl's 56 (a failed read, a malformed chunk) reads as the proxy's failure through a proxy, as on the curl ways
        $recv = $proxied ? Outcome::PROXY : Outcome::PROTOCOL;
        $head = $this->head();
        if (!is_array($head)) {
            return ['error' => $head === 'timeout' ? Outcome::TIMEOUT : ($head === 'error' ? $recv : Outcome::PROTOCOL)];
        }
        $kept = [];
        $location = null;
        $lengths = [];
        $codings = [];
        $transfer = [];
        foreach ($head['headers'] as [$name, $value]) {
            if (in_array($name, Prober::KEPT_HEADERS, true)) {
                $kept[$name] = substr($value, 0, 64);
            } elseif ($name === 'location' && $value !== '') {
                $location ??= $value; // the first one; an empty one is none (curl takes the next)
            } elseif ($name === 'content-length') {
                $lengths[] = $value;
            } elseif ($name === 'content-encoding') {
                $codings[] = $value;
            } elseif ($name === 'transfer-encoding') {
                $transfer[] = $value;
            }
        }
        $status = $head['status'];
        $answer = ['error' => null, 'status' => $status, 'headers' => $kept, 'body' => '', 'capped' => false,
            'location' => $status >= 300 && $status < 400 ? $location : null];
        if ($status === 204 || $status === 304) {
            return $answer;
        }

        $decoder = $this->decoder(strtolower(trim(implode(',', $codings))));
        if ($decoder === false) {
            return ['error' => Outcome::PROTOCOL]; // an encoding it cannot decode (curl's 61)
        }
        $body = new \stdClass();
        $body->data = '';
        $body->capped = false;
        $body->broken = false;
        $sink = function (string $bytes) use ($body, $cap, $decoder): bool {
            foreach ($decoder === null ? [$bytes] : str_split($bytes, self::INFLATE_SLICE) as $slice) {
                if ($decoder !== null) {
                    $slice = $this->inflate($decoder, $slice);
                    if ($slice === null) {
                        $body->broken = true;
                        return false;
                    }
                }
                $room = $cap - strlen($body->data);
                if (strlen($slice) > $room) {
                    $body->data .= substr($slice, 0, max(0, $room));
                    $body->capped = true;
                    return false; // enough of the body for the content check
                }
                $body->data .= $slice;
            }
            return true;
        };

        $transferCodings = array_map('trim', explode(',', strtolower(implode(',', $transfer))));
        if ($transfer !== [] && end($transferCodings) === 'chunked') {
            $error = $this->chunked($sink, $recv);
        } elseif ($transfer === [] && $lengths !== []) {
            // the same value more than once is one; different ones are a broken answer (RFC 9112 6.3, also a list in one
            // field). curl 7.74 takes the last one instead
            $unique = array_unique(array_map('trim', explode(',', implode(',', $lengths))));
            if (count($unique) !== 1 || !preg_match('/^\d{1,18}$/', (string) reset($unique))) {
                return ['error' => Outcome::PROTOCOL];
            }
            $error = $this->sized((int) reset($unique), $sink, $recv);
        } else {
            $error = $this->untilClose($sink, $recv);
        }
        if ($body->broken) {
            return ['error' => Outcome::PROTOCOL]; // curl's 61: the encoded body is broken
        }
        if ($error !== null && !$body->capped) {
            return ['error' => $error];
        }

        return ['body' => $body->data, 'capped' => $body->capped] + $answer;
    }

    /**
     * @return mixed null: no encoding; false: one it cannot decode; else an \\ArrayObject of type (gzip or deflate), context
     *               (inflate_init()'s, once the first bytes are there) and start (the first byte while it is alone)
     */
    private function decoder(string $coding)
    {
        if ($coding === '' || $coding === 'identity') {
            return null;
        }
        if (!in_array($coding, ['gzip', 'x-gzip', 'deflate'], true) || !$this->capabilities->canInflate()) {
            return false;
        }

        return new \ArrayObject(['type' => $coding === 'deflate' ? 'deflate' : 'gzip', 'context' => null, 'start' => '']);
    }

    /** @return string|null the decoded bytes of a slice, null when the data is broken */
    private function inflate(\ArrayObject $decoder, string $slice): ?string
    {
        if ($decoder['context'] === null) {
            // zlib's header check needs the first two bytes
            $slice = $decoder['start'] . $slice;
            if (strlen($slice) < 2) {
                $decoder['start'] = $slice;
                return '';
            }
            $encoding = ZLIB_ENCODING_GZIP;
            if ($decoder['type'] === 'deflate') {
                // zlib's own format, or raw deflate as some servers send it (curl reads both): zlib's header check
                $raw = (ord($slice[0]) & 0x0f) !== 8 || ((ord($slice[0]) << 8) | ord($slice[1])) % 31 !== 0;
                $encoding = $raw ? ZLIB_ENCODING_RAW : ZLIB_ENCODING_DEFLATE;
            }
            $context = self::quietly(static fn() => inflate_init($encoding));
            if ($context === false) {
                return null;
            }
            $decoder['context'] = $context;
        }
        $out = self::quietly(static fn() => inflate_add($decoder['context'], $slice, ZLIB_SYNC_FLUSH));

        return is_string($out) ? $out : null;
    }

    /** a body of a known length; closed early is curl's 18 */
    private function sized(int $length, \Closure $sink, string $recv): ?string
    {
        while ($length > 0) {
            if ($this->buffer === '') {
                $why = $this->fill();
                if ($why !== null) {
                    return self::readError($why, $recv);
                }
            }
            $piece = substr($this->buffer, 0, $length);
            $this->buffer = (string) substr($this->buffer, strlen($piece));
            $length -= strlen($piece);
            if (!$sink($piece)) {
                $this->stopped = true;
                return null;
            }
        }

        return null;
    }

    private function untilClose(\Closure $sink, string $recv): ?string
    {
        while (true) {
            if ($this->buffer !== '') {
                $piece = $this->buffer;
                $this->buffer = '';
                if (!$sink($piece)) {
                    $this->stopped = true;
                    return null;
                }
            }
            $why = $this->fill();
            if ($why === 'eof') {
                return null;
            }
            if ($why !== null) {
                return self::readError($why, $recv);
            }
        }
    }

    /** chunked framing (RFC 9112, 7.1): sizes in hex with extensions, trailers; malformed is curl's 56, cut short its 18 */
    private function chunked(\Closure $sink, string $recv): ?string
    {
        while (true) {
            $line = $this->line(self::MAX_CHUNK_LINE);
            if (is_array($line)) {
                return self::readError($line[0], $recv);
            }
            $size = trim(explode(';', $line, 2)[0]);
            $length = preg_match('/^[0-9a-fA-F]{1,15}$/', $size) ? self::chunkSize($size) : null;
            if ($length === null) {
                return $recv;
            }
            if ($length === 0) {
                // trailers until the empty line; a close after the last chunk loses nothing of the body
                for ($read = 0; $read <= self::MAX_HEAD; ) {
                    $trailer = $this->line(self::MAX_HEADER_LINE);
                    if (is_array($trailer) || $trailer === '') {
                        return is_array($trailer) && $trailer[0] === 'timeout' ? Outcome::TIMEOUT : null;
                    }
                    $read += strlen($trailer);
                }
                return Outcome::PROTOCOL;
            }
            $error = $this->sized($length, $sink, $recv);
            if ($error !== null || $this->stopped) {
                return $error;
            }
            $end = $this->line(2);
            if (is_array($end) || $end !== '') {
                return is_array($end) ? self::readError($end[0], $recv) : $recv;
            }
        }
    }

    /**
     * A chunk's size from its hex digits, null when it is larger than $max: told by the number of digits without the
     * leading zeros and by the digits themselves, before hexdec(), whose float above PHP_INT_MAX an (int) would wrap
     * into a small size (32-bit PHP: 100000000 into the last chunk). Such a chunk is a malformed one; curl's 64-bit sizes
     * would wait for it. A size within $max but above what is left of the body's cap is read up to the cap, as curl
     * reads it: the cap counts decoded bytes, a chunk's size encoded ones. Public for its unit test.
     *
     * @param string $digits hex digits only
     * @param int $max the largest size taken (PHP_INT_MAX; tests stand for 32-bit PHP with 0x7fffffff)
     */
    public static function chunkSize(string $digits, int $max = PHP_INT_MAX): ?int
    {
        $digits = strtolower(ltrim($digits, '0'));
        $largest = dechex($max);
        if (strlen($digits) > strlen($largest) || (strlen($digits) === strlen($largest) && strcmp($digits, $largest) > 0)) {
            return null;
        }

        return $digits === '' ? 0 : (int) hexdec($digits);
    }

    /**
     * One line of the buffer without its line end (CRLF or LF).
     *
     * @return string|array{0: string} the line, or why there is none: [timeout], [error], [eof], [long]
     */
    private function line(int $max)
    {
        while (($at = strpos($this->buffer, "\n")) === false) {
            if (strlen($this->buffer) > $max) {
                return ['long'];
            }
            $why = $this->fill();
            if ($why !== null) {
                return [$why];
            }
        }
        if ($at > $max + 1) {
            return ['long'];
        }
        $line = substr($this->buffer, 0, $at);
        $this->buffer = (string) substr($this->buffer, $at + 1);

        return rtrim($line, "\r");
    }

    /** why a read failed, as curl's error reads: timeout; a failed read or a malformed line 56; closed early 18 */
    private static function readError(string $why, string $recv): string
    {
        if ($why === 'timeout') {
            return Outcome::TIMEOUT;
        }

        return in_array($why, ['error', 'long'], true) ? $recv : Outcome::PROTOCOL;
    }

    private function close(): void
    {
        if (is_resource($this->socket)) {
            fclose($this->socket);
        }
        $this->socket = null;
        $this->buffer = '';
    }

    /**
     * Calls $call with PHP's warnings caught (a failed connect or handshake warns), never shown or logged.
     *
     * @param string|null $message the warnings' text
     * @return mixed what $call returned
     */
    private static function quietly(\Closure $call, ?string &$message = null)
    {
        $message = '';
        set_error_handler(static function (int $level, string $text) use (&$message): bool {
            $message .= $text . "\n";
            return true;
        });
        try {
            return $call();
        } finally {
            restore_error_handler();
        }
    }
}
