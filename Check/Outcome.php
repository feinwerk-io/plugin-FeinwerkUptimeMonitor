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
    /**
     * PHP functions the checks need are disabled on this server (php.ini disable_functions): no request was sent. As a
     * transport error from the prober or the guard; the result is not checkable with this note and no error.
     */
    public const PHP_DISABLED = 'php_disabled';
    /**
     * Matomo's internet features are switched off ([General] enable_internet_features = 0) and the opt-in
     * [FeinwerkUptimeMonitor] checkWithInternetFeaturesOff = 1 is not set: no lookup, no request. As a transport error
     * from the prober; the result is not checkable with this note and no error, like PHP_DISABLED.
     */
    public const INTERNET_OFF = 'internet_off';
    /**
     * PHP has no intl extension (no idn_to_ascii) and the address's host has characters that only intl converts safely
     * (other scripts, full-width letters, dot variants): not checked, nothing looked up or sent (Http\Punycode converts
     * plain Latin letters with common diacritics without intl). As a refusal of the guard; the result is not
     * checkable with this note and no error.
     */
    public const NEEDS_INTL = 'needs_intl';

    // errors found in the answer
    public const HTTP_STATUS = 'http_status';
    public const CONTENT = 'content';
    public const REDIRECT = 'redirect';
    public const MAINTENANCE = 'maintenance';
    public const TRACKING_OFF = 'tracking_off';
    public const STALE_CONTAINER = 'stale_container';

    // notes on a result: protected (up, or not checkable, behind a password or bot protection), too_large (not
    // checkable: a Tag Manager container larger than Prober::MAX_BODY_LARGE, cut before its id or revision),
    // php_disabled (not checkable: self::PHP_DISABLED), internet_off (not checkable: self::INTERNET_OFF), needs_intl
    // (not checkable: self::NEEDS_INTL)
    public const PROTECTED = 'protected';
    public const TOO_LARGE = 'too_large';
    /**
     * up: the address answered after one redirect to itself with https (Matomo stored as http behind a TLS proxy); the
     * admin page suggests checking the https address directly. Only on kinds that follow no other redirects.
     */
    public const HTTPS_REDIRECT = 'https_redirect';

    public const TRANSPORT_ERRORS = [self::DNS, self::CONNECT, self::TLS, self::TIMEOUT, self::BLOCKED, self::PROTOCOL, self::PROXY, self::PHP_DISABLED, self::INTERNET_OFF, self::NEEDS_INTL];
    /** notes of a result for which nothing was requested: no answer, no certificate date, nothing about the target */
    public const NOTHING_SENT = [self::PHP_DISABLED, self::INTERNET_OFF, self::NEEDS_INTL];
}
