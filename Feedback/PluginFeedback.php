<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Feedback;

use Piwik\Config;
use Piwik\Container\StaticContainer;
use Piwik\Http;
use Piwik\SettingsPiwik;
use Psr\Log\LoggerInterface;

/**
 * Feedback thumbs ("Does the uptime page show Matomo and your website correctly?") and the support link next to them, the server side of the Feinwerk
 * feedback kit (docs/feedback-kit.md). The vote goes from the Matomo server to Feinwerk's store
 * (POST /api/v1/feedback): plugin, versions, question, vote, browser family and UI language, nothing about the user or
 * the website. config.ini [FeinwerkUptimeMonitor] feedback = 0 switches it off.
 */
class PluginFeedback
{
    public const PLUGIN = 'FeinwerkUptimeMonitor';
    /** the questions (store "topic") this plugin asks; the API accepts only these */
    public const TOPICS = ['page'];
    public const DEFAULT_STORE = 'https://plugins.feinwerk.io';
    private const TIMEOUT = 3; // seconds; the same in every plugin (feedback kit)
    /**
     * Sent instead of the visitor's browser string: without it Matomo's HTTP client forwards the browser's full
     * User-Agent (and puts it into the Via header), which the privacy line under the thumbs does not cover.
     */
    public const USER_AGENT = 'Feinwerk-Feedback/1.0';
    /**
     * per user and question: time of the last vote (one vote every 10 seconds, so a second question on the same page
     * still counts); deleted with the user and on uninstall
     */
    public const THROTTLE_OPTION_PREFIX = 'fw_uptimemonitor.feedback.';

    /** all throttle options of one user start with this */
    public static function userOptionPrefix(string $login): string
    {
        return self::THROTTLE_OPTION_PREFIX . md5($login) . '.';
    }

    public static function throttleOption(string $login, string $topic): string
    {
        return self::userOptionPrefix($login) . $topic;
    }

    /** Option::deleteLike pattern for a deleted user: its throttles, also the per-user key of 1.0.0 and 1.0.1 */
    public static function userOptionPattern(string $login): string
    {
        return self::THROTTLE_OPTION_PREFIX . md5($login) . '%';
    }

    /** votes this Matomo sends to the store per minute at most, all users and questions together */
    public const SERVER_CAP = 20;
    public const SERVER_OPTION = self::THROTTLE_OPTION_PREFIX . 'server';

    /**
     * Counts a vote against the server's cap. $stored is the SERVER_OPTION value ("minute:count").
     *
     * @return string|null the new value to store, null when the cap of this minute is reached
     */
    public static function countVote(?string $stored, int $now, int $cap = self::SERVER_CAP): ?string
    {
        $minute = intdiv($now, 60);
        [$was, $count] = array_map('intval', explode(':', (string) $stored) + [0, 0]);
        if ($was !== $minute) {
            $count = 0;
        }
        return $count < $cap ? $minute . ':' . ($count + 1) : null;
    }

    /** @var callable Http::sendHttpRequestBy or a test double with the same arguments */
    private $transport;

    /** @var bool the votes would leave through Matomo's HTTP client, not a test double */
    private $usesMatomoHttp;

    public function __construct(?callable $transport = null)
    {
        $this->usesMatomoHttp = $transport === null;
        $this->transport = $transport ?? [Http::class, 'sendHttpRequestBy'];
    }

    /** @return array<string, ?string> the request body of the store contract (unknown browser or language: null) */
    public static function payload(string $topic, string $vote, string $pluginVersion, string $matomoVersion, string $userAgent, string $language): array
    {
        if (!in_array($topic, self::TOPICS, true)) {
            throw new \InvalidArgumentException('topic');
        }
        if (!in_array($vote, ['up', 'down'], true)) {
            throw new \InvalidArgumentException('vote');
        }
        $browser = self::browser($userAgent);
        $language = mb_substr((string) preg_replace('/[^A-Za-z_-]/', '', $language), 0, 10);
        return [
            'plugin' => self::PLUGIN,
            'plugin_version' => mb_substr($pluginVersion, 0, 30),
            'matomo_version' => mb_substr($matomoVersion, 0, 30),
            'topic' => $topic,
            'vote' => $vote,
            'browser' => $browser !== '' ? $browser : null,
            'language' => $language !== '' ? $language : null,
        ];
    }

    /** Browser family and major version ("Chrome 141"), empty when unknown. Order matters: Edge and Opera also say Chrome. */
    public static function browser(string $userAgent): string
    {
        $patterns = [
            'Edge' => '/\bEdg(?:e|A|iOS)?\/(\d+)/',
            'Opera' => '/\bOPR\/(\d+)/',
            'Firefox' => '/\bFirefox\/(\d+)/',
            'Chrome' => '/\b(?:Chrome|CriOS)\/(\d+)/',
            'Safari' => '/\bVersion\/(\d+)[.\d]* (?:Mobile\/\S+ )?Safari\//',
        ];
        foreach ($patterns as $family => $pattern) {
            if (preg_match($pattern, $userAgent, $m)) {
                return $family . ' ' . $m[1];
            }
        }
        return '';
    }

