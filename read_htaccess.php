<?php
header('Content-Type: text/plain');

$files = [
    '/home/lexsankx/app_backend/.htaccess',
    '/home/lexsankx/public_html/api/.htaccess',
    '/home/lexsankx/public_html/api.bucaresuite.com/.htaccess',
    '/home/lexsankx/public_html/.htaccess'
];

foreach ($files as $f) {
    echo "=== $f ===\n";
    if (file_exists($f)) {
        echo file_get_contents($f) . "\n";
    } else {
        echo "FILE DOES NOT EXIST\n";
    }
}
?>
