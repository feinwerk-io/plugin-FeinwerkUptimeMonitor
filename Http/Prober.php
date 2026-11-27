<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Http;

use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\ProbeResponse;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\ResponseClassifier;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;

/**
 * Sends one GET per target, several side by side (spec 6.1): no cookies, no credentials, no proxy from the
 * environment, the connection pinned to the addresses the guard approved, at most 256 KB of the body kept, redirects
 * followed by hand (each hop through the guard) and only for websites and the Matomo interface, 10 seconds in all per
 * check including its redirects. Every kind follows one redirect to its own address with https (Matomo stored as http
 * behind a proxy that handles https; ResponseClassifier::isHttpsUpgrade(), note https_redirect).
 *
 * Targets go in batches: the guard resolves a batch's hosts before any of its transfers starts, so a slow DNS server
 * never eats into the time of other checks. A batch only starts before the deadline; what is left is not measured.
 *
 * Side by side through curl_multi where PHP has all its functions; where a host disabled one (often curl_multi_exec,
 * through php.ini disable_functions) the same transfers run one after the other through curl_exec, one target per
 * batch, so each starts only before the deadline. Where curl is missing or both its ways are disabled, PHP's own streams
 * carry them, one after the other too (StreamTransport, with the same guarantees). Without any way, no request is sent
 * and every check ends as Outcome::PHP_DISABLED (not checkable), never as an error (Capabilities); so does an https
 * address on the stream way of a PHP without its TLS functions. While Matomo's internet features are off (without the
 * opt-in, Runner\InternetAccess) nothing is looked up or sent either: Outcome::INTERNET_OFF.
 */
final class Prober
{
    public const MAX_BODY = 262144;
    /**
     * Matomo's login page and Tag Manager containers can be far larger: the login page inlines the client-side
     * translations of every plugin (about 500 KB with thirty plugins, the form after them), a container carries the Tag
     * Manager runtime before its id and revision. Their content check needs the whole file.
     */
    public const MAX_BODY_LARGE = 4194304;
    public const MAX_REDIRECTS = 3;

    /**
     * the response headers kept for the classifier (lower case): Matomo's tracker sends Access-Control-Allow-Credentials
     * on every answer (core Tracker\Response::init, 5.0.0 to 6.0.0), also where a host hides its note on matomo.php
     */
    public const KEPT_HEADERS = ['access-control-allow-credentials'];
    private const MAX_HEADER_VALUE = 64;

    private const FOLLOWS_REDIRECTS = [Kind::WEB, Kind::UI];
    private const TLS_ERRORS = [35, 51, 53, 54, 58, 59, 60, 64, 66, 77, 80, 82, 83, 90, 91];
    private const CURLE_COULDNT_RESOLVE_PROXY = 5;
    private const CURLE_RECV_ERROR = 56;
    /** libcurl 7.59.0: several addresses in one CURLOPT_RESOLVE entry */
    private const CURL_RESOLVE_LISTS = 0x073B00;

    private static int $pins = 0;

    /**
     * the hosts and ports ("host:port") whose certificate Matomo's bundle could not verify for a trust anchor problem
     * (TrustFile::secondTry()): their later transfers in this prober's run (other targets, redirect hops, the run's
     * retry phase) verify with the server's trust store at once (L8 review of 5.4.0, SHOULD 2); another port of the host
     * keeps the bundle, its certificate can be another (review of the 5.4.0 fixes, NIT 2)
     *
     * @var array<string, true>
     */
    private array $systemHosts = [];
    private ?StreamTransport $streams = null;

    /**
     * @param array $proxy Matomo's [proxy] settings: host, port, username, password, exclude (empty: no proxy)
     * @param string|null $caInfo CA file to verify with (TrustFile::choose(): custom_cacert_pem or Matomo's bundle), null:
     *                            the server's trust store
     * @param Capabilities|null $capabilities the PHP functions there are; default PHP's function_exists
     * @param bool $systemRetry a verification that fails with $caInfo for a trust anchor problem (TrustFile::secondTry():
     *                          an issuer it lacks, a self-signed certificate or root) is tried once more with the
     *                          server's trust store, within the check's 10 seconds; the failed handshake is not part of
     *                          the reported response time (Matomo's bundle: an internal CA or a self-signed certificate
     *                          only in the trust store)
     */
    public function __construct(
        private UrlGuard $guard,
        private array $proxy,
        private string $userAgent,
        private int $connectTimeoutMs = 5000,
        private int $totalTimeoutMs = 10000,
        private int $parallel = 8,
        private ?string $caInfo = null,
        private ?Capabilities $capabilities = null,
        private bool $systemRetry = false
    ) {
        $this->capabilities ??= new Capabilities();
    }

