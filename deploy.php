<?php
header('Content-Type: text/plain');

$appRoot = '/home/lexsankx/bucaresuite/backend';

$possiblePaths = [
    '/home/lexsankx/backend.tar.gz',
    '/home/lexsankx/public_html/backend.tar.gz',
    '/home/lexsankx/public_html/api/backend.tar.gz',
];

$tarFile = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        $tarFile = $path;
        break;
    }
}

if (!$tarFile) {
    echo "ERROR: backend.tar.gz not found!\n";
    print_r(glob('/home/lexsankx/*.tar.gz'));
    exit;
}

echo "Found archive at: $tarFile\n";
echo "Extracting into $appRoot...\n";

$cmd = "tar -xzf " . escapeshellarg($tarFile) . " -C " . escapeshellarg($appRoot) . " 2>&1";
$output = shell_exec($cmd);
echo "Extraction output:\n" . ($output ? $output : "EXTRACTED SUCCESSFULLY ✅") . "\n";

// Touch restart.txt to reboot Passenger
$restartFile = "$appRoot/tmp/restart.txt";
if (!file_exists(dirname($restartFile))) {
    mkdir(dirname($restartFile), 0755, true);
}
file_put_contents($restartFile, time());
echo "Touched restart.txt to reboot Passenger.\n";
?>
