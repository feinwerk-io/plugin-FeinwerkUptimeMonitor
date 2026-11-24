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
                return str_contains($body, self::MARKER_TRACKER) ? self::up() : self::down(Outcome::CONTENT);
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
                    || ($target->kind === Kind::PROXY && str_contains($body, self::MARKER_TRACKER));
                return $reached ? self::up() : self::down(Outcome::CONTENT);
            case Kind::CONTAINER:
                return $this->container($target, $status, $body);
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
     * @return array{0: string, 1: ?string, 2: ?string}
     */
    private function transportFailure(Target $target, string $error): array
    {
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
     * @return array{0: string, 1: ?string, 2: ?string}
     */
    private function container(Target $target, int $status, string $body): array
    {
        if ($status !== 200) {
            return self::down($status >= 300 && $status < 400 ? Outcome::REDIRECT : Outcome::HTTP_STATUS);
        }
        $id = (string) ($target->extra['idContainer'] ?? '');
        // Matomo pretty-prints the container JSON in development mode: allow spaces after the colon
        if ($id === '' || !preg_match('/"id":\s*' . preg_quote((string) json_encode($id), '/') . '/', $body)) {
            return self::down(Outcome::CONTENT);
        }
        // without a live revision (a container set by hand that is no longer published) only the id is checked
        if (isset($target->extra['revision'])) {
            $revision = (int) $target->extra['revision'];
            if (!preg_match('/"revision":\s*' . $revision . '(?![0-9])/', $body)) {
                return self::down(Outcome::STALE_CONTAINER);
            }
        }
        return self::up();
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
