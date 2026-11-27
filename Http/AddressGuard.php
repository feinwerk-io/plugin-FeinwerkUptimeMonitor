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
 * Keeps the checks out of internal networks (spec 7): only http and https, no credentials in the URL, a strict host
 * grammar, and every address of the host must be public, unless a super user allowed private addresses (an intranet
 * Matomo). Link-local and cloud metadata addresses stay blocked even then. The prober connects only to the addresses
 * returned here.
 *
 * The address rules started from FeinwerkSentinel's Notify/WebhookUrl.
 *
 * Never calls a PHP function the host disabled (Capabilities): without inet_pton and inet_ntop it cannot compare
 * addresses, without gethostbynamel and dns_get_record it cannot look up names (also not for requests through Matomo's
 * proxy while private addresses are not allowed); such a decision is refused with Outcome::PHP_DISABLED (not
 * checkable), which says why.
 */
final class AddressGuard implements UrlGuard
{
    /** Special-purpose IPv4 ranges PHP 8.1's filter flags do not all cover (RFC 6890 and successors). */
    private const BLOCKED_V4 = [
        '0.0.0.0/8', '10.0.0.0/8', '100.64.0.0/10', '127.0.0.0/8', '169.254.0.0/16', '172.16.0.0/12', '192.0.0.0/24',
        '192.0.2.0/24', '192.88.99.0/24', '192.168.0.0/16', '198.18.0.0/15', '198.51.100.0/24', '203.0.113.0/24',
        '224.0.0.0/4', '240.0.0.0/4', '255.255.255.255/32',
    ];

    /** Special-purpose IPv6 ranges. */
    private const BLOCKED_V6 = [
        '::/128', '::1/128', '64:ff9b:1::/48', '100::/64', '2001::/23', '2001:db8::/32', 'fc00::/7', 'fe80::/10',
        'ff00::/8',
    ];

    /** Blocked even when private addresses are allowed: link-local (cloud metadata) and "this host". */
    private const ALWAYS_BLOCKED = ['0.0.0.0/8', '169.254.0.0/16', 'fe80::/10', 'fd00:ec2::254/128', '::/128'];

    /** The Matomo server itself: with private addresses allowed, only for Matomo's own addresses (super users). */
    private const LOOPBACK = ['127.0.0.0/8', '::1/128'];

    /** @var \Closure(string): string[] */
    private \Closure $resolver;
    /**
     * this guard's lookups (one check run, or one API call): host => addresses. A failed lookup is kept only for the
     * proxied way, where it decides nothing; on the direct way the run's retry asks again. A resolver that drops
     * queries is still asked once per host: skipping it for later names after one silent answer would let a slow DNS
     * name of one website switch the private-address check off for the names after it. Each answer keeps the time its
     * lookup took (L8 review of 5.4.0, NIT 6).
     *
     * @var array<string, array{0: string[], 1: int}>
     */
    private array $answers = [];
    private Capabilities $capabilities;
    /** the default lookup (needs gethostbynamel or dns_get_record), not a resolver given by the caller */
    private bool $looksUp;

    /**
     * @param bool $allowPrivate super user setting "Allow private addresses"
     * @param \Closure|null $resolver returns the A and AAAA addresses of an ASCII host name; default DNS (resolver())
     * @param bool $loopbackForSites lets website targets reach the server's loopback too (tests only)
     * @param Capabilities|null $capabilities the PHP functions there are; default PHP's function_exists
     */
    public function __construct(private bool $allowPrivate, ?\Closure $resolver = null, private bool $loopbackForSites = false, ?Capabilities $capabilities = null)
    {
        $this->capabilities = $capabilities ?? new Capabilities();
        $this->looksUp = $resolver === null;
        $this->resolver = $resolver ?? self::resolver($this->capabilities);
    }

    /**
     * The disabled PHP functions that keep the guard from deciding: inet_pton or inet_ntop, and gethostbynamel with
     * dns_get_record when both are missing and the guard looks names up itself. Empty while it can decide.
     *
     * @return string[]
     */
    public function missingFunctions(): array
    {
        return $this->capabilities->missingForGuard($this->looksUp);
    }

    public function check(string $url, bool $instanceTarget = false): GuardDecision
    {
        [$scheme, $host, $port, $refusal] = self::parse($url, $this->capabilities);
        if ($refusal !== null) {
            return new GuardDecision(false, null, $refusal, $host, $port, $scheme, [], 0);
        }
        if (!$this->capabilities->canCompareAddresses()) {
            return self::disabled($host, $port, $scheme);
        }

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return $this->isAllowedIp($host, $instanceTarget)
                ? new GuardDecision(true, $host, null, $host, $port, $scheme, [$host], 0)
                : self::refuse($host, $port, $scheme);
        }
        if (self::isLocalName($host) && !$this->allowPrivate) {
            return self::refuse($host, $port, $scheme);
        }
        if ($this->looksUp && !$this->capabilities->canResolve()) {
            return self::disabled($host, $port, $scheme);
        }

