<?php
header('Content-Type: text/plain');
$appRoot = '/home/lexsankx/bucaresuite/backend';
$tarFile = '/home/lexsankx/public_html/backend.tar.gz';

if (!file_exists($tarFile)) {
    $tarFile = '/home/lexsankx/backend.tar.gz';
}

if (!file_exists($tarFile)) {
    echo "ERROR: backend.tar.gz not found!\n";
    exit;
}

echo "Extracting $tarFile into $appRoot...\n";
$cmd = "tar -xzf " . escapeshellarg($tarFile) . " -C " . escapeshellarg($appRoot) . " 2>&1";
$output = shell_exec($cmd);
echo "Output: " . ($output ? $output : "EXTRACTED SUCCESSFULLY ✅") . "\n";

$restartFile = "$appRoot/tmp/restart.txt";
if (!file_exists(dirname($restartFile))) {
    mkdir(dirname($restartFile), 0755, true);
}
file_put_contents($restartFile, time());
echo "Touched restart.txt\n";
unlink(__FILE__);
?>