    /**
     * How the requests go out: Capabilities::MULTI (side by side), SEQUENTIAL (curl_exec, one after the other), STREAM
     * (PHP's streams, one after the other) or null (none: every check is not checkable, note php_disabled).
     */
    public function transport(): ?string
    {
        return $this->capabilities->transport();
    }

    /**
     * Whether requests may go out at all: false while Matomo's internet features are off without the opt-in
     * (Capabilities::internetAllowed()); every check then ends as Outcome::INTERNET_OFF without a lookup.
     */
    public function internetAllowed(): bool
    {
        return $this->capabilities->internetAllowed();
    }

    /**
     * The disabled PHP functions that keep the checks from running: those of the transport when there is none, and
     * those the guard needs to decide (AddressGuard::missingFunctions()). Empty while the checks can run.
     *
     * @return string[]
     */
    public function missingFunctions(): array
    {
        $guard = $this->guard instanceof AddressGuard ? $this->guard->missingFunctions() : [];

        return array_values(array_unique(array_merge($this->capabilities->missingForTransport(), $guard)));
    }

    /**
     * Probes the targets in the given order. Batches start only before $deadline (a microtime(true) value); targets
     * of batches not started get no result. With $consume, each result is handed over as soon as it is final and
     * nothing is kept (memory: up to 256 KB per body); without, all results are returned.
     *
     * @param Target[] $targets
     * @param \Closure(Target, ProbeResponse): void|null $consume
     * @return array<int, ProbeResponse> by target id, in the order of $targets (empty with $consume)
     */
    public function probeAll(array $targets, float $deadline, ?\Closure $consume = null, ?\Closure $beforeBatch = null): array
    {
        $results = [];
        $finish = static function (array $state, ProbeResponse $response) use (&$results, $consume): void {
            if ($consume !== null) {
                $consume($state['target'], $response);
            } else {
                $results[$state['target']->id] = $response;
            }
        };

        $queue = [];
        foreach ($targets as $target) {
            // spent: the milliseconds reported so far (lookups, earlier hops); used: the real time of the check's 10
            // seconds so far (the waits, also a failed first try with Matomo's bundle, which is not reported; not the
            // time of a lookup this run made before)
            $queue[] = ['target' => $target, 'url' => $target->url, 'hops' => 0, 'spent' => 0, 'used' => 0, 'cert' => null, 'dns' => null];
        }
        $transport = $this->transport();
        // nothing goes out, without a lookup: Matomo's internet features are off (first: whatever PHP has), or no
        // request can go out from this PHP
        $nothingSent = !$this->capabilities->internetAllowed() ? Outcome::INTERNET_OFF : ($transport === null ? Outcome::PHP_DISABLED : null);
        // one after the other: one target per batch, so that each one starts only before the deadline
        $batch = $transport === Capabilities::MULTI ? max(1, $this->parallel * 2) : 1;
        // the streams of a PHP without its TLS functions check http addresses only
        $noHttps = $transport === Capabilities::STREAM && !$this->capabilities->canStreamTls();
        while ($queue !== [] && microtime(true) < $deadline) {
            if ($beforeBatch !== null) {
                $beforeBatch(); // e.g. keep the run's lock alive
            }
            $pending = array_splice($queue, 0, $batch);
            if ($nothingSent !== null) {
                // not checkable, the note says why
                foreach ($pending as $state) {
                    $finish($state, self::failure($state, $nothingSent));
                }
                continue;
            }
            while ($pending !== []) {
                $ready = $this->resolve($pending, $finish, $deadline, $noHttps);
                $pending = match ($transport) {
                    Capabilities::MULTI => $this->transfer($ready, $finish),
                    Capabilities::SEQUENTIAL => $this->transferEach($ready, $finish),
                    default => $this->transferStreams($ready, $finish),
                };
            }
        }

        if ($consume !== null) {
            return [];
        }
        $ordered = [];
        foreach ($targets as $target) {
            if (isset($results[$target->id])) {
                $ordered[$target->id] = $results[$target->id];
            }
        }

        return $ordered;
    }