        [$addresses, $lookupMs, $answerMs] = $this->lookup($host, false);
        if ($addresses === []) {
            return new GuardDecision(false, null, Outcome::DNS, $host, $port, $scheme, [], $lookupMs);
        }
        foreach ($addresses as $address) {
            if (!$this->isAllowedIp($address, $instanceTarget)) {
                return new GuardDecision(false, null, Outcome::BLOCKED, $host, $port, $scheme, [], $lookupMs, $answerMs);
            }
        }

        return new GuardDecision(true, $addresses[0], null, $host, $port, $scheme, $addresses, $lookupMs, $answerMs);
    }

    /**
     * Whether check() refuses the address without looking up a name: an address that is no http(s) URL, an IP address
     * outside what the settings allow (a website's address on the server's loopback always), or localhost and names
     * without a dot while private addresses are not allowed. A name that leads to a private address is refused only by
     * check(), after its lookup: false here.
     */
    public function refusesWithoutLookup(string $url, bool $instanceTarget = false): bool
    {
        [, $host, , $refusal] = self::parse($url, $this->capabilities);
        if ($refusal !== null) {
            // a name that needs intl: its check says why (note needs_intl), not "never checked"
            return $refusal !== Outcome::NEEDS_INTL;
        }
        if (!$this->capabilities->canCompareAddresses()) {
            // nothing is checkable from this PHP: its checks say why (note php_disabled), not "never checked"
            return false;
        }
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return !$this->isAllowedIp($host, $instanceTarget);
        }

        return self::isLocalName($host) && !$this->allowPrivate;
    }

    /**
     * For requests through Matomo's [proxy]: the proxy resolves the host and connects. Checked here are the scheme,
     * credentials, the host grammar and a literal address or local name in the URL; a name is also looked up on this
     * server, and every address it answers must pass, so a public name of a private address stays refused.
     *
     * Without gethostbynamel and dns_get_record a name cannot be looked up here: while private addresses are not
     * allowed it is not checkable (Outcome::PHP_DISABLED), as on the direct way, since nothing would show that it does
     * not lead into the internal network. With private addresses allowed the proxy alone decides then: a name of a
     * link-local or cloud metadata address, or of the server's loopback for a website, is not caught here (accepted:
     * the super user opened the checks to internal addresses, and such a server ran no checks before 5.3.1).
     */
    public function checkWithoutResolving(string $url, bool $instanceTarget = false): GuardDecision
    {
        [$scheme, $host, $port, $refusal] = self::parse($url, $this->capabilities);
        if ($refusal === Outcome::NEEDS_INTL) {
            return new GuardDecision(false, null, $refusal, $host, $port, $scheme, [], 0);
        }
        $blocked = $refusal !== null;
        $lookupMs = 0;
        if (!$blocked && !$this->capabilities->canCompareAddresses()) {
            return self::disabled($host, $port, $scheme);
        }
        if (!$blocked) {
            $blocked = filter_var($host, FILTER_VALIDATE_IP)
                ? !$this->isAllowedIp($host, $instanceTarget)
                : (self::isLocalName($host) && !$this->allowPrivate);
        }
        $name = !$blocked && !filter_var($host, FILTER_VALIDATE_IP);
        $cannotResolve = $this->looksUp && !$this->capabilities->canResolve();
        if ($name && $cannotResolve && !$this->allowPrivate) {
            // fail closed: the proxy would fetch a public name of a private address unchecked
            return self::disabled($host, $port, $scheme);
        }
        if ($name && !$cannotResolve) {
            // the proxy resolves the host; this server resolves it too, and its answers must pass as well. No answer
            // decides nothing (the proxy resolves), as before; each host is asked once per guard (audit D1)
            [$addresses, $lookupMs] = $this->lookup($host, true);
            foreach ($addresses as $address) {
                if (!$this->isAllowedIp($address, $instanceTarget)) {
                    $blocked = true;
                }
            }
        }

        return new GuardDecision(!$blocked, null, $blocked ? Outcome::BLOCKED : null, $host, $port, $scheme, [], $lookupMs);
    }

    /**
     * The addresses of a host, the time waited for them now (0 when this guard asked before) and the time the lookup
     * took when it was made.
     *
     * @param bool $keepFailed keep a lookup without an answer too (the proxied way)
     * @return array{0: string[], 1: int, 2: int}
     */
    private function lookup(string $host, bool $keepFailed): array
    {
        if (isset($this->answers[$host])) {
            return [$this->answers[$host][0], 0, $this->answers[$host][1]];
        }
        $started = microtime(true);
        $addresses = array_values(array_filter(
            array_map('strval', ($this->resolver)($host)),
            static fn(string $ip): bool => (bool) filter_var($ip, FILTER_VALIDATE_IP)
        ));
        $lookupMs = (int) round((microtime(true) - $started) * 1000);
        if ($addresses !== [] || $keepFailed) {
            $this->answers[$host] = [$addresses, $lookupMs];
        }

        return [$addresses, $lookupMs, $lookupMs];
    }

    /**
     * The host as curl will use it: lower case, without one trailing dot, internationalised names in ASCII (punycode).
     * Null when the host is not acceptable.
     */
    public static function normalizeHost(string $host, ?Capabilities $capabilities = null): ?string
    {
        return self::normalize($host, $capabilities ?? new Capabilities())[0];
    }

    /**
     * normalizeHost() with the reason of a refusal: Outcome::NEEDS_INTL for a name only intl converts safely on a PHP
     * without it, else Outcome::BLOCKED.
     *
     * Internationalised names as browsers (WHATWG URL) and libcurl's libidn2 map them: UTS46 nontransitional (IDNA2008,
     * ß stays ß: straße.de and strasse.de are two domains; L8 review of 5.4.0, SHOULD 4), with the joiner and bidi
     * rules. Without intl, Punycode gives the same names and refuses what UTS46 refuses (SHOULD 5).
     *
     * @return array{0: ?string, 1: ?string} the host, or null and the reason
     */
    private static function normalize(string $host, Capabilities $capabilities): array
    {
        $host = strtolower(trim($host));
        if ($host !== '' && $host[0] === '[' && substr($host, -1) === ']') {
            $inner = substr($host, 1, -1);
            return filter_var($inner, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? [$inner, null] : [null, Outcome::BLOCKED];
        }
        if (substr($host, -1) === '.') {
            $host = substr($host, 0, -1);
        }
        if ($host === '') {
            return [null, Outcome::BLOCKED];
        }
        if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            return [$host, null];
        }
        if (preg_match('/[^\x20-\x7e]/', $host)) {
            if ($capabilities->has('idn_to_ascii')) {
                $ascii = idn_to_ascii($host, IDNA_NONTRANSITIONAL_TO_ASCII | IDNA_CHECK_CONTEXTJ | IDNA_CHECK_BIDI, INTL_IDNA_VARIANT_UTS46);
            } else {
                // without intl (shared hosting, slim images): the same punycode by Punycode (audit D3)
                [$ascii, $why] = Punycode::convert($host, $capabilities);
                if ($ascii === null) {
                    return [null, $why === Punycode::UNSUPPORTED ? Outcome::NEEDS_INTL : Outcome::BLOCKED];
                }
            }
            if (!is_string($ascii) || $ascii === '') {
                return [null, Outcome::BLOCKED];
            }
            $host = strtolower($ascii);
        }
        if (!preg_match('/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/', $host) || strlen($host) > 253) {
            return [null, Outcome::BLOCKED];
        }
        // numeric forms curl may read as an address (0x7f.1, 2130706433, 127.1): only canonical IPv4 literals pass
        $labels = explode('.', $host);
        $last = (string) end($labels);
        if (preg_match('/^(0x[0-9a-f]*|[0-9]+)$/', $last)) {
            return [null, Outcome::BLOCKED];
        }

        return [$host, null];
    }

    public static function isPublicIp(string $ip): bool
    {
        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            return false;
        }
        $embedded = self::embeddedIpv4($ip);
        if ($embedded !== null) {
            return self::isPublicIp($embedded);
        }

        return !self::inRanges($ip, filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) ? self::BLOCKED_V4 : self::BLOCKED_V6);
    }

    /**
     * The default lookup: IPv4 through gethostbynamel (which reads the hosts file too), else the A records of
     * dns_get_record (the DNS server only); IPv6 from dns_get_record's AAAA records, so without dns_get_record IPv4
     * only. Calls only the functions that are there; without both it finds nothing (check() refuses first).
     *
     * @param \Closure|null $byName (string $host): string[]|false, default gethostbynamel (tests)
     * @param \Closure|null $records (string $host, int $type): array|false, default dns_get_record (tests)
     * @return \Closure(string): string[]
     */
    public static function resolver(Capabilities $capabilities, ?\Closure $byName = null, ?\Closure $records = null): \Closure
    {
        $byName ??= static fn(string $host) => gethostbynamel($host);
        $records ??= static fn(string $host, int $type) => @dns_get_record($host, $type);

        return static function (string $host) use ($capabilities, $byName, $records): array {
            $addresses = [];
            $withRecords = $capabilities->has('dns_get_record');
            if ($capabilities->has('gethostbynamel')) {
                $addresses = $byName($host) ?: [];
            } elseif ($withRecords) {
                foreach ($records($host, DNS_A) ?: [] as $record) {
                    if (!empty($record['ip'])) {
                        $addresses[] = $record['ip'];
                    }
                }
            }
            if ($withRecords) {
                foreach ($records($host, DNS_AAAA) ?: [] as $record) {
                    if (!empty($record['ipv6'])) {
                        $addresses[] = $record['ipv6'];
                    }
                }
            }

            return array_values(array_unique(array_map('strval', $addresses)));
        };
    }

    private function isAllowedIp(string $ip, bool $instanceTarget = false): bool
    {
        $embedded = self::embeddedIpv4($ip);
        $check = $embedded ?? $ip;
        if (self::inRanges($check, self::ALWAYS_BLOCKED)) {
            return false;
        }
        if (!$instanceTarget && !$this->loopbackForSites && self::inRanges($check, self::LOOPBACK)) {
            // a website's address set by a site admin must never probe the Matomo server itself
            return false;
        }

        return $this->allowPrivate || self::isPublicIp($ip);
    }

    /**
     * @return array{0: string, 1: string, 2: int, 3: ?string} scheme, host, port, refusal reason (null: acceptable)
     */
    private static function parse(string $url, Capabilities $capabilities): array
    {
        $parts = parse_url($url);
        if ($parts === false) {
            return ['', '', 0, Outcome::BLOCKED];
        }
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $port = (int) ($parts['port'] ?? ($scheme === 'http' ? 80 : 443));
        $raw = (string) ($parts['host'] ?? '');
        [$host, $why] = self::normalize($raw, $capabilities);
        if (!in_array($scheme, ['http', 'https'], true) || isset($parts['user']) || isset($parts['pass'])
            || $port < 1 || $port > 65535 || preg_match('/[\s\\\\]/', $url)
        ) {
            return [$scheme, (string) $host, $port, Outcome::BLOCKED];
        }
        if ($host === null) {
            // a name only intl converts safely, on a PHP without it: not checkable with its own note (security review
            // of D3), not "blocked by the settings"; a name UTS46 refuses is blocked with intl and without
            return [$scheme, '', $port, $why ?? Outcome::BLOCKED];
        }

        return [$scheme, $host, $port, null];
    }

    private static function refuse(string $host, int $port, string $scheme): GuardDecision
    {
        return new GuardDecision(false, null, Outcome::BLOCKED, $host, $port, $scheme, [], 0);
    }

    /** the PHP functions to decide are disabled on this server: not checkable, nothing looked up */
    private static function disabled(string $host, int $port, string $scheme): GuardDecision
    {
        return new GuardDecision(false, null, Outcome::PHP_DISABLED, $host, $port, $scheme, [], 0);
    }

    private static function isLocalName(string $host): bool
    {
        return strpos($host, '.') === false || $host === 'localhost' || substr($host, -10) === '.localhost';
    }

    /**
     * IPv6 forms that carry an IPv4 address: mapped, compatible, NAT64 (64:ff9b::/96) and 6to4 (2002::/16).
     */
    private static function embeddedIpv4(string $ip): ?string
    {
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) || !function_exists('inet_pton') || !function_exists('inet_ntop')) {
            return null;
        }
        $binary = (string) inet_pton($ip);
        $prefix = bin2hex(substr($binary, 0, 12));
        if ($prefix === '00000000000000000000ffff' || $prefix === '0064ff9b0000000000000000'
            || ($prefix === '000000000000000000000000' && bin2hex(substr($binary, 12, 4)) !== '00000000'
                && bin2hex(substr($binary, 12, 4)) !== '00000001')
        ) {
            return (string) inet_ntop(substr($binary, 12, 4));
        }
        if (bin2hex(substr($binary, 0, 2)) === '2002') {
            return (string) inet_ntop(substr($binary, 2, 4));
        }

        return null;
    }

    /**
     * @param string[] $cidrs
     */
    private static function inRanges(string $ip, array $cidrs): bool
    {
        if (!function_exists('inet_pton')) {
            return true; // cannot compare: counts as blocked (check() refuses earlier with php_disabled)
        }
        $binary = @inet_pton($ip);
        if ($binary === false) {
            return true;
        }
        foreach ($cidrs as $cidr) {
            [$network, $bits] = explode('/', $cidr);
            $net = @inet_pton($network);
            if ($net === false || strlen($net) !== strlen($binary)) {
                continue;
            }
            $bits = (int) $bits;
            $bytes = intdiv($bits, 8);
            if (substr($binary, 0, $bytes) !== substr($net, 0, $bytes)) {
                continue;
            }
            $rest = $bits % 8;
            if ($rest === 0) {
                return true;
            }
            $mask = (0xff << (8 - $rest)) & 0xff;
            if ((ord($binary[$bytes]) & $mask) === (ord($net[$bytes]) & $mask)) {
                return true;
            }
        }

        return false;
    }
}
