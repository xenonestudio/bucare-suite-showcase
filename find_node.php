<?php
header('Content-Type: text/plain');

$candidates = [
    '/opt/alt/alt-nodejs20/root/usr/bin/node',
    '/opt/alt/alt-nodejs18/root/usr/bin/node',
    '/opt/alt/alt-nodejs22/root/usr/bin/node',
    '/opt/alt/alt-nodejs16/root/usr/bin/node',
    '/opt/cpanel/ea-nodejs20/bin/node',
    '/home/lexsankx/nodevenv/bucaresuite/backend/20/bin/node',
    '/home/lexsankx/nodevenv/bucaresuite/frontend/20/bin/node',
];

foreach ($candidates as $bin) {
    if (file_exists($bin)) {
        echo "FOUND: $bin (Executable: " . (is_executable($bin) ? "YES" : "NO") . ")\n";
    } else {
        echo "NOT FOUND: $bin\n";
    }
}
?>
