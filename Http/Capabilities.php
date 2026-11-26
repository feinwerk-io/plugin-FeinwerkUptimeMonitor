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

    /**
     * @param \Closure|null $functionExists (string $name): bool; default PHP's function_exists
     */
    public function __construct(?\Closure $functionExists = null)
    {
        $this->functionExists = $functionExists ?? static fn(string $name): bool => function_exists($name);
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
