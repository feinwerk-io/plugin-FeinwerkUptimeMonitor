<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

// Started by DisabledFunctions::runChild() in a PHP with -d disable_functions=..., as on a host whose php.ini switches
// functions off. Runs the plugin's own code with PHP's real function_exists() and prints one JSON line:
// {ok: true, results: ...} or {ok: false, error: "<class>: <message>"} when anything throws.
//
//   php -d disable_functions=curl_multi_exec disabled-child.php probe http://127.0.0.1:PORT [names]
//   php -d disable_functions=stream_socket_client disabled-child.php handshake 127.0.0.1 PORT
//   php -d disable_functions=random_int disabled-child.php sample
//   php -d disable_functions=sleep disabled-child.php pause
//   php -d max_execution_time=30 -d disable_functions=set_time_limit disabled-child.php timelimit
//   php -d disable_functions=idn_to_ascii disabled-child.php idn https://müller.de/
//   php -d curl.cainfo=/nonexistent/ca.pem disabled-child.php tls https://localhost:PORT/ <ca file|-> <retry 0|1> <multi|sequential>
//   php -d curl.cainfo=<ca file> disabled-child.php tlsrun <ca file|-> <retry 0|1> <multi|sequential> <total ms> <url> [<url> ...]
//       (each URL in its own probeAll() of one prober, as a run's first checks and its retry phase)

use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Target;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\AddressGuard;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Capabilities;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\CertificateReader;
use Piwik\Plugins\FeinwerkUptimeMonitor\Http\Prober;
use Piwik\Plugins\FeinwerkUptimeMonitor\Runner\Runtime;
use Piwik\Plugins\FeinwerkUptimeMonitor\Tracker\TimingSampler;

// the plugin's classes only, without composer (the Matomo test job has no vendor/ of the plugin)
spl_autoload_register(static function (string $class): void {
    $prefix = 'Piwik\\Plugins\\FeinwerkUptimeMonitor\\';
    if (strncmp($class, $prefix, strlen($prefix)) === 0) {
        $file = dirname(__DIR__, 2) . '/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
        if (is_file($file)) {
            require $file;
        }
    }
});

