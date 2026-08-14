<?php
header('Content-Type: text/plain');

$bins = [
    '/home/lexsankx/nodevenv/bucaresuite/backend/20/bin/node',
    '/home/lexsankx/nodevenv/bucaresuite/frontend/20/bin/node',
];

foreach ($bins as $bin) {
    echo "=== TESTING BINARY: $bin ===\n";
    if (file_exists($bin)) {
        echo "Exists: YES\n";
        echo "Is Link: " . (is_link($bin) ? "YES -> " . readlink($bin) : "NO") . "\n";
        $out = [];
        $ret = 0;
        exec("$bin -v 2>&1", $out, $ret);
        echo "Return code: $ret\n";
        echo "Output: " . implode("\n", $out) . "\n\n";
    } else {
        echo "Exists: NO\n\n";
    }
}
?>
