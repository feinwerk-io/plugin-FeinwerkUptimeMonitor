<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Check;

/**
 * Outcomes of a check, the error classes that explain a failure and the notes on a success.
 */
final class Outcome
{
    public const UP = 'up';
    public const DOWN = 'down';
    public const NOT_CHECKABLE = 'not_checkable';

    // transport errors, reported by the prober
    public const DNS = 'dns';
    public const CONNECT = 'connect';
    public const TLS = 'tls';
    public const TIMEOUT = 'timeout';
    public const BLOCKED = 'blocked';
    public const PROTOCOL = 'protocol';
    public const PROXY = 'proxy';

    // errors found in the answer
    public const HTTP_STATUS = 'http_status';
    public const CONTENT = 'content';
    public const REDIRECT = 'redirect';
    public const MAINTENANCE = 'maintenance';
    public const TRACKING_OFF = 'tracking_off';
    public const STALE_CONTAINER = 'stale_container';

    // notes on a result: protected (up, or not checkable, behind a password or bot protection), too_large (not
    // checkable: a Tag Manager container larger than Prober::MAX_BODY_LARGE, cut before its id or revision)
    public const PROTECTED = 'protected';
    public const TOO_LARGE = 'too_large';

    public const TRANSPORT_ERRORS = [self::DNS, self::CONNECT, self::TLS, self::TIMEOUT, self::BLOCKED, self::PROTOCOL, self::PROXY];
}
