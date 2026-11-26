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
    } elseif ($mode === 'timelimit') {
        echo json_encode(['ok' => true, 'results' => Runtime::raiseTimeLimit(new Capabilities(), 180)]);
    } else {
        echo json_encode(['ok' => false, 'error' => 'usage: probe <base url> | handshake <ip> <port> | sample | pause | timelimit']);
    }
} catch (\Throwable $e) {
    echo json_encode(['ok' => false, 'error' => get_class($e) . ': ' . $e->getMessage()]);
}