    /**
     * Whether a request to this host goes through Matomo's [proxy]: not for local hosts and not for the hosts in
     * `exclude` (the rules of Matomo's own Http class).
     */
    public function usesProxyFor(string $host): bool
    {
        if (empty($this->proxy['host']) || empty($this->proxy['port'])) {
            return false;
        }
        $host = strtolower(trim($host, '[]'));
        if (in_array($host, ['localhost', '127.0.0.1', '::1'], true)) {
            return false;
        }
        $excludes = array_filter(array_map(static fn($h): string => strtolower(trim((string) $h)), explode(',', (string) ($this->proxy['exclude'] ?? ''))));

        return !in_array($host, $excludes, true);
    }

    /**
     * Runs the guard for each state (no transfer is running meanwhile).
     *
     * @param bool $noHttps https addresses cannot be sent (the stream way without PHP's TLS functions)
     * @return list<array> states ready for transfer
     */
    private function resolve(array $states, \Closure $finish, float $deadline, bool $noHttps = false): array
    {
        $ready = [];
        foreach ($states as $state) {
            if (!empty($state['system'])) {
                // the second try with the server's trust store: the same hop, the same approved addresses; it belongs to
                // its check and runs also after the deadline
                if ($state['used'] >= $this->totalTimeoutMs) {
                    $finish($state, self::failure($state, Outcome::TIMEOUT));
                } else {
                    $ready[] = $state;
                }
                continue;
            }
            // a check starts only before the deadline; its redirect hops belong to it and run on
            if ($state['hops'] === 0 && microtime(true) >= $deadline) {
                continue; // slow DNS ate the budget: not measured in this run
            }
            if ($noHttps && strncasecmp($state['url'], 'https:', 6) === 0) {
                // not checkable from this PHP, nothing looked up or sent (the functions are named, missingFunctions())
                $finish($state, self::failure($state, Outcome::PHP_DISABLED));
                continue;
            }
            $host = (string) parse_url($state['url'], PHP_URL_HOST);
            $proxied = $this->usesProxyFor($host);
            $instance = $state['target']->isInstanceAddress();
            $decision = $proxied
                ? $this->guard->checkWithoutResolving($state['url'], $instance)
                : $this->guard->check($state['url'], $instance);
            // through the proxy the lookup here only serves the private-address check and the proxy resolves (audit
            // D1): its time is no DNS time of the check, counts not towards the 10 seconds and is no DNS failure. On
            // the direct way a check's first hop reports its lookup's time also when an earlier check of the run looked
            // the host up (as when each looked it up itself; L8 review of 5.4.0, NIT 6); only the time waited now
            // counts towards the 10 seconds and the rule below, so one slow answer fails no other check
            $lookupMs = $proxied ? 0 : $decision->lookupMs;
            $reportedMs = $proxied ? 0 : ($state['hops'] === 0 ? $decision->answerMs : $decision->lookupMs);
            $state['dns'] ??= $reportedMs;
            $state['spent'] += $reportedMs;
            $state['used'] += $lookupMs;
            if (!$decision->allowed) {
                $finish($state, self::failure($state, $decision->reason ?? Outcome::BLOCKED));
                continue;
            }
            if ($lookupMs * 2 >= $this->totalTimeoutMs) {
                // a lookup that took half the check time or more is the resolver's problem, not a slow website: the
                // rest of the time would end in a timeout that reads as an outage
                $finish($state, self::failure($state, Outcome::DNS));
                continue;
            }
            if ($state['used'] >= $this->totalTimeoutMs) {
                $finish($state, self::failure($state, Outcome::TIMEOUT));
                continue;
            }
            $state['decision'] = $decision;
            $state['proxied'] = $proxied;
            $ready[] = $state;
        }

        return $ready;
    }

