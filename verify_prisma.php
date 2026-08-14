<?php
header('Content-Type: text/plain');

$target = '/home/lexsankx/bucaresuite/backend/node_modules/.prisma/client/default.js';
echo "Target path: $target\n";
echo "File exists: " . (file_exists($target) ? "YES" : "NO") . "\n";

$dir = '/home/lexsankx/bucaresuite/backend/node_modules/.prisma/client';
if (file_exists($dir)) {
    echo "Files in .prisma/client:\n";
    print_r(scandir($dir));
} else {
    echo "Directory .prisma/client DOES NOT EXIST!\n";
}
unlink(__FILE__);
?>
