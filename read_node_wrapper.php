<?php
header('Content-Type: text/plain');
$file = '/home/lexsankx/nodevenv/bucaresuite/backend/20/bin/node';
if (file_exists($file)) {
    echo "FILE SIZE: " . filesize($file) . "\n";
    echo "IS SYMLINK: " . (is_link($file) ? "YES -> " . readlink($file) : "NO") . "\n\n";
    echo file_get_contents($file);
} else {
    echo "FILE NOT FOUND";
}
?>