    /**
     * Transfers the states side by side; finishes them or returns their next redirect hops.
     *
     * @return list<array> redirect hops to resolve and transfer next
     */
    private function transfer(array $states, \Closure $finish): array
    {
        $next = [];
        $active = [];
        $multi = curl_multi_init();

        while ($states !== [] || $active !== []) {
            while ($states !== [] && count($active) < $this->parallel) {
                $state = $this->withTrust(array_shift($states));
                $sink = new \stdClass();
                $sink->body = '';
                $sink->capped = false;
                $sink->headers = [];
                $handle = $this->handle($state, $sink);
                curl_multi_add_handle($multi, $handle);
                $active[spl_object_id($handle)] = ['handle' => $handle, 'state' => $state, 'sink' => $sink];
            }

            do {
                $code = curl_multi_exec($multi, $running);
            } while ($code === CURLM_CALL_MULTI_PERFORM);
            if ($running) {
                curl_multi_select($multi, 0.1);
            }

            while (($info = curl_multi_info_read($multi)) !== false) {
                $handle = $info['handle'];
                $entry = $active[spl_object_id($handle)];
                unset($active[spl_object_id($handle)]);
                curl_multi_remove_handle($multi, $handle);

                $hop = $this->finished($handle, (int) $info['result'], $entry['sink'], $entry['state'], $finish);
                if ($hop !== null) {
                    $next[] = $hop;
                }
            }
        }
        curl_multi_close($multi);

        return $next;
    }

    /**
     * The same transfers one after the other through curl_exec (a host without curl_multi_exec): the same handles,
     * options, pinning, body cap and timings; finishes them or returns their next redirect hops.
     *
     * @return list<array> redirect hops to resolve and transfer next
     */
    private function transferEach(array $states, \Closure $finish): array
    {
        $next = [];
        foreach ($states as $state) {
            $state = $this->withTrust($state);
            $sink = new \stdClass();
            $sink->body = '';
            $sink->capped = false;
            $sink->headers = [];
            $handle = $this->handle($state, $sink);
            curl_exec($handle);
            $hop = $this->finished($handle, curl_errno($handle), $sink, $state, $finish);
            if ($hop !== null) {
                $next[] = $hop;
            }
        }

        return $next;
    }

    /**
     * The same transfers one after the other through PHP's streams (a host without curl): connected to the approved
     * addresses only, with the guard's host in Host, SNI and a proxy's CONNECT, the same CA file and second try, body
     * caps, headers and timings (StreamTransport); finishes them or returns their next redirect hops.
     *
     * @return list<array> redirect hops to resolve and transfer next
     */
    private function transferStreams(array $states, \Closure $finish): array
    {
        $this->streams ??= new StreamTransport($this->capabilities, $this->userAgent, $this->proxy);
        $next = [];
        foreach ($states as $state) {
            $state = $this->withTrust($state);
            /** @var GuardDecision $decision */
            $decision = $state['decision'];
            $remaining = max(1, $this->totalTimeoutMs - $state['used']);
            // the guard's ASCII host, as on the curl ways
            $url = self::withHost($state['url'], $decision->host);
            $fetched = $this->streams->fetch($url, $decision, (bool) $state['proxied'], $state['bundle'] ? $this->caInfo : null,
                $this->systemRetry && $state['bundle'], min($this->connectTimeoutMs, $remaining), $remaining, self::capOf($state['target']));
            $ok = $fetched->error === null;
            $https = strncasecmp($state['url'], 'https:', 6) === 0;
            $response = new ProbeResponse(
                $ok ? $fetched->status : null,
                $ok ? $fetched->body : '',
                $fetched->error,
                $state['url'],
                self::timings((int) $state['dns'], $fetched->connectMs, $fetched->tlsMs, $fetched->ttfbMs, $fetched->totalMs + $state['spent']),
                $state['cert'] ?? ($https ? $fetched->certNotAfter : null),
                $state['hops'],
                $ok && $fetched->capped,
                $ok ? $fetched->headers : []
            );
            $redirect = $fetched->location !== null ? RedirectUrl::resolve($url, $fetched->location) : '';
            $hop = $this->advance($state, $response, $fetched->trustAnchorProblem, $redirect, $finish, $fetched->lostMs);
            if ($hop !== null) {
                $next[] = $hop;
            }
        }

        return $next;
    }

