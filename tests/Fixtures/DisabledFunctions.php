<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures;

/**
 * PHP functions that hosts switch off in php.ini (disable_functions). In PHP 8 a disabled function does not exist:
 * function_exists() says false and a call throws \Error "Call to undefined function".
 */
final class DisabledFunctions
{
    /**
     * The exact disable_functions of a customer's host (5.3.0 hotfix): curl_multi_exec is off, curl_exec, curl_init,
     * curl_multi_init, gethostbynamel, dns_get_record and stream_socket_client are there.
     */
    public const SHARED_HOST = [
        'dl', 'disk_free_space', 'diskfreespace', 'stream_socket_sendto', 'proc_get_status', 'proc_nice', 'proc_open',
        'proc_terminate', 'proc_close', 'popen', 'curl_multi_exec', 'pcntl_exec', 'pcntl_fork', 'pcntl_setpriority',
        'symlink', 'link', 'posix_kill', 'posix_mkfifo', 'posix_setsid', 'posix_setuid', 'posix_setpgid',
        'posix_getpwuid', 'show_source', 'highlight_file', 'syslog', 'openlog', 'define_syslog_variables',
        'apache_child_terminate', 'apache_setenv', 'apache_note', 'exec', 'system', 'passthru',
    ];

    /**
     * Every function of PHP's curl extension (PHP 8.1 to 8.5): a host without curl, through disable_functions where the
     * extension cannot be left out of the test's PHP.
     */
    public const CURL = [
        'curl_close', 'curl_copy_handle', 'curl_errno', 'curl_error', 'curl_escape', 'curl_unescape', 'curl_multi_setopt',
        'curl_exec', 'curl_file_create', 'curl_getinfo', 'curl_init', 'curl_upkeep', 'curl_multi_add_handle',
        'curl_multi_close', 'curl_multi_errno', 'curl_multi_exec', 'curl_multi_getcontent', 'curl_multi_info_read',
        'curl_multi_init', 'curl_multi_remove_handle', 'curl_multi_select', 'curl_multi_strerror', 'curl_pause', 'curl_reset',
        'curl_setopt_array', 'curl_setopt', 'curl_share_close', 'curl_share_errno', 'curl_share_init', 'curl_share_setopt',
        'curl_share_strerror', 'curl_strerror', 'curl_version', 'curl_multi_get_handles', 'curl_share_init_persistent',
    ];

    /**
     * A function_exists() that says false for the given names, true for every function PHP has.
     *
     * @param string[] $disabled
     * @return \Closure(string): bool
     */
    public static function except(array $disabled): \Closure
    {
        return static fn(string $name): bool => !in_array($name, $disabled, true) && function_exists($name);
    }

    /**
     * Runs tests/Fixtures/disabled-child.php in a new PHP with these functions disabled through -d disable_functions,
     * as a host's php.ini does, and returns its JSON answer.
     *
     * @param string[] $disabled
     * @param string[] $args
     * @param array<string, string> $ini more php.ini settings for the child (-d)
     * @param bool $bare without php.ini and its extensions (php -n): only what is compiled into PHP
     * @return array{ok: bool, error?: string, results?: mixed}
     */
    public static function runChild(array $disabled, array $args, array $ini = [], bool $bare = false): array
    {
        $settings = [];
        foreach ($ini as $name => $value) {
            array_push($settings, '-d', $name . '=' . $value);
        }
        $command = array_merge([PHP_BINARY], $bare ? ['-n'] : [], ['-d', 'disable_functions=' . implode(',', $disabled)], $settings,
            [__DIR__ . '/disabled-child.php'], $args);
        $process = proc_open($command, [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
        if (!is_resource($process)) {
            throw new \RuntimeException('could not start the child PHP');
        }
        fclose($pipes[0]);
        $out = (string) stream_get_contents($pipes[1]);
        $err = (string) stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($process);
        $answer = json_decode($out, true);
        if (!is_array($answer)) {
            throw new \RuntimeException("no JSON from the child PHP: $out $err");
        }

        return $answer;
    }
}
