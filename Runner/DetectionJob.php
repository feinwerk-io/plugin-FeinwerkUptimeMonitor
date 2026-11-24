<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Runner;

use Piwik\Option;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\AdoptionPolicy;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\DetectedTargets;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\Detector;

/**
 * Once a day: what the websites' HTML says about the tracker, a tracking proxy and containers (spec 5.4). Uses the
 * bodies of that run's website checks, so it costs no extra request. Found URLs on Matomo's host or the website's own
 * hosts are adopted (never over a URL set by hand); anything else is stored as a suggestion.
 */
final class DetectionJob
{
    public const OPTION_SUGGESTIONS = 'fw_uptimemonitor_suggestions';

    public function __construct(private TargetStore $targets, private Detector $detector = new Detector())
    {
    }

    /**
     * Reads one page as the runner gets it (keeps only the findings, not the body).
     */
    public function read(string $body, string $url): DetectedTargets
    {
        return $this->detector->detect($body, $url);
    }

    /**
     * What the pages show, without writing: candidates to adopt and to suggest.
     *
     * @param array<int, array{url: string, found: DetectedTargets}> $pages by idSite: the main URL and what it showed
     * @param array<int, string[]> $siteHosts by idSite: hosts of the main and alias URLs
     * @return array{adopt: list<array{idSite: int, key: string, kind: string, url: string, extra: array}>, suggested: array<int, list<array>>}
     */
    public function plan(array $pages, string $matomoHost, array $siteHosts): array
    {
        $byKey = [];
        foreach ($this->targets->all() as $target) {
            $byKey[$target->idSite . '|' . $target->key] = $target;
        }
        $adopt = [];
        $suggested = [];
        foreach ($pages as $idSite => $page) {
            $found = $page['found'];
            $hosts = $siteHosts[$idSite] ?? [strtolower((string) parse_url($page['url'], PHP_URL_HOST))];
            foreach ($this->candidates($found, $matomoHost, $hosts, $idSite) as $candidate) {
                // Matomo's own addresses are never changed by a website's HTML: a suggestion for super users only
                if ($candidate['idSite'] === 0
                    || AdoptionPolicy::decide($candidate['url'], $matomoHost, $hosts) !== AdoptionPolicy::ADOPT
                ) {
                    $suggested[$idSite][] = $candidate;
                    continue;
                }
                $current = $byKey[$candidate['idSite'] . '|' . $candidate['key']] ?? null;
                if ($current !== null && ($current->urlSource === TargetStore::SOURCE_MANUAL || $current->url === $candidate['url'])) {
                    continue;
                }
                // a container that is not live in this Matomo has no revision to compare
                if ($candidate['kind'] === Kind::CONTAINER && $current === null) {
                    $suggested[$idSite][] = $candidate;
                    continue;
                }
                $adopt[] = $candidate + ['extra' => $current->extra ?? ['matomoHost' => $matomoHost]];
            }
        }

        return ['adopt' => $adopt, 'suggested' => $suggested];
    }

    /**
     * Adopts the planned URLs and stores the suggestions of the websites in the plan (other websites' suggestions stay).
     *
     * @param array{adopt: list<array>, suggested: array<int, list<array>>} $plan
     * @param int[] $idSites the websites the plan looked at
     */
    public function apply(array $plan, array $idSites): void
    {
        foreach ($plan['adopt'] as $candidate) {
            $this->targets->setUrl($candidate['idSite'], $candidate['key'], $candidate['kind'], $candidate['url'],
                TargetStore::SOURCE_DETECTED, $candidate['extra']);
        }
        $stored = json_decode((string) Option::get(self::OPTION_SUGGESTIONS), true);
        $stored = is_array($stored) ? $stored : [];
        foreach ($idSites as $idSite) {
            unset($stored[$idSite]);
            if (!empty($plan['suggested'][$idSite])) {
                $stored[$idSite] = $plan['suggested'][$idSite];
            }
        }
        $encoded = json_encode($stored);
        if ((string) Option::get(self::OPTION_SUGGESTIONS) !== $encoded) {
            Option::set(self::OPTION_SUGGESTIONS, $encoded);
        }
    }

    /**
     * Plan and apply (the daily run).
     *
     * @return array{adopt: list<array>, suggested: array<int, list<array>>}
     */
    public function run(array $pages, string $matomoHost, array $siteHosts): array
    {
        $plan = $this->plan($pages, $matomoHost, $siteHosts);
        $this->apply($plan, array_keys($pages));

        return $plan;
    }

    /**
     * @return array<int, list<array>> stored suggestions by idSite
     */
    public static function suggestions(): array
    {
        $stored = json_decode((string) Option::get(self::OPTION_SUGGESTIONS), true);

        return is_array($stored) ? $stored : [];
    }

    /**
     * @return list<array{idSite: int, key: string, kind: string, url: string}>
     */
    private function candidates(DetectedTargets $found, string $matomoHost, array $siteHosts, int $idSite): array
    {
        $out = $this->rawCandidates($found, $matomoHost, $siteHosts, $idSite);

        // the tracker, the JavaScript tracker and a proxy are checked with a request without parameters
        return array_values(array_filter($out, static fn(array $c): bool => !self::hasQuery($c['url'])));
    }

    public static function hasQuery(string $url): bool
    {
        return parse_url($url, PHP_URL_QUERY) !== null || parse_url($url, PHP_URL_FRAGMENT) !== null;
    }

    private function rawCandidates(DetectedTargets $found, string $matomoHost, array $siteHosts, int $idSite): array
    {
        $out = [];
        $hostOf = static fn(string $url): string => strtolower((string) parse_url($url, PHP_URL_HOST));
        if ($found->trackerUrl !== null) {
            $host = $hostOf($found->trackerUrl);
            if ($host !== $matomoHost && in_array($host, $siteHosts, true)) {
                // the tracker on the website's own host: a tracking proxy; its bare GET answers with matomo.js
                $out[] = ['idSite' => $idSite, 'key' => Kind::PROXY, 'kind' => Kind::PROXY, 'url' => $found->trackerUrl];
            } else {
                $out[] = ['idSite' => 0, 'key' => Kind::TRACKER, 'kind' => Kind::TRACKER, 'url' => $found->trackerUrl];
            }
        }
        if ($found->jsUrl !== null && $hostOf($found->jsUrl) !== '' && !in_array($hostOf($found->jsUrl), $siteHosts, true)) {
            $out[] = ['idSite' => 0, 'key' => Kind::JS, 'kind' => Kind::JS, 'url' => $found->jsUrl];
        }
        foreach ($found->containerUrls as $id => $url) {
            if ($hostOf($url) !== $matomoHost) {
                $out[] = ['idSite' => $idSite, 'key' => 'ctr:' . $id, 'kind' => Kind::CONTAINER, 'url' => $url];
            }
        }

        return $out;
    }
}
