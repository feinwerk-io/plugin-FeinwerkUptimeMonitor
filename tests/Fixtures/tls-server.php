<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

// Started by TlsFixtureServer::start(): local HTTPS servers with throwaway certificates for localhost and 127.0.0.1,
// which no real trust store contains, one port each:
//   self      a self-signed certificate (server.pem, also usable as a CA file that trusts it)
//   internal  a certificate of an internal CA (ca.pem)
//   expired   a certificate of the same CA that has expired
//   chain     a certificate of the same CA, sent together with the CA's own (self-signed) certificate, as many intranet
//             servers send their chain
//   wrongname a certificate of the same CA for another host name (elsewhere.invalid)
// Writes the certificates, key.pem and other.pem (an unrelated certificate: a CA file that trusts none of them) into the
// given directory, prints "self internal expired chain wrongname" as ports on its first line, and answers every request
// with 200 "ok",
// one at a time; /hop answers 302 to /. Each accepted connection adds a byte to accepts-<name> (the handshakes a client
// started); a file delay-<name> holds milliseconds to wait before the handshake.
//
//   php tls-server.php <directory>

$dir = (string) ($argv[1] ?? '');
if ($dir === '' || !is_dir($dir)) {
    fwrite(STDERR, "usage: tls-server.php <directory>\n");
    exit(2);
}
$config = $dir . '/openssl.cnf';
file_put_contents($config, "[req]\ndistinguished_name = dn\n[dn]\n"
    . "[self]\nbasicConstraints = critical,CA:TRUE\nsubjectAltName = DNS:localhost,IP:127.0.0.1\n"
    . "[ca]\nbasicConstraints = critical,CA:TRUE\nkeyUsage = critical,keyCertSign,cRLSign\n"
    . "[leaf]\nbasicConstraints = critical,CA:FALSE\nsubjectAltName = DNS:localhost,IP:127.0.0.1\n"
    . "[elsewhere]\nbasicConstraints = critical,CA:FALSE\nsubjectAltName = DNS:elsewhere.invalid\n");
$options = static fn(string $section): array => ['config' => $config, 'private_key_type' => OPENSSL_KEYTYPE_RSA,
    'private_key_bits' => 2048, 'digest_alg' => 'sha256', 'x509_extensions' => $section];
$pem = static function ($cert): string {
    openssl_x509_export($cert, $out);
    return $out;
};
$key = openssl_pkey_new($options('self'));
openssl_pkey_export($key, $keyPem, null, $options('self'));
$csr = static fn(string $name, string $section) => openssl_csr_new(['commonName' => $name], $key, $options($section));
$caKey = openssl_pkey_new($options('ca'));
$ca = openssl_csr_sign(openssl_csr_new(['commonName' => 'FWUM Test Internal CA'], $caKey, $options('ca')), null, $caKey, 30, $options('ca'), random_int(1, PHP_INT_MAX));
// valid for 0 days: expired a second after it was made (the wait before the ports are printed)
$expired = openssl_csr_sign($csr('localhost', 'leaf'), $ca, $caKey, 0, $options('leaf'), random_int(1, PHP_INT_MAX));
$made = time();
file_put_contents($dir . '/expired.pem', $pem($expired));
file_put_contents($dir . '/ca.pem', $pem($ca));
file_put_contents($dir . '/internal.pem', $pem(openssl_csr_sign($csr('localhost', 'leaf'), $ca, $caKey, 30, $options('leaf'), random_int(1, PHP_INT_MAX))));
file_put_contents($dir . '/chain.pem', file_get_contents($dir . '/internal.pem') . $pem($ca));
file_put_contents($dir . '/wrongname.pem', $pem(openssl_csr_sign($csr('elsewhere.invalid', 'elsewhere'), $ca, $caKey, 30, $options('elsewhere'), random_int(1, PHP_INT_MAX))));
file_put_contents($dir . '/server.pem', $pem(openssl_csr_sign($csr('localhost', 'self'), null, $key, 30, $options('self'), random_int(1, PHP_INT_MAX))));
file_put_contents($dir . '/key.pem', $keyPem);
$otherKey = openssl_pkey_new($options('self'));
file_put_contents($dir . '/other.pem', $pem(openssl_csr_sign(openssl_csr_new(['commonName' => 'Some Other CA'], $otherKey, $options('self')), null, $otherKey, 30, $options('self'), random_int(1, PHP_INT_MAX))));

$servers = [];
$ports = [];
foreach (['self' => 'server.pem', 'internal' => 'internal.pem', 'expired' => 'expired.pem', 'chain' => 'chain.pem', 'wrongname' => 'wrongname.pem'] as $name => $file) {
    $context = stream_context_create(['ssl' => ['local_cert' => $dir . '/' . $file, 'local_pk' => $dir . '/key.pem',
        'verify_peer' => false, 'verify_peer_name' => false]]);
    $server = stream_socket_server('tcp://127.0.0.1:0', $errno, $errstr, STREAM_SERVER_BIND | STREAM_SERVER_LISTEN, $context);
    if ($server === false) {
        fwrite(STDERR, "no server: $errstr\n");
        exit(1);
    }
    $servers[$name] = $server;
    $socket = (string) stream_socket_get_name($server, false);
    $ports[] = substr($socket, strrpos($socket, ':') + 1);
    file_put_contents($dir . '/accepts-' . $name, '');
}
while (time() <= $made + 1) {
    usleep(100000);
}
echo implode(' ', $ports), "\n";
fflush(STDOUT);

while (true) {
    $ready = array_values($servers);
    $write = $except = null;
    if (!@stream_select($ready, $write, $except, 60)) {
        continue;
    }
    foreach ($ready as $server) {
        $name = (string) array_search($server, $servers, true);
        $connection = @stream_socket_accept($server, 1);
        if ($connection === false) {
            continue;
        }
        file_put_contents($dir . '/accepts-' . $name, '.', FILE_APPEND);
        $delay = (int) @file_get_contents($dir . '/delay-' . $name);
        if ($delay > 0) {
            usleep($delay * 1000);
        }
        stream_set_timeout($connection, 5);
        // a client that does not trust the certificate ends the handshake: next connection
        if (@stream_socket_enable_crypto($connection, true, STREAM_CRYPTO_METHOD_TLS_SERVER) !== true) {
            fclose($connection);
            continue;
        }
        $request = '';
        while (strpos($request, "\r\n\r\n") === false && ($line = fgets($connection)) !== false) {
            $request .= $line;
        }
        fwrite($connection, strncmp($request, 'GET /hop', 8) === 0
            ? "HTTP/1.1 302 Found\r\nLocation: /\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
            : "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 2\r\nConnection: close\r\n\r\nok");
        fclose($connection);
    }
}
