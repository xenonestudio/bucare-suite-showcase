<?php
header('Content-Type: text/plain');

$backend_path = '/home/lexsankx/bucaresuite/backend';

$logs = ['error_log', 'passenger_debug.log', 'stderr.log'];

foreach ($logs as $log) {
    $file = $backend_path . '/' . $log;
    echo "=== LOG: $log ===\n";
    if (file_exists($file)) {
        echo file_get_contents($file) . "\n";
    } else {
        echo "File does not exist.\n";
    }
    echo "\n";
}

unlink(__FILE__);
?>
