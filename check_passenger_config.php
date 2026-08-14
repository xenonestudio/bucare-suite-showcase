<?php
header('Content-Type: text/plain');

function scanForHtaccess($dir) {
    $results = [];
    $items = @scandir($dir);
    if (!$items) return $results;

    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        $path = $dir . '/' . $item;
        if ($item === '.htaccess') {
            $results[$path] = file_get_contents($path);
        } else if (is_dir($path) && !is_link($path) && strpos($item, '.') !== 0 && strpos($path, 'node_modules') === false) {
            $results = array_merge($results, scanForHtaccess($path));
        }
    }
    return $results;
}

$root = dirname(__DIR__);
echo "=== SCANNING FOR .HTACCESS FILES IN " . $root . " ===\n\n";

$found = scanForHtaccess($root);
foreach ($found as $path => $content) {
    echo "--- FILE: $path ---\n";
    echo $content . "\n\n";
}
?>