$mode = $argv[1] ?? '';
try {
    if ($mode === 'probe') {
        $base = (string) ($argv[2] ?? '');
        $port = (int) parse_url($base, PHP_URL_PORT);
        $targets = [
            new Target(1, 0, 'web1', Kind::WEB, $base . '/ok', 'default'),
            new Target(2, 0, 'web2', Kind::WEB, $base . '/r1', 'default'),
            new Target(3, 0, 'web3', Kind::WEB, $base . '/big', 'default'),
            new Target(4, 0, 'tracker', Kind::TRACKER, $base . '/matomo.php', 'default'),
        ];
        if (($argv[3] ?? '') === 'names') {
            // a name, for runs without dns_get_record (it would ask a name server): gethostbynamel reads the hosts file
            $targets[] = new Target(5, 0, 'web5', Kind::WEB, 'http://localhost:' . $port . '/ok', 'default');
        }
        $prober = new Prober(new AddressGuard(true, null, true), [], 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8);
        $results = [];
        foreach ($prober->probeAll($targets, microtime(true) + 30) as $id => $r) {
            $results[$id] = ['status' => $r->status, 'error' => $r->error, 'redirects' => $r->redirects,
                'capped' => $r->capped, 'length' => strlen($r->body), 'finalUrl' => $r->finalUrl];
        }
        echo json_encode(['ok' => true, 'results' => $results]);
    } elseif ($mode === 'handshake') {
        $date = CertificateReader::fromHandshake('localhost', (string) ($argv[2] ?? ''), (int) ($argv[3] ?? 0), 1.0);
        echo json_encode(['ok' => true, 'results' => $date]);
    } elseif ($mode === 'sample') {
        // a tracking request, sampled at a rate of 1
        $samples = [];
        (new TimingSampler(1, static function (string $at, int $ms, bool $isBulk) use (&$samples): void {
            $samples[] = $ms;
        }))->onTrackerEnd(['REQUEST_TIME_FLOAT' => microtime(true) - 0.1], ['idsite' => '1', 'rec' => '1'], [], static fn(): string => '');
        echo json_encode(['ok' => true, 'results' => count($samples)]);
    } elseif ($mode === 'pause') {
        $start = microtime(true);
        Runtime::pause(new Capabilities(), 1);
        echo json_encode(['ok' => true, 'results' => round(microtime(true) - $start, 1)]);
    } elseif ($mode === 'tls') {
        // the prober against tests/Fixtures/tls-server.php; this PHP's curl.cainfo stands for the server's trust store
        $caFile = (string) ($argv[3] ?? '-');
        $capabilities = ($argv[5] ?? 'multi') === 'sequential'
            ? new Capabilities(static fn(string $name): bool => $name !== 'curl_multi_exec' && function_exists($name)) : new Capabilities();
        $guard = new AddressGuard(true, static fn(string $host): array => $host === 'localhost' ? ['127.0.0.1'] : [], true);
        $prober = new Prober($guard, [], 'FeinwerkUptimeMonitor-Test', 2000, 5000, 8, $caFile === '-' ? null : $caFile, $capabilities, ($argv[4] ?? '0') === '1');
        $r = $prober->probeAll([new Target(1, 1, 'web1', Kind::WEB, (string) ($argv[2] ?? ''), 'default')], microtime(true) + 30)[1];
        echo json_encode(['ok' => true, 'results' => ['status' => $r->status, 'error' => $r->error, 'body' => $r->body]]);
    } elseif ($mode === 'tlsrun') {
        $caFile = (string) ($argv[2] ?? '-');
        $capabilities = ($argv[4] ?? 'multi') === 'sequential'
            ? new Capabilities(static fn(string $name): bool => $name !== 'curl_multi_exec' && function_exists($name)) : new Capabilities();
        $guard = new AddressGuard(true, static fn(string $host): array => $host === 'localhost' ? ['127.0.0.1'] : [], true);
        $prober = new Prober($guard, [], 'FeinwerkUptimeMonitor-Test', 2000, (int) ($argv[5] ?? 5000), 8, $caFile === '-' ? null : $caFile,
            $capabilities, ($argv[3] ?? '0') === '1');
        $results = [];
        foreach (array_slice($argv, 6) as $i => $url) {
            $r = $prober->probeAll([new Target($i + 1, 1, 'web' . ($i + 1), Kind::WEB, $url, 'default')], microtime(true) + 30)[$i + 1];
            $results[] = ['status' => $r->status, 'error' => $r->error, 'body' => $r->body, 'redirects' => $r->redirects,
                'total' => $r->timings['total'], 'tls' => $r->timings['tls']];
        }
        echo json_encode(['ok' => true, 'results' => $results]);
    } elseif ($mode === 'idn') {
        // a website address with umlauts on a PHP without idn_to_ascii (intl missing or disabled)
        $guard = new AddressGuard(false, static fn(string $host): array => ['93.184.215.14']);
        $decision = $guard->check((string) ($argv[2] ?? ''));
        echo json_encode(['ok' => true, 'results' => ['allowed' => $decision->allowed, 'reason' => $decision->reason, 'host' => $decision->host,
            'refusedWithoutLookup' => $guard->refusesWithoutLookup((string) ($argv[2] ?? ''))]]);
    } elseif ($mode === 'timelimit') {
        echo json_encode(['ok' => true, 'results' => Runtime::raiseTimeLimit(new Capabilities(), 180)]);
    } else {
        echo json_encode(['ok' => false, 'error' => 'usage: probe <base url> | handshake <ip> <port> | sample | pause | timelimit | tls <url> <ca file|-> <retry> <transport> | tlsrun <ca file|-> <retry> <transport> <total ms> <url>...']);
    }
} catch (\Throwable $e) {
    echo json_encode(['ok' => false, 'error' => get_class($e) . ': ' . $e->getMessage()]);
}
