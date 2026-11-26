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
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;

/**
 * Sends one GET per target, several side by side (spec 6.1): no cookies, no credentials, no proxy from the
 * environment, the connection pinned to the addresses the guard approved, at most 256 KB of the body kept, redirects
 * followed by hand (each hop through the guard) and only for websites and the Matomo interface, 10 seconds in all per
 * check including its redirects.
 *
 * Targets go in batches: the guard resolves a batch's hosts before any of its transfers starts, so a slow DNS server
 * never eats into the time of other checks. A batch only starts before the deadline; what is left is not measured.
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

    private const FOLLOWS_REDIRECTS = [Kind::WEB, Kind::UI];
    private const TLS_ERRORS = [35, 51, 53, 54, 58, 59, 60, 64, 66, 77, 80, 82, 83, 90, 91];
    private const CURLE_COULDNT_RESOLVE_PROXY = 5;
    private const CURLE_RECV_ERROR = 56;

    private static int $pins = 0;

    /**
     * @param array $proxy Matomo's [proxy] settings: host, port, username, password, exclude (empty: no proxy)
     * @param string|null $caInfo CA bundle file (Matomo's own), null: the system's
     */
    public function __construct(
        private UrlGuard $guard,
        private array $proxy,
        private string $userAgent,
        private int $connectTimeoutMs = 5000,
        private int $totalTimeoutMs = 10000,
        private int $parallel = 8,
        private ?string $caInfo = null
    ) {
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
            $queue[] = ['target' => $target, 'url' => $target->url, 'hops' => 0, 'spent' => 0, 'cert' => null, 'dns' => null];
        }
        while ($queue !== [] && microtime(true) < $deadline) {
            if ($beforeBatch !== null) {
                $beforeBatch(); // e.g. keep the run's lock alive
            }
            $pending = array_splice($queue, 0, max(1, $this->parallel * 2));
            while ($pending !== []) {
                $pending = $this->transfer($this->resolve($pending, $finish, $deadline), $finish);
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
     * @return list<array> states ready for transfer
     */
    private function resolve(array $states, \Closure $finish, float $deadline): array
    {
        $ready = [];
        foreach ($states as $state) {
            if ($state['hops'] === 0 && microtime(true) >= $deadline) {
                continue; // slow DNS ate the budget: not measured in this run
            }
            $host = (string) parse_url($state['url'], PHP_URL_HOST);
            $proxied = $this->usesProxyFor($host);
            $instance = $state['target']->isInstanceAddress();
            $decision = $proxied
                ? $this->guard->checkWithoutResolving($state['url'], $instance)
                : $this->guard->check($state['url'], $instance);
            $state['dns'] ??= $decision->lookupMs;
            // the lookup counts towards the check's 10 seconds
            $state['spent'] += $decision->lookupMs;
            if (!$decision->allowed) {
                $finish($state, self::failure($state, $decision->reason ?? Outcome::BLOCKED));
                continue;
            }
            if ($decision->lookupMs * 2 >= $this->totalTimeoutMs) {
                // a lookup that took half the check time or more is the resolver's problem, not a slow website: the
                // rest of the time would end in a timeout that reads as an outage
                $finish($state, self::failure($state, Outcome::DNS));
                continue;
            }
            if ($state['spent'] >= $this->totalTimeoutMs) {
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
                $state = array_shift($states);
                $sink = new \stdClass();
                $sink->body = '';
                $sink->capped = false;
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

                $state = $entry['state'];
                $response = $this->response($handle, (int) $info['result'], $entry['sink'], $state);
                $redirect = curl_getinfo($handle, CURLINFO_REDIRECT_URL);

                if ($response->error === null && $response->status >= 300 && $response->status < 400
                    && is_string($redirect) && $redirect !== ''
                    && in_array($state['target']->kind, self::FOLLOWS_REDIRECTS, true)
                    && $state['hops'] < self::MAX_REDIRECTS
                ) {
                    $next[] = [
                        'target' => $state['target'],
                        'url' => $redirect,
                        'hops' => $state['hops'] + 1,
                        'spent' => $response->timings['total'],
                        'cert' => $response->certNotAfter,
                        'dns' => $state['dns'],
                    ];
                    continue;
                }
                $finish($state, $response);
            }
        }
        curl_multi_close($multi);

        return $next;
    }

    /**
     * @return \CurlHandle
     */
    private function handle(array $state, \stdClass $sink)
    {
        /** @var GuardDecision $decision */
        $decision = $state['decision'];
        $remaining = max(1, $this->totalTimeoutMs - $state['spent']);
        $handle = curl_init();
        $cap = in_array($state['target']->kind, [Kind::UI, Kind::CONTAINER], true) ? self::MAX_BODY_LARGE : self::MAX_BODY;
        $options = [
            CURLOPT_URL => $state['url'],
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
        ];
        if ($this->caInfo !== null && is_file($this->caInfo)) {
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
            $pin = 'fwum-pin-' . (++self::$pins) . '-' . getmypid() . '.invalid';
            $addresses = array_map(
                static fn(string $ip): string => filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? '[' . $ip . ']' : $ip,
                $decision->ips
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
        $appconnect = (float) ($info['appconnect_time'] ?? 0);
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
            $error === null && $sink->capped
        );
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
