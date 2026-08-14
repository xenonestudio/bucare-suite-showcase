<?php
header('Content-Type: text/plain');

$backend_path = '/home/lexsankx/bucaresuite/backend';

$logs = ['error_log', 'passenger_debug.log', 'stderr.log'];

foreach ($logs as $log) {
    $file = $backend_path . '/' . $log;
    echo "=== LOG: $log ===\n";
    if (file_exists($file)) {
        // Read last 2000 bytes
        $size = filesize($file);
        $handle = fopen($file, 'r');
        if ($size > 2000) {
            fseek($handle, -2000, SEEK_END);
        }
        echo fread($handle, 2000) . "\n";
        fclose($handle);
    } else {
        echo "File does not exist.\n";
    }
    echo "\n";
}

unlink(__FILE__);
?>
