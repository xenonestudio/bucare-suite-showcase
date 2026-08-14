<?php
header('Content-Type: text/plain');

$backend_path = '/home/lexsankx/bucaresuite/backend';
$tar_gz = $backend_path . '/node_modules_backend.tar.gz';
$tar = $backend_path . '/node_modules_backend.tar';

echo "=== INSPECTING DIRECTORIES ===\n";
echo "Backend folder exists: " . (file_exists($backend_path) ? "YES" : "NO") . "\n";
echo "node_modules_backend.tar.gz exists: " . (file_exists($tar_gz) ? "YES (Size: " . filesize($tar_gz) . " bytes)" : "NO") . "\n";
echo "node_modules_backend.tar exists: " . (file_exists($tar) ? "YES (Size: " . filesize($tar) . " bytes)" : "NO") . "\n";

$compression_path = $backend_path . '/node_modules/compression';
echo "compression module folder exists: " . (file_exists($compression_path) ? "YES" : "NO") . "\n";

if (file_exists($backend_path . '/node_modules')) {
    $files = scandir($backend_path . '/node_modules');
    echo "Total packages in node_modules: " . count($files) . "\n";
    echo "First 15 items: \n";
    print_r(array_slice($files, 0, 17));
} else {
    echo "node_modules folder does NOT exist.\n";
}

unlink(__FILE__);
?>
