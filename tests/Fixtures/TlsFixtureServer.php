<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Fixtures;

/**
 * Local HTTPS servers (tests/Fixtures/tls-server.php) whose certificates only the test's own CA files trust: for the
 * prober's choice of CA file without the network. Five ports: self (a self-signed certificate), internal (a certificate
 * of an internal CA, internalCa()), expired (an expired certificate of that CA), chain (a certificate of that CA sent
 * with the CA's own) and wrongname (a certificate of that CA for another host name); accepts() counts the handshakes a
 * client started on a port, delay() slows them down.
 */
final class TlsFixtureServer
{
    /** @var resource|null */
    private static $process;
    /** @var array<string, int> port by name: self, internal, expired, chain, wrongname */
    private static array $ports = [];
    private static string $dir = '';

    /**
     * Starts the server once; null with the reason when it cannot run here (no openssl extension, no proc_open).
     */
    public static function start(): ?string
    {
        if (self::$process !== null) {
            return null;
        }
        if (!extension_loaded('openssl') || !function_exists('proc_open')) {
            return 'needs the openssl extension and proc_open';
        }
        self::$dir = sys_get_temp_dir() . '/fwum-tls-' . bin2hex(random_bytes(6));
        mkdir(self::$dir, 0700);
        $process = proc_open([PHP_BINARY, __DIR__ . '/tls-server.php', self::$dir], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes);
        if (!is_resource($process)) {
            return 'could not start the TLS fixture server';
        }
        self::$process = $process;
        stream_set_blocking($pipes[1], false);
        // three throwaway keys and the wait until the expired certificate has expired: slow runners need longer
        $deadline = microtime(true) + 30;
        $line = '';
        while (microtime(true) < $deadline && strpos($line, "\n") === false) {
            $line .= (string) fgets($pipes[1]);
            usleep(20000);
        }
        $ports = array_map('intval', explode(' ', trim($line)));
        $names = ['self', 'internal', 'expired', 'chain', 'wrongname'];
        self::$ports = count($ports) === count($names) ? array_combine($names, $ports) : [];
        if (self::$ports === [] || min(self::$ports) <= 0 || !is_file(self::$dir . '/server.pem')) {
            self::stop();
            return 'the TLS fixture server did not start';
        }

        return null;
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

    /** https://localhost:PORT/ of a port (self, internal, expired, chain or wrongname; all but wrongname name localhost) */
    public static function url(string $name = 'self', string $path = '/'): string
    {
        return 'https://localhost:' . self::$ports[$name] . $path;
    }

    /**
     * a CA file with the internal CA: trusts the ports internal, chain, expired (only until it expired) and wrongname
     * (except for its name)
     */
    public static function internalCa(): string
    {
        return self::$dir . '/ca.pem';
    }

    /** how many connections a client opened to the port so far (each one a handshake) */
    public static function accepts(string $name): int
    {
        clearstatcache(true, self::$dir . '/accepts-' . $name);

        return (int) @filesize(self::$dir . '/accepts-' . $name);
    }

    /** the port waits this long before each handshake (0: not at all) */
    public static function delay(string $name, int $ms): void
    {
        file_put_contents(self::$dir . '/delay-' . $name, (string) $ms);
    }

    /** a CA file that trusts the server (its own certificate) */
    public static function trustingCa(): string
    {
        return self::$dir . '/server.pem';
    }

    /** a CA file that does not trust the server: stands for Matomo's bundle, which no test certificate is in */
    public static function otherCa(): string
    {
        return self::$dir . '/other.pem';
    }
}
