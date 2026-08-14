<?php
header('Content-Type: text/plain');

$dirs = [
    '/home/lexsankx/app_backend',
    '/home/lexsankx/public_html',
    '/home/lexsankx/public_html/api',
    '/home/lexsankx/public_html/api.bucaresuite.com'
];

foreach ($dirs as $dir) {
    $file = $dir . '/.htaccess';
    echo "=== FILE: $file ===\n";
    if (file_exists($file)) {
        echo file_get_contents($file) . "\n\n";
    } else {
        echo "NOT FOUND\n\n";
    }
}
unlink(__FILE__);
?>
