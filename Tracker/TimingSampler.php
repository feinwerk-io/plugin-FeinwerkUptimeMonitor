<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Tracker;

use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Capabilities;

/**
 * Processing time of real tracking requests (spec 6.6), measured on Matomo's event `Tracker.end` for one request in
 * `$sampleRate`. A miss does nothing else: no settings, options, database or request body. The plugin's own check of
 * matomo.php (a GET without parameters) is never sampled, and no error may ever reach the tracking request.
 */
final class TimingSampler
{
    /** @var \Closure(int, int): int */
    private \Closure $random;

    /**
     * @param int $sampleRate 1 in this many requests; 0 switches it off
     * @param \Closure(string, int, bool): void $insert writes one sample: UTC time, milliseconds, bulk request
     * @param \Closure(int, int): int|null $random random_int by default, mt_rand where the host disabled it, and no
     *                                        sample where it disabled both
     * @param Capabilities|null $capabilities the PHP functions there are; default PHP's function_exists
     */
    public function __construct(private int $sampleRate, private \Closure $insert, ?\Closure $random = null, ?Capabilities $capabilities = null)
    {
        $this->random = $random ?? self::random($capabilities ?? new Capabilities());
    }

    /** @return \Closure(int, int): int */
    private static function random(Capabilities $capabilities): \Closure
    {
        if ($capabilities->has('random_int')) {
            return static fn(int $min, int $max): int => random_int($min, $max);
        }
        if ($capabilities->has('mt_rand')) {
            return static fn(int $min, int $max): int => mt_rand($min, $max);
        }

        return static fn(int $min, int $max): int => $min - 1; // never a hit
    }

    /**
     * @param array $server $_SERVER (REQUEST_TIME_FLOAT)
     * @param array $get $_GET
     * @param array $post $_POST
     * @param \Closure(): string $rawBody reads the request body; called only on a hit
     */
    public function onTrackerEnd(array $server, array $get, array $post, \Closure $rawBody): void
    {
        try {
            if ($this->sampleRate <= 0 || ($this->random)(1, $this->sampleRate) !== 1) {
                return;
            }
            $started = (float) ($server['REQUEST_TIME_FLOAT'] ?? 0);
            if ($started <= 0) {
                return;
            }
            // matomo.js sends bulk requests as a form-encoded JSON body, so $_POST is not empty then: read the body
            // whenever there is no query string
            $body = $get === [] ? trim((string) $rawBody()) : '';
            if ($get === [] && $post === [] && $body === '') {
                return; // a bare GET: Matomo's fixed page, our own check, nothing tracked
            }
            $ms = (int) round((microtime(true) - $started) * 1000);
            $isBulk = str_contains($body, '"requests"') || isset($post['requests']);
            ($this->insert)(gmdate('Y-m-d H:i:s'), max(0, $ms), $isBulk);
        } catch (\Throwable $e) {
            // never break or slow a tracking request
        }
    }
}