    /** the body cap of a target: the Matomo interface and Tag Manager containers need their whole file */
    private static function capOf(Target $target): int
    {
        return in_array($target->kind, [Kind::UI, Kind::CONTAINER], true) ? self::MAX_BODY_LARGE : self::MAX_BODY;
    }

    /**
     * Which CA file the transfer of a state verifies with, decided when it starts: 'bundle' true for $caInfo, false for
     * the server's trust store (none set; also for the second try, and for a host whose certificate the bundle could
     * not verify for a trust anchor problem earlier in this run).
     */
    private function withTrust(array $state): array
    {
        $state['bundle'] = $this->caInfo !== null && empty($state['system'])
            && !($this->systemRetry && isset($this->systemHosts[self::hostPort($state['decision'])]));

        return $state;
    }

    /** the key of $systemHosts: one certificate per host and port */
    private static function hostPort(GuardDecision $decision): string
    {
        return $decision->host . ':' . $decision->port;
    }

    /**
     * A curl transfer is done: what curl measured, read for advance().
     *
     * @param \CurlHandle $handle
     */
    private function finished($handle, int $result, \stdClass $sink, array $state, \Closure $finish): ?array
    {
        $response = $this->response($handle, $result, $sink, $state);
        $secondTry = TrustFile::secondTry($result, (int) curl_getinfo($handle, CURLINFO_SSL_VERIFYRESULT), $this->capabilities->tlsLibrary());
        $redirect = curl_getinfo($handle, CURLINFO_REDIRECT_URL);

        return $this->advance($state, $response, $secondTry, is_string($redirect) ? $redirect : '', $finish);
    }

    /**
     * What follows a transfer, the same for every transport: the second try with the server's trust store (when the
     * transfer verified with Matomo's bundle and failed for a trust anchor problem), the next redirect hop (websites
     * and the Matomo interface, up to MAX_REDIRECTS; every kind one hop to its own address with https), or the result.
     *
     * @param bool $trustAnchorProblem the certificate did not verify with the CA file for a trust anchor problem
     *                                 (TrustFile::secondTry() for curl), or the CA file could not be loaded
     * @param string $redirect the absolute URL of the answer's Location ('' without one)
     * @param int $lostMs time of this transfer that its timings do not report but the 10 seconds count
     */
    private function advance(array $state, ProbeResponse $response, bool $trustAnchorProblem, string $redirect, \Closure $finish, int $lostMs = 0): ?array
    {
        if ($this->systemRetry && $state['bundle'] && $trustAnchorProblem) {
            // the same hop once more, verified by the server's trust store instead of Matomo's bundle, and the host's
            // later transfers of this run start there. The 10 seconds go on (this attempt's time is used), the
            // reported times are the second try's alone (L8 review of 5.4.0, SHOULD 2)
            $this->systemHosts[self::hostPort($state['decision'])] = true;

            return ['system' => true, 'used' => $state['used'] + $response->timings['total'] - $state['spent'] + $lostMs] + $state;
        }

        if ($response->error === null && $response->status >= 300 && $response->status < 400
            && $redirect !== ''
            && ((in_array($state['target']->kind, self::FOLLOWS_REDIRECTS, true) && $state['hops'] < self::MAX_REDIRECTS)
                // every kind: one hop to the same address with https (Matomo stored as http behind a TLS proxy, D2)
                || ($state['hops'] === 0 && ResponseClassifier::isHttpsUpgrade(self::withHost($state['url'], $state['decision']->host), $redirect)))
        ) {
            return [
                'target' => $state['target'],
                'url' => $redirect,
                'hops' => $state['hops'] + 1,
                'spent' => $response->timings['total'],
                'used' => $state['used'] + $response->timings['total'] - $state['spent'],
                'cert' => $response->certNotAfter,
                'dns' => $state['dns'],
            ];
        }
        $finish($state, $response);

        return null;
    }

