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
     * @param bool $allowPrivate super user setting "Allow private addresses"
     * @param \Closure|null $resolver returns the A and AAAA addresses of an ASCII host name; default DNS
     * @param bool $loopbackForSites lets website targets reach the server's loopback too (tests only)
     */
    public function __construct(private bool $allowPrivate, ?\Closure $resolver = null, private bool $loopbackForSites = false)
    {
        $this->resolver = $resolver ?? \Closure::fromCallable([self::class, 'resolve']);
    }

    public function check(string $url, bool $instanceTarget = false): GuardDecision
    {
        [$scheme, $host, $port, $refusal] = self::parse($url);
        if ($refusal !== null) {
            return self::refuse($host, $port, $scheme);
        }

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return $this->isAllowedIp($host, $instanceTarget)
                ? new GuardDecision(true, $host, null, $host, $port, $scheme, [$host], 0)
                : self::refuse($host, $port, $scheme);
        }
        if (self::isLocalName($host) && !$this->allowPrivate) {
            return self::refuse($host, $port, $scheme);
        }

        $started = microtime(true);
        $addresses = array_values(array_filter(
            array_map('strval', ($this->resolver)($host)),
            static fn(string $ip): bool => (bool) filter_var($ip, FILTER_VALIDATE_IP)
        ));
        $lookupMs = (int) round((microtime(true) - $started) * 1000);
        if ($addresses === []) {
            return new GuardDecision(false, null, Outcome::DNS, $host, $port, $scheme, [], $lookupMs);
        }
        foreach ($addresses as $address) {
            if (!$this->isAllowedIp($address, $instanceTarget)) {
                return new GuardDecision(false, null, Outcome::BLOCKED, $host, $port, $scheme, [], $lookupMs);
            }
        }

        return new GuardDecision(true, $addresses[0], null, $host, $port, $scheme, $addresses, $lookupMs);
    }

    /**
     * For requests through Matomo's [proxy]: the proxy resolves the host, so only the scheme, credentials, the host
     * grammar and a literal address or local name in the URL are checked here.
     */
    public function checkWithoutResolving(string $url, bool $instanceTarget = false): GuardDecision
    {
        [$scheme, $host, $port, $refusal] = self::parse($url);
        $blocked = $refusal !== null;
        $lookupMs = 0;
        if (!$blocked) {
            $blocked = filter_var($host, FILTER_VALIDATE_IP)
                ? !$this->isAllowedIp($host, $instanceTarget)
                : (self::isLocalName($host) && !$this->allowPrivate);
        }
        if (!$blocked && !filter_var($host, FILTER_VALIDATE_IP)) {
            // the proxy resolves the host; where this server can resolve it too, its answers must pass as well
            $started = microtime(true);
            $addresses = array_filter(array_map('strval', ($this->resolver)($host)), static fn(string $ip): bool => (bool) filter_var($ip, FILTER_VALIDATE_IP));
            $lookupMs = (int) round((microtime(true) - $started) * 1000);
            foreach ($addresses as $address) {
                if (!$this->isAllowedIp($address, $instanceTarget)) {
                    $blocked = true;
                }
            }
        }

        return new GuardDecision(!$blocked, null, $blocked ? Outcome::BLOCKED : null, $host, $port, $scheme, [], $lookupMs);
    }

    /**
     * The host as curl will use it: lower case, without one trailing dot, internationalised names in ASCII (punycode).
     * Null when the host is not acceptable.
     */
    public static function normalizeHost(string $host): ?string
    {
        $host = strtolower(trim($host));
        if ($host !== '' && $host[0] === '[' && substr($host, -1) === ']') {
            $inner = substr($host, 1, -1);
            return filter_var($inner, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? $inner : null;
        }
        if (substr($host, -1) === '.') {
            $host = substr($host, 0, -1);
        }
        if ($host === '') {
            return null;
        }
        if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            return $host;
        }
        if (preg_match('/[^\x20-\x7e]/', $host)) {
            if (!function_exists('idn_to_ascii')) {
                return null;
            }
            $ascii = idn_to_ascii($host, IDNA_DEFAULT, INTL_IDNA_VARIANT_UTS46);
            if (!is_string($ascii) || $ascii === '') {
                return null;
            }
            $host = strtolower($ascii);
        }
        if (!preg_match('/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/', $host) || strlen($host) > 253) {
            return null;
        }
        // numeric forms curl may read as an address (0x7f.1, 2130706433, 127.1): only canonical IPv4 literals pass
        $labels = explode('.', $host);
        $last = (string) end($labels);
        if (preg_match('/^(0x[0-9a-f]*|[0-9]+)$/', $last)) {
            return null;
        }

        return $host;
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
     * @return string[]
     */
    public static function resolve(string $host): array
    {
        $addresses = gethostbynamel($host) ?: [];
        $records = @dns_get_record($host, DNS_AAAA) ?: [];
        foreach ($records as $record) {
            if (!empty($record['ipv6'])) {
                $addresses[] = $record['ipv6'];
            }
        }

        return array_values(array_unique($addresses));
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
    private static function parse(string $url): array
    {
        $parts = parse_url($url);
        if ($parts === false) {
            return ['', '', 0, Outcome::BLOCKED];
        }
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $port = (int) ($parts['port'] ?? ($scheme === 'http' ? 80 : 443));
        $host = self::normalizeHost((string) ($parts['host'] ?? ''));
        if (!in_array($scheme, ['http', 'https'], true) || $host === null || isset($parts['user']) || isset($parts['pass'])
            || $port < 1 || $port > 65535 || preg_match('/[\s\\\\]/', $url)
        ) {
            return [$scheme, (string) $host, $port, Outcome::BLOCKED];
        }

        return [$scheme, $host, $port, null];
    }

    private static function refuse(string $host, int $port, string $scheme): GuardDecision
    {
        return new GuardDecision(false, null, Outcome::BLOCKED, $host, $port, $scheme, [], 0);
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
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
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
