<?php
header('Content-Type: text/plain');

$paths = [
    '/opt/alt/alt-nodejs20/root/usr/bin/node',
    '/opt/alt/alt-nodejs18/root/usr/bin/node',
    '/opt/alt/alt-nodejs22/root/usr/bin/node',
    '/opt/alt/alt-nodejs16/root/usr/bin/node',
    '/opt/cpanel/ea-nodejs20/bin/node',
    '/opt/cpanel/ea-nodejs18/bin/node',
    '/usr/local/bin/node',
    '/usr/bin/node',
];

echo "=== TESTING CLOUDLINUX REAL NODE BINARIES ===\n\n";

foreach ($paths as $bin) {
    echo "Path: $bin\n";
    echo "Exists: " . (file_exists($bin) ? "YES" : "NO") . "\n";
    if (file_exists($bin)) {
        echo "Executable: " . (is_executable($bin) ? "YES" : "NO") . "\n";
        $out = [];
        $ret = 0;
        @exec("$bin -v 2>&1", $out, $ret);
        echo "Version check ret ($ret): " . implode("\n", $out) . "\n";
    }
    echo "----------------------------------------\n";
}
?>
