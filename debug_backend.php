<?php
header('Content-Type: text/plain');

$backend = dirname(__DIR__) . '/bucaresuite/backend';
echo "=== DEBUGGING BACKEND NODE EXECUTION ===\n";
echo "Backend dir exists: " . (file_exists($backend) ? "YES" : "NO") . "\n";

if (file_exists($backend)) {
    chdir($backend);
    echo "Current working directory: " . getcwd() . "\n\n";
    echo "Files in backend:\n";
    print_r(scandir($backend));
    
    if (file_exists($backend . '/node_modules')) {
        echo "\nFiles in node_modules (first 20):\n";
        print_r(array_slice(scandir($backend . '/node_modules'), 0, 20));
    } else {
        echo "\n❌ node_modules DOES NOT EXIST in " . $backend . "\n";
    }

    echo "\n=== RUNNING NODE APP.JS ===\n";
    $out = [];
    $code = -1;
    exec("node app.js 2>&1", $out, $code);
    echo "Exit code: $code\n";
    echo "Output:\n" . implode("\n", $out) . "\n";
}
?>