    /**
     * @return \CurlHandle
     */
    private function handle(array $state, \stdClass $sink)
    {
        /** @var GuardDecision $decision */
        $decision = $state['decision'];
        $remaining = max(1, $this->totalTimeoutMs - $state['used']);
        $handle = curl_init();
        $cap = self::capOf($state['target']);
        $options = [
            // the guard's ASCII host, never the URL's own: libcurl converts internationalised names by its own rules
            // (libidn2), which can differ from PHP's intl. So the name checked is the name fetched: by Matomo's proxy, in
            // the Host header and in SNI, on every hop
            CURLOPT_URL => self::withHost($state['url'], $decision->host),
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HEADER => false,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
            CURLOPT_CONNECTTIMEOUT_MS => min($this->connectTimeoutMs, $remaining),
            CURLOPT_TIMEOUT_MS => $remaining,
            CURLOPT_NOSIGNAL => true,
            CURLOPT_USERAGENT => $this->userAgent,
            CURLOPT_HTTPHEADER => ['Accept: */*', 'Cache-Control: no-cache'],
            CURLOPT_ENCODING => '',
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_CERTINFO => $decision->scheme === 'https',
            CURLOPT_FRESH_CONNECT => true,
            CURLOPT_FORBID_REUSE => true,
            CURLOPT_WRITEFUNCTION => static function ($curl, string $chunk) use ($sink, $cap): int {
                $room = $cap - strlen($sink->body);
                if (strlen($chunk) > $room) {
                    $sink->body .= substr($chunk, 0, max(0, $room));
                    $sink->capped = true;
                    return 0; // stop reading: enough of the body for the content check
                }
                $sink->body .= $chunk;
                return strlen($chunk);
            },
            CURLOPT_HEADERFUNCTION => static function ($curl, string $line) use ($sink): int {
                if (strncasecmp($line, 'HTTP/', 5) === 0) {
                    $sink->headers = []; // a new answer (a proxy's CONNECT, 1xx): only the final one's headers count
                } elseif (($colon = strpos($line, ':')) !== false) {
                    $name = strtolower(trim(substr($line, 0, $colon)));
                    if (in_array($name, self::KEPT_HEADERS, true)) {
                        $sink->headers[$name] = substr(trim(substr($line, $colon + 1)), 0, self::MAX_HEADER_VALUE);
                    }
                }
                return strlen($line);
            },
        ];
        // the second try (systemRetry), and a host the bundle could not verify before, leave the CA file to the
        // server's trust store (withTrust())
        if ($state['bundle']) {
            $options[CURLOPT_CAINFO] = $this->caInfo;
        }
        if ($state['proxied']) {
            $options[CURLOPT_PROXY] = $this->proxy['host'] . ':' . $this->proxy['port'];
            if (!empty($this->proxy['username'])) {
                $options[CURLOPT_PROXYUSERPWD] = $this->proxy['username'] . ':' . ($this->proxy['password'] ?? '');
            }
        } else {
            // never a proxy from the environment (http_proxy, ALL_PROXY): it would bypass the pinned addresses
            $options[CURLOPT_PROXY] = '';
            // Pin the connection independently of how curl normalises the URL's host: every request connects to a
            // unique placeholder name, which resolves only to the approved addresses. Host header, SNI and the
            // certificate check keep the URL's host.
            // getmypid is on some hosts' list of disabled functions
            $pid = $this->capabilities->has('getmypid') ? getmypid() : mt_rand();
            $pin = 'fwum-pin-' . (++self::$pins) . '-' . $pid . '.invalid';
            $ips = $decision->ips;
            if ($this->capabilities->curlVersion() < self::CURL_RESOLVE_LISTS && count($ips) > 1) {
                // libcurl before 7.59.0 drops a list in one CURLOPT_RESOLVE entry (audit T2): one address, IPv4 first
                $ipv4 = array_values(array_filter($ips, static fn(string $ip): bool => (bool) filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)));
                $ips = [$ipv4[0] ?? $ips[0]];
            }
            $addresses = array_map(
                static fn(string $ip): string => filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? '[' . $ip . ']' : $ip,
                $ips
            );
            $options[CURLOPT_CONNECT_TO] = ['::' . $pin . ':'];
            $options[CURLOPT_RESOLVE] = [$pin . ':' . $decision->port . ':' . implode(',', $addresses)];
        }
        curl_setopt_array($handle, $options);

