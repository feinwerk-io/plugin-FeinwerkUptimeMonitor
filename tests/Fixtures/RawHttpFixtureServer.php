<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures;

/**
 * A local TCP server (tests/Fixtures/raw-server.php) that answers request targets with exact bytes: chunked and
 * compressed bodies, interim answers, malformed and dripped answers, and CONNECT to the local TLS fixture servers as a
 * proxy. requests() returns the request heads it received.
 */
final class RawHttpFixtureServer
{
    /** @var resource|null */
    private static $process;
    private static int $port = 0;
    private static string $dir = '';

    public static function start(): string
    {
        if (self::$process !== null) {
            return self::baseUrl();
        }
        self::$dir = sys_get_temp_dir() . '/fwum-raw-' . bin2hex(random_bytes(6));
        mkdir(self::$dir, 0700);
        $process = proc_open([PHP_BINARY, __DIR__ . '/raw-server.php', self::$dir], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes);
        if (!is_resource($process)) {
            throw new \RuntimeException('could not start the raw fixture server');
        }
        self::$process = $process;
        stream_set_blocking($pipes[1], false);
        $deadline = microtime(true) + 10;
        $line = '';
        while (microtime(true) < $deadline && strpos($line, "\n") === false) {
            $line .= (string) fgets($pipes[1]);
            usleep(20000);
        }
        self::$port = (int) trim($line);
        if (self::$port <= 0) {
            self::stop();
            throw new \RuntimeException('the raw fixture server did not start');
        }

        return self::baseUrl();
    }

    public static function stop(): void
    {
        if (self::$process !== null) {
            proc_terminate(self::$process, 9);
            proc_close(self::$process);
            self::$process = null;
        }
        if (self::$dir !== '' && is_dir(self::$dir)) {
            array_map('unlink', glob(self::$dir . '/*') ?: []);
            rmdir(self::$dir);
            self::$dir = '';
        }
    }

    public static function baseUrl(): string
    {
        return 'http://127.0.0.1:' . self::$port;
    }

    public static function port(): int
    {
        return self::$port;
    }

    /** Matomo's [proxy] settings for this server as a proxy (CONNECT to the local TLS fixture servers) */
    public static function asProxy(): array
    {
        return ['host' => '127.0.0.1', 'port' => (string) self::$port];
    }

    /** bytes the proxy sends right after its answer to CONNECT ('' for none), as a broken proxy might */
    public static function connectExtra(string $bytes): void
    {
        file_put_contents(self::$dir . '/connect-extra', $bytes);
    }

    /** @return string[] the request heads received so far, oldest first */
    public static function requests(): array
    {
        clearstatcache(true, self::$dir . '/requests.log');
        $log = (string) @file_get_contents(self::$dir . '/requests.log');

        return array_values(array_filter(explode("\n----\n", $log), static fn(string $head): bool => $head !== ''));
    }
}
