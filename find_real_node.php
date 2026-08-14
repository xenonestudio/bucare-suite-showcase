<?php
header('Content-Type: text/plain');

function listRecursive($dir, $depth = 0) {
    if ($depth > 3 || !file_exists($dir)) return;
    $files = scandir($dir);
    foreach ($files as $f) {
        if ($f == '.' || $f == '..') continue;
        $path = "$dir/$f";
        $type = is_dir($path) ? "[DIR]" : (is_link($path) ? "[LINK -> " . readlink($path) . "]" : "[FILE]");
        echo str_repeat("  ", $depth) . "$f $type\n";
        if (is_dir($path) && !is_link($path)) {
            listRecursive($path, $depth + 1);
        }
    }
}

echo "=== FRONTEND NODE VENV ===\n";
listRecursive('/home/lexsankx/nodevenv/bucaresuite/frontend/20');

echo "\n=== BACKEND NODE VENV ===\n";
listRecursive('/home/lexsankx/nodevenv/bucaresuite/backend/20');
?>
