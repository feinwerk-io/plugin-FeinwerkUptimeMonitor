<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Http;

/**
 * Which PHP functions the checks can use. Hosts switch functions off in php.ini (disable_functions), often every one
 * with "exec" in its name, such as curl_multi_exec; in PHP 8 such a function does not exist (function_exists() says
 * false, a call throws \Error). The prober, the guard and the certificate reader ask here first and never call a
 * function that is missing.
 *
 * The check is injected (default PHP's function_exists), so tests can stand for a host with disabled functions.
 */
final class Capabilities
{
    /** curl_multi: several transfers side by side */
    public const MULTI = 'multi';
    /** curl_exec: the same transfers one after the other */
    public const SEQUENTIAL = 'sequential';

    /** needed both ways: the handle, its options and what curl measured */
    private const CURL = ['curl_init', 'curl_setopt_array', 'curl_getinfo'];
    /** every curl_multi function the prober's loop calls: one missing, and the sequential way is taken */
    private const CURL_MULTI = ['curl_multi_init', 'curl_multi_add_handle', 'curl_multi_exec', 'curl_multi_select',
        'curl_multi_info_read', 'curl_multi_remove_handle', 'curl_multi_close'];
    private const CURL_SEQUENTIAL = ['curl_exec', 'curl_errno'];
    /** name lookups of the guard: one of them is enough (gethostbynamel IPv4 only, dns_get_record also IPv6) */
    private const DNS = ['gethostbynamel', 'dns_get_record'];
    /** the guard's address ranges */
    private const ADDRESSES = ['inet_pton', 'inet_ntop'];
    /** the certificate reader's own TLS handshake */
    private const HANDSHAKE = ['stream_context_create', 'stream_socket_client', 'stream_context_get_params', 'openssl_x509_parse'];

    /** @var \Closure(string): bool */
    private \Closure $functionExists;
    /** @var \Closure(string): bool */
    private \Closure $extensionLoaded;
    /** whether the checks may send requests at all (Matomo's internet features, Runner\InternetAccess) */
    private bool $internet = true;

    /**
     * @param \Closure|null $functionExists (string $name): bool; default PHP's function_exists
     * @param int|null $curlVersion libcurl's version number (0x073B00 = 7.59.0); default curl_version() (tests)
     * @param string|null $tlsLibrary libcurl's TLS library ("OpenSSL/3.0.13"); default curl_version() (tests)
     * @param \Closure|null $extensionLoaded (string $name): bool; default PHP's extension_loaded (tests)
     */
    public function __construct(?\Closure $functionExists = null, private ?int $curlVersion = null, private ?string $tlsLibrary = null,
        ?\Closure $extensionLoaded = null)
    {
        $this->functionExists = $functionExists ?? static fn(string $name): bool => function_exists($name);
        $this->extensionLoaded = $extensionLoaded
            ?? static fn(string $name): bool => !function_exists('extension_loaded') || extension_loaded($name);
    }

    /** libcurl's version number (0x073B00 is 7.59.0); 0 when it cannot be read. */
    public function curlVersion(): int
    {
        if ($this->curlVersion === null) {
            $info = $this->has('curl_version') ? curl_version() : false;
            $this->curlVersion = is_array($info) ? (int) ($info['version_number'] ?? 0) : 0;
        }

        return $this->curlVersion;
    }

    /** libcurl's TLS library as curl_version() names it ("OpenSSL/3.0.13"); '' when it cannot be read. */
    public function tlsLibrary(): string
    {
        if ($this->tlsLibrary === null) {
            $info = $this->has('curl_version') ? curl_version() : false;
            $this->tlsLibrary = is_array($info) ? (string) ($info['ssl_version'] ?? '') : '';
        }

        return $this->tlsLibrary;
    }

    /**
     * A copy that says whether the checks may send requests at all: false while Matomo's internet features are off and
     * the opt-in is not set (Runner\InternetAccess, wired by CheckRunner::capabilities()). Without it: allowed.
     */
    public function withInternet(bool $allowed): self
    {
        $copy = clone $this;
        $copy->internet = $allowed;

        return $copy;
    }

    /** Whether the checks may send requests (DNS lookups, HTTP requests, TLS handshakes); see withInternet(). */
    public function internetAllowed(): bool
    {
        return $this->internet;
    }

    public function has(string $name): bool
    {
        return (bool) ($this->functionExists)($name);
    }

    /**
     * How the prober sends its requests: multi when every function of that way is there, else sequential, else null
     * (no requests at all: every check is not checkable, note php_disabled).
     */
    public function transport(): ?string
    {
        if ($this->missing(self::CURL) !== []) {
            return null;
        }
        if ($this->missing(self::CURL_MULTI) === []) {
            return self::MULTI;
        }

        return $this->missing(self::CURL_SEQUENTIAL) === [] ? self::SEQUENTIAL : null;
    }

    /**
     * Whether the curl functions the checks need are missing because PHP's curl extension is not installed, rather than
     * switched off in php.ini (disable_functions): the admin's step differs (UI review of 5.4.0, L7).
     */
    public function curlMissing(): bool
    {
        return $this->missing(self::CURL) !== [] && !($this->extensionLoaded)('curl');
    }

    /**
     * The missing functions that keep the prober from sending any request (both ways' missing ones, as the
     * administrator would need them back); empty while one way works.
     *
     * @return string[]
     */
    public function missingForTransport(): array
    {
        if ($this->transport() !== null) {
            return [];
        }

        return $this->missing(array_merge(self::CURL, self::CURL_SEQUENTIAL, self::CURL_MULTI));
    }

    /** Whether a host name can be looked up (gethostbynamel or dns_get_record). */
    public function canResolve(): bool
    {
        return count($this->missing(self::DNS)) < count(self::DNS);
    }

    /** Whether addresses can be compared with the guard's ranges (inet_pton and inet_ntop). */
    public function canCompareAddresses(): bool
    {
        return $this->missing(self::ADDRESSES) === [];
    }

    /** Whether the certificate reader can open a TLS connection of its own and read the certificate. */
    public function canHandshake(): bool
    {
        return $this->missing(self::HANDSHAKE) === [];
    }

    /**
     * The missing functions that keep the guard from deciding (inet_pton, inet_ntop; the lookups only when both are
     * missing and $lookups is true); empty while it can decide.
     *
     * @param bool $lookups whether the guard looks up names itself (false with a resolver of its own)
     * @return string[]
     */
    public function missingForGuard(bool $lookups = true): array
    {
        return array_merge($lookups && !$this->canResolve() ? self::DNS : [], $this->missing(self::ADDRESSES));
    }

    /**
     * @param string[] $names
     * @return string[] those of $names that are missing, in their order
     */
    private function missing(array $names): array
    {
        return array_values(array_filter($names, fn(string $name): bool => !$this->has($name)));
    }
}
