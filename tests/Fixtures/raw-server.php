<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

// Started by RawHttpFixtureServer::start(): a plain TCP server that answers each request target with exact bytes
// (framing, encodings, interim answers, malformed answers, answers dripped over time), for the prober's transports
// without the network. Many connections at once, one event loop. Prints its port on the first line.
//
// It is also a proxy for CONNECT to 127.0.0.1 or localhost (other targets get 403): it answers 200 and relays the bytes,
// so https through Matomo's proxy reaches the TLS fixture servers.
//
// Every request head it receives is appended to <directory>/requests.log, followed by a line "----".
//
//   php raw-server.php <directory>

$dir = (string) ($argv[1] ?? '');
if ($dir === '' || !is_dir($dir)) {
    fwrite(STDERR, "usage: raw-server.php <directory>\n");
    exit(2);
}
$server = stream_socket_server('tcp://127.0.0.1:0', $errno, $errstr);
if ($server === false) {
    fwrite(STDERR, "no server: $errstr\n");
    exit(1);
}
$name = (string) stream_socket_get_name($server, false);
$port = (int) substr($name, strrpos($name, ':') + 1);
file_put_contents($dir . '/requests.log', '');

$ok = static fn(string $body, array $headers = []): string => "HTTP/1.1 200 OK\r\n" . implode('', array_map(static fn(string $h): string => "$h\r\n", $headers))
    . 'Content-Length: ' . strlen($body) . "\r\n\r\n" . $body;
$redirect = static fn(string $location, int $status = 302): string => "HTTP/1.1 $status Found\r\nLocation: $location\r\nContent-Length: 0\r\n\r\n";
$chunked = static function (array $pieces, string $headers = ''): string {
    $out = "HTTP/1.1 200 OK\r\n{$headers}Transfer-Encoding: chunked\r\n\r\n";
    foreach ($pieces as $piece) {
        $out .= dechex(strlen($piece)) . "\r\n" . $piece . "\r\n";
    }
    return $out . "0\r\n\r\n";
};
$gzip = gzencode('hello gzip, ' . str_repeat('abc', 100));
$bomb = gzencode(str_repeat('x', 10 * 1024 * 1024), 9);
$bigBomb = gzencode(str_repeat('x', 40 * 1024 * 1024), 9);

