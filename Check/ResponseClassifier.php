<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Check;

/**
 * Turns what the prober got back into up, down or not checkable, with the cause. A status code alone never counts:
 * proxies and CDNs answer 200 with error bodies, so every kind has a content marker.
 */
final class ResponseClassifier
{
    /** Matomo's answer to a GET of matomo.php without parameters (core/Tracker/Response.php, 5.0.0 and 6.0.0). */
    public const MARKER_TRACKER = 'This resource is part of Matomo';

    /** In every build of matomo.js and piwik.js, also when a tracking proxy passes it on. */
    public const MARKER_JS = 'getAsyncTracker';

    /** Matomo's login form (plugins/Login templates, 5.0.0 and 6.0.0). */
    public const MARKER_LOGIN = 'name="form_login"';

    /** Body of Matomo's tracking proxy when it cannot fetch matomo.js from Matomo (it still answers 200). */
    public const MARKER_PROXY_ERROR = 'there was an error loading matomo.js';

    public function classify(Target $target, ProbeResponse $response, string $checkedAt): CheckResult
    {
        [$outcome, $error, $note] = $this->decide($target, $response);
        // the tracker, matomo.js and containers follow only the redirect to their own address with https (audit D2)
        if ($outcome === Outcome::UP && $note === null && !in_array($target->kind, [Kind::WEB, Kind::UI], true)
            && $response->redirects > 0 && self::isHttpsUpgrade($target->url, $response->finalUrl)
        ) {
            $note = Outcome::HTTPS_REDIRECT;
        }
        // an address found on the website, not confirmed by anyone, has to answer once before it can be an outage
        // (a redirecting or unusual tracking path would otherwise alarm at once)
        if ($outcome === Outcome::DOWN && $target->urlSource === 'detected' && $target->firstUpAt === null) {
            $outcome = Outcome::NOT_CHECKABLE;
        }

        return new CheckResult(
            $target->id,
            $outcome,
            $error,
            $note,
            $response->status,
            $response->timings,
            $response->certNotAfter,
            $checkedAt
        );
    }

    /**
     * @return array{0: string, 1: ?string, 2: ?string} outcome, error, note
     */
    private function decide(Target $target, ProbeResponse $response): array
    {
        if ($response->error !== null) {
            return $this->transportFailure($target, $response->error);
        }
        $status = (int) $response->status;
        $body = $response->body;

        switch ($target->kind) {
            case Kind::UI:
                return $this->ui($target, $response, $status);
            case Kind::TRACKER:
                if ($status === 503) {
                    return self::down(Outcome::TRACKING_OFF);
                }
                if ($status >= 300 && $status < 400) {
                    return self::down(Outcome::REDIRECT);
                }
                if ($status !== 200) {
                    return self::down(Outcome::HTTP_STATUS);
                }
                return str_contains($body, self::MARKER_TRACKER) || self::emptyTrackerAnswer($response) ? self::up() : self::down(Outcome::CONTENT);
            case Kind::JS:
            case Kind::PROXY:
                if ($status >= 300 && $status < 400) {
                    return self::down(Outcome::REDIRECT);
                }
                if ($status !== 200) {
                    return self::down(Outcome::HTTP_STATUS);
                }
                if (str_contains($body, self::MARKER_PROXY_ERROR)) {
                    return self::down(Outcome::CONTENT);
                }
                // Matomo's PHP tracking proxy answers with matomo.js; a web server or CDN forwarding the path to Matomo
                // answers with Matomo's own page for a request without parameters: both mean the path reaches Matomo
                $reached = str_contains($body, self::MARKER_JS)
                    || ($target->kind === Kind::PROXY && (str_contains($body, self::MARKER_TRACKER) || self::emptyTrackerAnswer($response)));
                return $reached ? self::up() : self::down(Outcome::CONTENT);
            case Kind::CONTAINER:
                return $this->container($target, $status, $body, $response->capped);
            case Kind::WEB:
            default:
                if ($status >= 200 && $status < 300) {
                    return self::up();
                }
                // basic auth or bot protection in front of a website this server never reached: not an outage
                if ($target->firstUpAt === null && in_array($status, [401, 403, 407, 429], true)) {
                    return [Outcome::NOT_CHECKABLE, Outcome::HTTP_STATUS, Outcome::PROTECTED];
                }
                return self::down(Outcome::HTTP_STATUS);
        }
    }

    /**
     * Whether $to is $from with https: http to https, the same host, both on their default port (80, 443), the same path
     * and query, no credentials. Matomo stored as http behind a proxy that handles https: the web server redirects every
     * address so.
     */
    public static function isHttpsUpgrade(string $from, string $to): bool
    {
        $a = parse_url($from);
        $b = parse_url($to);
        if (!is_array($a) || !is_array($b) || strtolower((string) ($a['scheme'] ?? '')) !== 'http'
            || strtolower((string) ($b['scheme'] ?? '')) !== 'https' || isset($b['user']) || isset($b['pass'])
        ) {
            return false;
        }

        return strtolower((string) ($a['host'] ?? '')) === strtolower((string) ($b['host'] ?? '')) && ($a['host'] ?? '') !== ''
            && (int) ($a['port'] ?? 80) === 80 && (int) ($b['port'] ?? 443) === 443
            && ($a['path'] ?? '/') === ($b['path'] ?? '/') && ($a['query'] ?? '') === ($b['query'] ?? '');
    }

