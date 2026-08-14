<?php
header('Content-Type: text/plain');
set_time_limit(300);

$backend_path = '/home/lexsankx/bucaresuite/backend';
$tar_gz = $backend_path . '/node_modules_backend.tar.gz';
$node_modules = $backend_path . '/node_modules';

echo "=== EXTRACTING NODE_MODULES VIA SYSTEM TAR ===\n";

if (!file_exists($tar_gz)) {
    die("Error: node_modules_backend.tar.gz not found at $tar_gz\n");
}

if (file_exists($node_modules)) {
    echo "Existing node_modules folder found. Renaming it to node_modules_old to speed up extraction...\n";
    $rand = rand(1000, 9999);
    $renamed = rename($node_modules, $node_modules . '_old_' . $rand);
    if ($renamed) {
        echo "Successfully renamed to node_modules_old_$rand\n";
    } else {
        echo "Warning: Could not rename node_modules. Trying to delete instead...\n";
        // Attempting to delete
        exec("rm -rf " . escapeshellarg($node_modules));
    }
}

echo "Running tar -xzf...\n";
$output = [];
$return_var = -1;
$start_time = time();
exec("tar -xzf " . escapeshellarg($tar_gz) . " -C " . escapeshellarg($backend_path) . " 2>&1", $output, $return_var);
$end_time = time();

echo "Tar command completed in " . ($end_time - $start_time) . " seconds.\n";
echo "Exit code: $return_var\n";
echo "Output:\n" . implode("\n", $output) . "\n";

if ($return_var === 0) {
    echo "Tar extracted successfully! Checking compression folder:\n";
    if (file_exists($node_modules . '/compression')) {
        echo "SUCCESS: compression module exists!\n";
        // Clean up tar.gz
        unlink($tar_gz);
        echo "Cleaned up archive.\n";
    } else {
        echo "FAIL: tar exited 0 but compression folder does not exist!\n";
    }
    
    // Clean up old node_modules in the background
    echo "Cleaning up old node_modules in background...\n";
    exec("rm -rf " . escapeshellarg($backend_path . '/node_modules_old*') . " > /dev/null 2>&1 &");
} else {
    echo "Tar failed. Restoring old node_modules if renamed...\n";
    if (isset($renamed) && $renamed && !file_exists($node_modules)) {
        rename($node_modules . '_old_' . $rand, $node_modules);
    }
}

unlink(__FILE__);
?>
