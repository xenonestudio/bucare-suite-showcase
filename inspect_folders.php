<?php
header('Content-Type: text/plain');

$backend_path = '/home/lexsankx/bucaresuite/backend';

echo "=== DETAILED DIRECTORY INSPECTION ===\n";
$items = scandir($backend_path);
foreach ($items as $item) {
    if ($item === '.' || $item === '..') continue;
    $path = $backend_path . '/' . $item;
    echo "$item - " . (is_dir($path) ? "DIR" : "FILE (Size: " . filesize($path) . " bytes)") . "\n";
    if (is_dir($path) && strpos($item, 'node_modules') !== false) {
        $count = count(scandir($path));
        echo "   -> Contains $count items\n";
    }
}

echo "\n=== RUNNING PROCESSES ===\n";
$output = [];
exec("ps aux 2>&1", $output);
foreach ($output as $line) {
    if (strpos($line, 'tar') !== false || strpos($line, 'node') !== false) {
        echo $line . "\n";
    }
}

unlink(__FILE__);
?>