// target => list of [delay in ms after the previous step, bytes]; the connection closes after the last step
$routes = [
    '/ok' => [[0, $ok('ok')]],
    '/chunked' => [[0, "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5;name=x\r\nhello\r\n6\r\n world\r\n0\r\nX-Trailer: yes\r\n\r\n"]],
    '/chunked-and-length' => [[0, "HTTP/1.1 200 OK\r\nContent-Length: 3\r\nTransfer-Encoding: chunked\r\n\r\n5\r\nhello\r\n6\r\n world\r\n0\r\n\r\n"]],
    '/chunked-split' => [[0, "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5\r"], [50, "\nhel"], [50, "lo\r\n0\r"], [50, "\n\r\n"]],
    '/continue' => [[0, "HTTP/1.1 100 Continue\r\n\r\nHTTP/1.1 103 Early Hints\r\nLink: </x.css>\r\n\r\n"
        . $ok('ok', ['Access-Control-Allow-Credentials: true'])]],
    '/gzip' => [[0, $ok($gzip, ['Content-Encoding: gzip'])]],
    '/x-gzip' => [[0, $ok($gzip, ['Content-Encoding: x-gzip'])]],
    '/gzip-chunked' => [[0, $chunked(str_split($gzip, 37), "Content-Encoding: gzip\r\n")]],
    '/deflate' => [[0, $ok(gzcompress('hello deflate'), ['Content-Encoding: deflate'])]],
    '/raw-deflate' => [[0, $ok(gzdeflate('hello raw deflate'), ['Content-Encoding: deflate'])]],
    '/gzip-bomb' => [[0, $chunked(str_split($bomb, 4096), "Content-Encoding: gzip\r\n")]],
    // 40 KB of gzip in one piece: one read of 8 KB would inflate to 8 MB at once
    '/gzip-bomb-whole' => [[0, $ok($bigBomb, ['Content-Encoding: gzip'])]],
    '/bad-gzip' => [[0, $ok('this is not gzip at all', ['Content-Encoding: gzip'])]],
    '/br' => [[0, $ok('not really brotli', ['Content-Encoding: br'])]],
    '/short' => [[0, "HTTP/1.1 200 OK\r\nContent-Length: 10\r\n\r\nhello"]],
    '/bad-chunk' => [[0, "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\nzz\r\nhello\r\n0\r\n\r\n"]],
    '/short-chunked' => [[0, "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5\r\nhel"]],
    '/http09' => [[0, "hello world\n"]],
    '/empty' => [],
    '/lf' => [[0, "HTTP/1.1 200 OK\nContent-Length: 2\n\nok"]],
    // LF header lines, a CRLF empty line (as some CGI scripts write them)
    '/lf-crlf-end' => [[0, "HTTP/1.1 200 OK\nContent-Length: 2\n\r\nok"]],
    '/lowercase' => [[0, "http/1.1 200 OK\r\nContent-Length: 2\r\n\r\nok"]],
    '/lowercase-404' => [[0, "http/1.1 404 Not Found\r\nContent-Length: 9\r\n\r\nnot found"]],
    // obs-fold (RFC 9112, 5.2): a line that starts with a space or a tab continues the field before
    '/folded-length' => [[0, "HTTP/1.1 200 OK\r\nX-A: a\r\n Content-Length: 2\r\n\r\nokEXTRA"]],
    '/folded-location' => [[0, "HTTP/1.1 302 Found\r\nX-A: a\r\n\tLocation: /other\r\nContent-Length: 0\r\n\r\n"]],
    '/folded-first' => [[0, "HTTP/1.1 200 OK\r\n Content-Length: 2\r\nX-B: b\r\n\r\nokEXTRA"]],
    '/folded-kept' => [[0, "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Credentials:\r\n true\r\nContent-Length: 2\r\n\r\nok"]],
    '/folded-location-value' => [[0, "HTTP/1.1 302 Found\r\nLocation:\r\n /other\r\nContent-Length: 0\r\n\r\n"]],
    '/two-lengths' => [[0, "HTTP/1.1 200 OK\r\nContent-Length: 2\r\nContent-Length: 3\r\n\r\nok!"]],
    '/same-length-twice' => [[0, "HTTP/1.1 200 OK\r\nContent-Length: 2\r\nContent-Length: 2\r\n\r\nok"]],
    '/empty-location' => [[0, "HTTP/1.1 302 Found\r\nLocation: \r\nLocation: /other\r\nContent-Length: 0\r\n\r\n"]],
    '/other' => [[0, $ok('other')]],
    // one chunk of one byte more than the body cap of a website (Prober::MAX_BODY)
    '/big-chunk' => [[0, $chunked([str_repeat('c', 262145)])]],
    '/no-reason' => [[0, "HTTP/1.1 204\r\n\r\n"]],
    '/not-modified' => [[0, "HTTP/1.1 304 Not Modified\r\nContent-Length: 5\r\n\r\n"]],
    '/until-close' => [[0, "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nuntil close"]],
    '/http10' => [[0, "HTTP/1.0 200 OK\r\n\r\nold"]],
    '/kept' => [[0, $ok('', ['access-control-allow-credentials:   TRUE  ', 'X-Other: 1'])]],
    '/kept-long' => [[0, $ok('', ['Access-Control-Allow-Credentials: ' . str_repeat('t', 100)])]],
    '/rel/a/b' => [[0, $redirect('../c?x=1')]],
    '/rel/c?x=1' => [[0, $ok('c')]],
    '/rq' => [[0, $redirect('?q=2')]],
    '/rq?q=2' => [[0, $ok('rq')]],
    '/netpath' => [[0, $redirect('//127.0.0.1:' . $port . '/ok')]],
    '/dots' => [[0, $redirect('/a/./b/../../ok')]],
    '/fragment' => [[0, $redirect('/ok#top')]],
    '/to-ftp' => [[0, $redirect('ftp://127.0.0.1/x')]],
    '/no-location' => [[0, "HTTP/1.1 302 Found\r\nContent-Length: 0\r\n\r\n"]],
    '/two-locations' => [[0, "HTTP/1.1 302 Found\r\nLocation: /ok\r\nLocation: /rel/c?x=1\r\nContent-Length: 0\r\n\r\n"]],
    '/404' => [[0, "HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\n\r\nnot found"]],
    // one byte of the body every 300 ms: each read waits less than any read timeout, the whole takes 30 s
    '/drip' => array_merge([[0, "HTTP/1.1 200 OK\r\nContent-Length: 100\r\n\r\n"]], array_fill(0, 100, [300, 'x'])),
    // the head itself one byte every 300 ms
    '/drip-head' => array_map(static fn(string $byte): array => [300, $byte], str_split("HTTP/1.1 200 OK\r\nX-Slow: " . str_repeat('y', 60) . "\r\n\r\nok")),
    '/huge-head' => [[0, "HTTP/1.1 200 OK\r\nX-Big: " . str_repeat('h', 300 * 1024) . "\r\nContent-Length: 2\r\n\r\nok"]],
    '/many-interim' => [[0, str_repeat("HTTP/1.1 100 Continue\r\n\r\n", 100) . $ok('ok')]],
    // 300 KB of tiny header lines (102000), within the head's limit; 2000 header lines; 2001; 2001 with an interim answer's
    '/tiny-lines' => [[0, "HTTP/1.1 200 OK\r\n" . str_repeat("a:\n", 102000) . "Content-Length: 2\r\n\r\nok"]],
    '/lines-2000' => [[0, "HTTP/1.1 200 OK\r\n" . str_repeat("X-N: n\r\n", 1999) . "Content-Length: 2\r\n\r\nok"]],
    '/lines-2001' => [[0, "HTTP/1.1 200 OK\r\n" . str_repeat("X-N: n\r\n", 2000) . "Content-Length: 2\r\n\r\nok"]],
    '/lines-interim' => [[0, "HTTP/1.1 103 Early Hints\r\n" . str_repeat("Link: </x.css>\r\n", 1000) . "\r\nHTTP/1.1 200 OK\r\n"
        . str_repeat("X-N: n\r\n", 1000) . "Content-Length: 2\r\n\r\nok"]],
    // the rest of the body never comes: the server closes after 600 ms
    '/close-late' => [[0, "HTTP/1.1 200 OK\r\nContent-Length: 10\r\n\r\nx"], [600, '']],
    '/long-chunk-line' => [[0, "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5;" . str_repeat('e', 5000) . "\r\nhello\r\n0\r\n\r\n"]],
];

