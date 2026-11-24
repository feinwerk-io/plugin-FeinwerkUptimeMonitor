<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

// Static floor check (dev tool, not part of the plugin package): every Matomo class this plugin imports with `use`
// and every static method it calls on one must exist in the Matomo tree given as argument (the code-only 5.0.0 tree,
// the floor of plugin.json). The tree is read as text only, nothing of it is loaded or run. Calls guarded with
// class_exists/method_exists/function_exists go through strings and are not checked here.
//
//   php tests/floorcheck.php /srv/feinwerk-build/matomo-compat/5.0.0

$matomo = rtrim($argv[1] ?? '', '/');
if ($matomo === '' || !is_file($matomo . '/core/Version.php')) {
    fwrite(STDERR, "usage: php tests/floorcheck.php <matomo tree>\n");
    exit(2);
}
$root = dirname(__DIR__);
$own = 'Piwik\\Plugins\\FeinwerkUptimeMonitor\\';

$classFile = static function (string $class) use ($matomo): ?string {
    if (str_starts_with($class, 'Piwik\\Plugins\\')) {
        $path = $matomo . '/plugins/' . str_replace('\\', '/', substr($class, strlen('Piwik\\Plugins\\'))) . '.php';
    } elseif (str_starts_with($class, 'Piwik\\')) {
        $path = $matomo . '/core/' . str_replace('\\', '/', substr($class, strlen('Piwik\\'))) . '.php';
    } else {
        return null;
    }
    return is_file($path) ? $path : '';
};

// a method of the class or of one of its parents (extends, resolved through the file's namespace and imports)
$hasMethod = static function (string $path, string $method) use ($classFile): bool {
    for ($depth = 0; $depth < 6 && is_string($path) && $path !== ''; $depth++) {
        $source = (string) file_get_contents($path);
        if (preg_match('/function\s+' . preg_quote($method, '/') . '\s*\(/i', $source)) {
            return true;
        }
        if (!preg_match('/^\s*(?:abstract\s+|final\s+)?class\s+\w+\s+extends\s+(\\\\?[\w\\\\]+)/m', $source, $m)) {
            return false;
        }
        $parent = $m[1];
        if ($parent[0] === '\\') {
            $parent = substr($parent, 1);
        } elseif (preg_match('/^use\s+([\w\\\\]+\\\\' . preg_quote($parent, '/') . ');/m', $source, $u)) {
            $parent = $u[1];
        } elseif (preg_match('/^namespace\s+([\w\\\\]+);/m', $source, $ns)) {
            $parent = $ns[1] . '\\' . $parent;
        }
        $path = $classFile($parent);
    }
    return false;
};

$problems = [];
$checked = 0;
$files = new RecursiveIteratorIterator(new RecursiveCallbackFilterIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS),
    static fn (SplFileInfo $f): bool => !($f->isDir() && in_array($f->getFilename(), ['vendor', 'node_modules', '.git', 'tests'], true))
));
foreach ($files as $file) {
    if ($file->getExtension() !== 'php') {
        continue;
    }
    $code = (string) file_get_contents($file->getPathname());
    $name = substr($file->getPathname(), strlen($root) + 1);
    preg_match_all('/^use\s+(Piwik\\\\[A-Za-z0-9_\\\\]+)(?:\s+as\s+(\w+))?;/m', $code, $uses, PREG_SET_ORDER);
    foreach ($uses as $use) {
        $class = $use[1];
        // own classes, and other Feinwerk plugins' interfaces (Sentinel's checks, used only when interface_exists())
        if (str_starts_with($class, $own) || str_starts_with($class, 'Piwik\\Plugins\\FeinwerkSentinel\\')) {
            continue;
        }
        $alias = $use[2] ?? '';
        $alias = $alias !== '' ? $alias : substr($class, strrpos($class, '\\') + 1);
        $path = $classFile($class);
        $checked++;
        if ($path === '') {
            $problems[] = "$name: $class does not exist";
            continue;
        }
        if ($path === null) {
            continue;
        }
        preg_match_all('/(?<![\\\\\w$>])' . preg_quote($alias, '/') . '::(\w+)\s*\(/', $code, $calls);
        foreach (array_unique($calls[1]) as $method) {
            $checked++;
            if (!$hasMethod($path, $method)) {
                $problems[] = "$name: $class::$method() does not exist";
            }
        }
    }
}

echo "checked $checked symbols against " . $matomo . "\n";
foreach ($problems as $problem) {
    echo "  $problem\n";
}
exit($problems === [] ? 0 : 1);
