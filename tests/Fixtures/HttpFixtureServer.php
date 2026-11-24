<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures;

/**
 * A local HTTP server (PHP's built-in server with http-router.php) for tests that need real HTTP without the network.
 * Several workers so that parallel requests to /slow really run in parallel.
 */
final class HttpFixtureServer
{
    /** @var resource|null */
    private static $process;
    private static int $port = 0;

    public static function start(): string
    {
        if (self::$process !== null) {
            return self::baseUrl();
        }
        $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $errstr);
        if ($socket === false) {
            throw new \RuntimeException("no free port: $errstr");
        }
        $name = (string) stream_socket_get_name($socket, false);
        fclose($socket);
        self::$port = (int) substr($name, strrpos($name, ':') + 1);

        $cmd = [PHP_BINARY, '-S', '127.0.0.1:' . self::$port, __DIR__ . '/http-router.php'];
        $env = ['PHP_CLI_SERVER_WORKERS' => '24'];
        $process = proc_open($cmd, [0 => ['pipe', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, null, $env);
        if (!is_resource($process)) {
            throw new \RuntimeException('could not start the fixture server');
        }
        self::$process = $process;

        $deadline = microtime(true) + 5;
        while (microtime(true) < $deadline) {
            $probe = @fsockopen('127.0.0.1', self::$port, $errno, $errstr, 0.2);
            if ($probe !== false) {
                fclose($probe);
                return self::baseUrl();
            }
            usleep(50000);
        }
        self::stop();
        throw new \RuntimeException('fixture server did not start');
    }

    public static function stop(): void
    {
        if (self::$process === null) {
            return;
        }
        $status = proc_get_status(self::$process);
        if (!empty($status['pid'])) {
            // the built-in server forks workers: end them too
            exec('pkill -TERM -P ' . (int) $status['pid'] . ' 2>/dev/null');
        }
        proc_terminate(self::$process, 15);
        proc_close(self::$process);
        self::$process = null;
    }

    /**
     * Whether the server answers requests side by side (PHP_CLI_SERVER_WORKERS needs fork support; some CI
     * containers serve one request at a time). Two 1 s requests at once: parallel when both finish in under 1.8 s.
     */
    public static function isParallel(): bool
    {
        static $parallel = null;
        if ($parallel !== null) {
            return $parallel;
        }
        $multi = curl_multi_init();
        $handles = [];
        for ($i = 0; $i < 2; $i++) {
            $handle = curl_init(self::baseUrl() . '/slow?s=1&probe=' . $i);
            curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($handle, CURLOPT_TIMEOUT, 5);
            curl_multi_add_handle($multi, $handle);
            $handles[] = $handle;
        }
        $start = microtime(true);
        do {
            curl_multi_exec($multi, $running);
            curl_multi_select($multi, 0.1);
        } while ($running > 0);
        foreach ($handles as $handle) {
            curl_multi_remove_handle($multi, $handle);
        }
        curl_multi_close($multi);
        $parallel = microtime(true) - $start < 1.8;

        return $parallel;
    }

    public static function baseUrl(): string
    {
        return 'http://127.0.0.1:' . self::$port;
    }

    public static function port(): int
    {
        return self::$port;
    }
}
