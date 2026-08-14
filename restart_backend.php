<?php
header('Content-Type: text/plain');
$dir = '/home/lexsankx/bucaresuite/backend/tmp';
if (!file_exists($dir)) {
    mkdir($dir, 0755, true);
}
$file = "$dir/restart.txt";
file_put_contents($file, time());
echo "Touched $file at " . date('Y-m-d H:i:s') . "\n";
unlink(__FILE__);
?>
