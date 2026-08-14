<?php
header('Content-Type: text/plain');
set_time_limit(300);
ignore_user_abort(true);

$appRoot = '/home/lexsankx/bucaresuite/backend';

$possiblePaths = [
    '/home/lexsankx/prisma_only.tar.gz',
    '/home/lexsankx/public_html/prisma_only.tar.gz',
    dirname(__DIR__) . '/prisma_only.tar.gz',
    dirname(dirname(__DIR__)) . '/prisma_only.tar.gz',
];

$tarFile = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        $tarFile = $path;
        break;
    }
}

if (!$tarFile) {
    echo "ERROR: prisma_only.tar.gz not found!\n";
    echo "Current dir: " . __DIR__ . "\n";
    echo "Files in parent dir:\n";
    print_r(scandir(dirname(__DIR__)));
    exit;
}

echo "Found Prisma archive at: $tarFile\n";
echo "Extracting into $appRoot...\n";

$cmd = "tar -xzf " . escapeshellarg($tarFile) . " -C " . escapeshellarg($appRoot) . " 2>&1";
$output = shell_exec($cmd);
echo "Extraction output:\n" . ($output ? $output : "DONE SUCCESSFULLY ✅") . "\n";

// Verify .prisma/client/default.js
$check = "$appRoot/node_modules/.prisma/client/default.js";
echo "Verifying $check...\n";
echo "File exists: " . (file_exists($check) ? "YES ✅" : "NO ❌") . "\n";

// Touch restart.txt
$restartFile = "$appRoot/tmp/restart.txt";
if (!file_exists(dirname($restartFile))) {
    mkdir(dirname($restartFile), 0755, true);
}
file_put_contents($restartFile, time());
echo "Touched restart.txt to reboot Passenger.\n";
unlink(__FILE__);
?>
