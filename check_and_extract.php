<?php
header('Content-Type: text/plain');
set_time_limit(600);
ini_set('memory_limit', '512M');

$backend_path = '/home/lexsankx/bucaresuite/backend';
$tar_gz = $backend_path . '/node_modules_backend.tar.gz';
$tar = $backend_path . '/node_modules_backend.tar';

echo "1. Checking directory paths...\n";
if (file_exists($backend_path)) {
    echo "Backend path exists.\n";
} else {
    echo "Backend path does NOT exist. Creating it.\n";
    mkdir($backend_path, 0755, true);
}

// Check if tar.gz was moved/uploaded
$target_tar_gz = '/home/lexsankx/public_html/node_modules_backend.tar.gz';
if (file_exists($target_tar_gz)) {
    echo "Found node_modules_backend.tar.gz in public_html, moving it to backend folder...\n";
    rename($target_tar_gz, $tar_gz);
}

if (file_exists($tar_gz)) {
    echo "Found node_modules_backend.tar.gz in backend path. Size: " . filesize($tar_gz) . " bytes.\n";
    
    // Let's extract using PharData to avoid process fork limits
    try {
        echo "Decompressing gzip archive using PharData...\n";
        $p = new PharData($tar_gz);
        
        // Decompress to .tar
        echo "Decompressing to .tar...\n";
        $decompressed = $p->decompress(); // creates node_modules_backend.tar
        
        echo "Extracting .tar files...\n";
        $decompressed->extractTo($backend_path, null, true);
        
        echo "Extraction completed successfully via PharData!\n";
        
        // Clean up
        unlink($tar_gz);
        if (file_exists($tar)) {
            unlink($tar);
        }
    } catch (Exception $e) {
        echo "PharData failed: " . $e->getMessage() . "\n";
        echo "Attempting fallback to exec('tar')...\n";
        $output = [];
        $return_var = -1;
        exec("tar -xzf " . escapeshellarg($tar_gz) . " -C " . escapeshellarg($backend_path) . " 2>&1", $output, $return_var);
        echo implode("\n", $output) . "\n";
        echo "tar exit code: $return_var\n";
    }
} else {
    echo "node_modules_backend.tar.gz not found.\n";
}

echo "\n2. Inspecting node_modules...\n";
$compression_path = $backend_path . '/node_modules/compression';
if (file_exists($compression_path)) {
    echo "SUCCESS: 'compression' module exists in node_modules!\n";
} else {
    echo "WARNING: 'compression' module does NOT exist in node_modules.\n";
    if (file_exists($backend_path . '/node_modules')) {
        echo "Contents of node_modules (first 20 files/folders):\n";
        $files = scandir($backend_path . '/node_modules');
        print_r(array_slice($files, 0, 22));
    } else {
        echo "node_modules folder does NOT exist.\n";
    }
}

echo "\n3. Testing Node execution...\n";
$node = '/home/lexsankx/nodevenv/bucaresuite/backend/20/bin/node';
$serverJs = $backend_path . '/dist/server.js';
if (file_exists($node) && file_exists($serverJs)) {
    chdir($backend_path);
    putenv('NODE_ENV=production');
    putenv('DATABASE_URL=file:/home/lexsankx/bucaresuite/backend/prisma/prod.db');
    putenv('PORT=5002'); // use a different port to test
    
    $cmd = "timeout 5 $node $serverJs 2>&1";
    $out = [];
    $code = -1;
    exec($cmd, $out, $code);
    echo "Node execution exit code: $code\n";
    echo "Output:\n" . implode("\n", $out) . "\n";
} else {
    echo "Node binary or server.js not found.\n";
}

// Touch restart.txt to restart passenger app
@mkdir($backend_path . '/tmp', 0755, true);
touch($backend_path . '/tmp/restart.txt');
echo "\nRestart file touched.\n";

unlink(__FILE__);
?>