    /**
     * Matomo's tracker with its note hidden: some hosts answer a GET of matomo.php without parameters with HTTP 200 and
     * an empty body (a plugin or a server rule), while tracking works. Such an answer still carries the header Matomo's
     * tracker sends on every answer (core Tracker\Response::init, 5.0.0 to 6.0.0: Access-Control-Allow-Credentials:
     * true); an empty answer without it comes from something else and stays unexpected content.
     */
    private static function emptyTrackerAnswer(ProbeResponse $response): bool
    {
        return trim($response->body) === ''
            && strtolower($response->headers['access-control-allow-credentials'] ?? '') === 'true';
    }

    /**
     * @return array{0: string, 1: ?string, 2: ?string}
     */
    private function transportFailure(Target $target, string $error): array
    {
        // the server's PHP cannot send the request, or Matomo's internet features are off: nothing was checked, the
        // note says why
        if (in_array($error, Outcome::NOTHING_SENT, true)) {
            return [Outcome::NOT_CHECKABLE, null, $error];
        }
        // a guard refusal or a failing proxy is a configuration matter, never an outage of the target
        if ($error === Outcome::BLOCKED || $error === Outcome::PROXY) {
            return [Outcome::NOT_CHECKABLE, $error, null];
        }
        // never reached from this server: hairpin NAT, a hosts file entry, a router's certificate, a firewall
        if ($target->firstUpAt === null && in_array($error, [Outcome::DNS, Outcome::CONNECT, Outcome::TLS], true)) {
            return [Outcome::NOT_CHECKABLE, $error, null];
        }
        return self::down($error);
    }

    /**
     * @return array{0: string, 1: ?string, 2: ?string}
     */
    private function ui(Target $target, ProbeResponse $response, int $status): array
    {
        $host = strtolower((string) parse_url($response->finalUrl, PHP_URL_HOST));
        $loginHost = strtolower((string) ($target->extra['loginHost'] ?? ''));
        $matomoHost = strtolower((string) ($target->extra['matomoHost'] ?? ''));
        // the configured address's own host counts too (an interface address set by hand, e.g. an internal name)
        $configuredHost = strtolower((string) parse_url($target->url, PHP_URL_HOST));
        $ownHost = $host === $matomoHost || $host === $configuredHost || ($loginHost !== '' && $host === $loginHost);
        if ($status === 401 || $status === 403) {
            // basic auth in front of Matomo; from another host (a CDN challenge, a foreign redirect) it proves nothing
            return $ownHost ? [Outcome::UP, null, Outcome::PROTECTED] : self::down(Outcome::CONTENT);
        }
        if ($status === 503) {
            return self::down(Outcome::MAINTENANCE);
        }
        if ($status >= 300 && $status < 400) {
            return self::down(Outcome::REDIRECT);
        }
        if ($status !== 200) {
            return self::down(Outcome::HTTP_STATUS);
        }
        if ($loginHost !== '' && $host === $loginHost) {
            return self::up();
        }
        if (($host === $matomoHost || $host === $configuredHost) && str_contains($response->body, self::MARKER_LOGIN)) {
            return self::up();
        }
        return self::down(Outcome::CONTENT);
    }

    /**
     * The container file names its id and, when published, its live revision. A body cut at the cap (a container
     * larger than Prober::MAX_BODY_LARGE) may stop before the id or before a whole revision number ("3" at the cut can
     * be 30): then it proves neither a current nor an outdated container, and the result is not checkable with the
     * note too_large instead of an outage.
     *
     * @return array{0: string, 1: ?string, 2: ?string}
     */
    private function container(Target $target, int $status, string $body, bool $capped): array
    {
        if ($status !== 200) {
            return self::down($status >= 300 && $status < 400 ? Outcome::REDIRECT : Outcome::HTTP_STATUS);
        }
        $tooLarge = [Outcome::NOT_CHECKABLE, Outcome::CONTENT, Outcome::TOO_LARGE];
        $id = (string) ($target->extra['idContainer'] ?? '');
        if ($id === '') {
            return self::down(Outcome::CONTENT);
        }
        // Matomo pretty-prints the container JSON in development mode: allow spaces after the colon
        if (!preg_match('/"id":\s*' . preg_quote((string) json_encode($id), '/') . '/', $body)) {
            return $capped ? $tooLarge : self::down(Outcome::CONTENT);
        }
        // without a live revision (a container set by hand that is no longer published) only the id is checked
        if (isset($target->extra['revision'])) {
            $revision = (int) $target->extra['revision'];
            if (self::wholeMatch('/"revision":\s*' . $revision . '(?![0-9])/', $body, $capped)) {
                return self::up();
            }
            // cut before the key, inside it or inside the number: no whole revision was read, so none is outdated
            if ($capped && !self::wholeMatch('/"revision":\s*[0-9]+(?![0-9])/', $body, true)) {
                return $tooLarge;
            }
            return self::down(Outcome::STALE_CONTAINER);
        }
        return self::up();
    }

    /**
     * Whether the pattern matches in the body as a whole: in a body cut at the cap, a match that touches the end may go
     * on past it ("revision":3 there can be 30) and does not count.
     */
    private static function wholeMatch(string $pattern, string $body, bool $capped): bool
    {
        if (preg_match_all($pattern, $body, $matches, PREG_OFFSET_CAPTURE) < 1) {
            return false;
        }
        foreach ($matches[0] as [$text, $offset]) {
            if (!$capped || $offset + strlen($text) < strlen($body)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array{0: string, 1: null, 2: null}
     */
    private static function up(): array
    {
        return [Outcome::UP, null, null];
    }

    /**
     * @return array{0: string, 1: string, 2: null}
     */
    private static function down(string $error): array
    {
        return [Outcome::DOWN, $error, null];
    }
}