        return $handle;
    }

    /**
     * @param \CurlHandle $handle
     */
    private function response($handle, int $result, \stdClass $sink, array $state): ProbeResponse
    {
        $info = curl_getinfo($handle);
        $ms = static fn($seconds): int => (int) round(((float) $seconds) * 1000);
        $connected = (float) ($info['connect_time'] ?? 0);
        // PHP's array of curl_getinfo() has no appconnect_time, only appconnect_time_us (the TLS time was always 0)
        $appconnect = isset($info['appconnect_time_us']) ? $info['appconnect_time_us'] / 1000000
            : (float) curl_getinfo($handle, CURLINFO_APPCONNECT_TIME);
        $tls = $appconnect > 0 ? max(0, $ms($appconnect) - $ms($connected)) : 0;
        $timings = self::timings((int) $state['dns'], max(0, $ms($connected) - $ms($info['namelookup_time'] ?? 0)), $tls,
            $ms($info['starttransfer_time'] ?? 0), $ms($info['total_time'] ?? 0) + $state['spent']);

        $cert = $state['cert'];
        if ($cert === null && strncasecmp($state['url'], 'https:', 6) === 0) {
            $certinfo = curl_getinfo($handle, CURLINFO_CERTINFO);
            $cert = is_array($certinfo) ? CertificateReader::fromCurlCertInfo($certinfo) : null;
        }

        $error = null;
        if ($result !== CURLE_OK && !($result === CURLE_WRITE_ERROR && $sink->capped)) {
            $error = self::error($result, $connected > 0, (bool) $state['proxied']);
        }

        return new ProbeResponse(
            $error === null ? (int) $info['http_code'] : null,
            $error === null ? $sink->body : '',
            $error,
            $state['url'],
            $timings,
            $cert,
            $state['hops'],
            $error === null && $sink->capped,
            $error === null ? $sink->headers : []
        );
    }

    /**
     * The URL as it is fetched: its scheme, the guard's normalised host (lower case, ASCII; an IPv6 address in
     * brackets), its port, path and query; no credentials (the guard refuses them) and no fragment (never sent).
     */
    public static function withHost(string $url, string $host): string
    {
        $parts = parse_url($url);
        if (!is_array($parts) || $host === '') {
            return $url;
        }
        $authority = filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? '[' . $host . ']' : $host;
        if (isset($parts['port'])) {
            $authority .= ':' . (int) $parts['port'];
        }

        return strtolower((string) ($parts['scheme'] ?? 'http')) . '://' . $authority . ($parts['path'] ?? '')
            . (isset($parts['query']) ? '?' . $parts['query'] : '');
    }

    private static function error(int $curlError, bool $connected, bool $proxied): string
    {
        if ($curlError === self::CURLE_COULDNT_RESOLVE_PROXY
            || ($proxied && in_array($curlError, [CURLE_COULDNT_CONNECT, self::CURLE_RECV_ERROR], true))
        ) {
            // the proxy failed, not necessarily the target
            return Outcome::PROXY;
        }
        if ($curlError === CURLE_COULDNT_RESOLVE_HOST) {
            return Outcome::DNS;
        }
        if (in_array($curlError, self::TLS_ERRORS, true)) {
            return Outcome::TLS;
        }
        if (!$connected || $curlError === CURLE_COULDNT_CONNECT) {
            // includes a connect timeout: hairpin NAT and firewalls drop packets instead of refusing them
            return Outcome::CONNECT;
        }

        return $curlError === CURLE_OPERATION_TIMEDOUT ? Outcome::TIMEOUT : Outcome::PROTOCOL;
    }

    private static function failure(array $state, string $error): ProbeResponse
    {
        return new ProbeResponse(null, '', $error, $state['url'], self::timings((int) ($state['dns'] ?? 0), 0, 0, 0, $state['spent']), $state['cert'], $state['hops']);
    }

    /**
     * @return array{dns: int, connect: int, tls: int, ttfb: int, total: int}
     */
    private static function timings(int $dns, int $connect, int $tls, int $ttfb, int $total): array
    {
        return ['dns' => $dns, 'connect' => $connect, 'tls' => $tls, 'ttfb' => $ttfb, 'total' => $total];
    }
}