    /** The Feinwerk contact form with the topic "Plugins" preselected. */
    public static function supportUrl(string $language): string
    {
        $page = $language === 'de' ? 'de/kontakt' : 'en/contact';
        return 'https://feinwerk.io/' . $page . '?service=plugins&mtm_campaign=plugin-support&mtm_source=' . self::PLUGIN;
    }

    public static function enabled(): bool
    {
        $section = Config::getInstance()->{self::PLUGIN};
        $testMode = defined('PIWIK_TEST_MODE') && PIWIK_TEST_MODE;
        return self::enabledBy(is_array($section) ? $section : [], SettingsPiwik::isInternetEnabled(), $testMode);
    }

    /**
     * @param array<string, mixed> $section the plugin's config.ini section
     * @param bool $internetEnabled Matomo's [General] enable_internet_features: its HTTP client does not check it, so
     *                              with it off nothing may be sent
     * @param bool $testMode Matomo's PIWIK_TEST_MODE: test runs (sandboxes, CI) never reach the store
     */
    public static function enabledBy(array $section, bool $internetEnabled = true, bool $testMode = false): bool
    {
        if (!$internetEnabled || $testMode) {
            return false;
        }
        if (!array_key_exists('feedback', $section)) {
            return true;
        }
        // Matomo's INI reader turns off, no and false into PHP false; an empty value counts as off as well
        $value = $section['feedback'];
        return $value !== false && $value !== null
            && !in_array(strtolower(trim((string) $value)), ['0', '', 'off', 'no', 'false'], true);
    }

    /** The store the connector talks to (a test store too), else Feinwerk's store. */
    public static function endpoint(): string
    {
        $factory = '\Piwik\Plugins\FeinwerkMarketplaceConnector\MarketplaceClientFactory';
        $base = '';
        try {
            if (class_exists($factory) && method_exists($factory, 'url')) {
                $base = (string) $factory::url();
            }
        } catch (\Throwable $e) {
            $base = '';
        }
        return rtrim($base !== '' ? $base : self::DEFAULT_STORE, '/') . '/api/v1/feedback';
    }

    /**
     * False while Matomo runs in test mode (PIWIK_TEST_MODE: CI, integration tests) and the real HTTP client would send:
     * no test vote reaches the store, whatever the caller checked. A test double may always run.
     */
    public function isEnabled(): bool
    {
        return !($this->usesMatomoHttp && defined('PIWIK_TEST_MODE') && PIWIK_TEST_MODE);
    }

    /** curl, fopen or socket for Matomo's own client; a test double needs none (and the unit tests load no Matomo). */
    private function transportMethod(): ?string
    {
        return $this->transport === [Http::class, 'sendHttpRequestBy'] ? Http::getTransportMethod() : null;
    }

    /** Sends the vote; failures (store unreachable, endpoint missing) are logged and never shown to the user. */
    public function send(array $payload): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }
        // Matomo's client also copies an incoming proxy chain (HTTP_VIA) into its Via header: leave it out.
        $via = $_SERVER['HTTP_VIA'] ?? null;
        unset($_SERVER['HTTP_VIA']);
        try {
            $response = ($this->transport)(
                $this->transportMethod(),
                self::endpoint(),
                self::TIMEOUT,
                self::USER_AGENT,
                null,
                null,
                0,
                false,
                false,
                false,
                true,
                'POST',
                null,
                null,
                json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ['Content-Type: application/json', 'Accept: application/json']
            );
        } catch (\Throwable $e) {
            // \Throwable: an \Error in Matomo's HTTP client (a TypeError when curl cannot start) would reach the user
            self::log(self::PLUGIN . ': feedback not sent: {message}', ['message' => $e->getMessage()]);
            return false;
        } finally {
            if ($via !== null) {
                $_SERVER['HTTP_VIA'] = $via;
            }
        }
        $status = (int) ($response['status'] ?? 0);
        if ($status < 200 || $status >= 300) {
            self::log(self::PLUGIN . ': feedback not accepted (HTTP {status})', ['status' => $status]);
            return false;
        }
        return true;
    }

    /** A vote that fails is only logged: a failing logger (no container yet) must not turn it into an error either. */
    private static function log(string $message, array $context): void
    {
        try {
            StaticContainer::get(LoggerInterface::class)->info($message, $context);
        } catch (\Throwable $e) {
            // nothing left to tell anybody
        }
    }
}