/** @var array<int, array{socket: resource, in: string, steps: list<array{0: int, 1: string}>, due: float, peer: resource|null}> $clients */
$clients = [];
$log = static function (string $head) use ($dir): void {
    file_put_contents($dir . '/requests.log', $head . "\n----\n", FILE_APPEND);
};

echo $port, "\n";
fflush(STDOUT);

while (true) {
    $read = [$server];
    $timeout = 1.0;
    $now = microtime(true);
    foreach ($clients as $id => $client) {
        if ($client['steps'] === null || $client['peer'] !== null) {
            $read[] = $client['socket'];
        }
        if ($client['peer'] !== null) {
            $read[] = $client['peer'];
        }
        if ($client['steps'] !== null) {
            $timeout = min($timeout, max(0.0, $client['due'] - $now));
        }
    }
    $write = $except = null;
    if (@stream_select($read, $write, $except, (int) $timeout, (int) (($timeout - floor($timeout)) * 1000000)) === false) {
        continue;
    }
    foreach ($read as $socket) {
        if ($socket === $server) {
            $connection = @stream_socket_accept($server, 0);
            if ($connection !== false) {
                $clients[(int) $connection] = ['socket' => $connection, 'in' => '', 'steps' => null, 'due' => 0.0, 'peer' => null];
            }
            continue;
        }
        foreach ($clients as $id => $client) {
            if ($client['peer'] !== null && ($socket === $client['socket'] || $socket === $client['peer'])) {
                // the CONNECT tunnel: relay both ways
                $data = @fread($socket, 65536);
                if ($data === false || $data === '') {
                    fclose($client['socket']);
                    fclose($client['peer']);
                    unset($clients[$id]);
                    break;
                }
                @fwrite($socket === $client['socket'] ? $client['peer'] : $client['socket'], $data);
                break;
            }
            if ($socket !== $client['socket']) {
                continue;
            }
            $data = @fread($socket, 65536);
            if ($data === false || $data === '') {
                fclose($socket);
                unset($clients[$id]);
                break;
            }
            $client['in'] .= $data;
            $end = strpos($client['in'], "\r\n\r\n");
            if ($end === false) {
                $clients[$id] = $client;
                break;
            }
            $head = substr($client['in'], 0, $end);
            $log($head);
            [$method, $target] = array_pad(explode(' ', strtok($head, "\r\n") ?: ''), 2, '');
            if ($method === 'CONNECT') {
                [$host, $targetPort] = array_pad(explode(':', $target, 2), 2, '0');
                $peer = in_array($host, ['127.0.0.1', 'localhost'], true)
                    ? @stream_socket_client('tcp://127.0.0.1:' . (int) $targetPort, $errno, $errstr, 2) : false;
                if ($peer === false) {
                    @fwrite($socket, "HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n");
                    fclose($socket);
                    unset($clients[$id]);
                    break;
                }
                // a file connect-extra holds bytes a broken proxy sends right after its answer (in the same write)
                @fwrite($socket, "HTTP/1.1 200 Connection established\r\n\r\n" . (string) @file_get_contents($dir . '/connect-extra'));
                $client['peer'] = $peer;
                $clients[$id] = $client;
                break;
            }
            $steps = $target === '/echo' ? [[0, $ok($head)]] : ($routes[$target] ?? [[0, "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n"]]);
            $client['steps'] = $steps;
            $client['due'] = microtime(true) + ($steps[0][0] ?? 0) / 1000;
            $clients[$id] = $client;
            break;
        }
    }
    // the steps that are due
    $now = microtime(true);
    foreach ($clients as $id => $client) {
        if ($client['steps'] === null || $client['peer'] !== null) {
            continue;
        }
        while ($client['steps'] !== [] && $client['due'] <= $now) {
            $step = array_shift($client['steps']);
            if (@fwrite($client['socket'], $step[1]) === false) {
                $client['steps'] = [];
                break;
            }
            $client['due'] = $now + ($client['steps'][0][0] ?? 0) / 1000;
        }
        if ($client['steps'] === []) {
            fclose($client['socket']);
            unset($clients[$id]);
        } else {
            $clients[$id] = $client;
        }
    }
}
