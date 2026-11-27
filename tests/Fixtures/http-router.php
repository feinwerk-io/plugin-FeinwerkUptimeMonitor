<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

// Router of the HTTP fixture server (php -S 127.0.0.1:<port> tests/Fixtures/http-router.php), used by the prober and
// runner tests instead of the network. Every path answers exactly the documented response.

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$self = 'http://' . ($_SERVER['HTTP_HOST'] ?? '127.0.0.1');

$send = static function (int $status, string $body, array $headers = []): void {
    http_response_code($status);
    foreach ($headers as $header) {
        header($header);
    }
    echo $body;
};

switch ($path) {
    case '/ok':
        $send(200, 'ok');
        break;
    case '/matomo.php':
        if (!empty($_GET) || !empty($_POST)) {
            $send(400, 'This resource is part of Matomo.');
            break;
        }
        $send(200, "This resource is part of Matomo. Keep full control of your data with the leading free and open source <a href='https://matomo.org'>web analytics</a>.<br>\n");
        break;
    case '/empty/matomo.php':
        // a customer's host (2026-11-26): Matomo's tracker headers, an empty body
        $send(200, '', ['Content-Type: text/html; charset=UTF-8', 'Access-Control-Allow-Origin: *', 'Access-Control-Allow-Credentials: true',
            'Vary: Origin,Accept-Encoding']);
        break;
    case '/empty/other.php':
        $send(200, '', ['Content-Type: text/html; charset=UTF-8']);
        break;
    case '/host':
        // the Host header and the request target as they arrived (through a proxy: the absolute URI)
        $send(200, ($_SERVER['HTTP_HOST'] ?? '') . ' ' . ($_SERVER['REQUEST_URI'] ?? ''));
        break;
    case '/to-idn':
        // a redirect to an internationalised name on this server's port
        $send(302, '', ['Location: http://straße.test:' . ($_SERVER['SERVER_PORT'] ?? '80') . '/host']);
        break;
    case '/upgrade/matomo.php':
        // Matomo stored as http behind a TLS proxy: the web server sends the same address with https
        $send(301, '', ['Location: https://' . ($_SERVER['HTTP_HOST'] ?? '127.0.0.1') . '/upgrade/matomo.php']);
        break;
    case '/upgrade/elsewhere.php':
        $send(301, '', ['Location: https://' . ($_SERVER['HTTP_HOST'] ?? '127.0.0.1') . '/somewhere-else.php']);
        break;
    case '/off/matomo.php':
        $send(503, '');
        break;
    case '/matomo.js':
        $send(200, '/*!! * Matomo - free/libre analytics platform */ var Matomo=window.Matomo||{};Matomo.getAsyncTracker=function(){};', ['Content-Type: application/javascript']);
        break;
    case '/proxy-broken':
        $send(200, '/* there was an error loading matomo.js */', ['Content-Type: application/javascript; charset=UTF-8']);
        break;
    case '/index.php':
    case '/big-login':
        // Matomo's login page with many plugins: the translations come before the form (about 500 KB on the demo)
        $send(200, '<html><head><script>var translations = {' . str_repeat('"x":"y",', 60000) . '};</script></head>'
            . '<body><form name="form_login" method="post"></form></body></html>');
        break;
    case '/login':
        $send(200, '<html><body><form name="form_login" method="post"></form></body></html>');
        break;
    case '/db-down':
        $send(500, 'Error: database');
        break;
    case '/maint':
        $send(503, 'maintenance');
        break;
    case '/basic':
        $send(401, 'auth', ['WWW-Authenticate: Basic realm="x"']);
        break;
    case '/slow':
        usleep((int) (1000000 * min(5.0, (float) ($_GET['s'] ?? 3))));
        $send(200, 'slow');
        break;
    case '/big':
        $send(200, str_repeat('x', 1024 * 1024));
        break;
    case '/bytes':
        // exactly n bytes (at most 8 MiB): the prober's cap edges
        $send(200, str_repeat('x', max(0, min(8388608, (int) ($_GET['n'] ?? 0)))));
        break;
    case '/r1':
        $send(302, '', ['Location: ' . $self . '/r2']);
        break;
    case '/r2':
        $send(302, '', ['Location: /ok']);
        break;
    case '/r-slow':
        $send(302, '', ['Location: ' . $self . '/slow?s=2']);
        break;
    case '/loop':
        $send(302, '', ['Location: ' . $self . '/loop']);
        break;
    case '/to-private':
        $send(302, '', ['Location: http://10.0.0.1/']);
        break;
    case '/page-proxy':
        $send(200, "<html><head><script>var u=\"$self/\";_paq.push(['setTrackerUrl', u+'matomo.php']);g.src=u+'matomo.php';</script></head></html>");
        break;
    case '/container':
        $send(200, '(function(){var c={"id":"AbC123","idsite":1,"versionName":"v3","revision":3,"environment":"live"};})();');
        break;
    default:
        $send(404, 'not found');
}
