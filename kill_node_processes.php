<?php
header('Content-Type: text/plain');

echo "=== KILLING ALL NODE PROCESSES VIA /proc AND POSIX_KILL ===\n\n";

$myUid = getmyuid();
echo "Current PHP UID: $myUid\n\n";

$killed = 0;
$procDir = '/proc';

if (file_exists($procDir)) {
    $pids = scandir($procDir);
    foreach ($pids as $pid) {
        if (!is_numeric($pid)) continue;
        if ($pid == getmypid()) continue;
        
        $cmdlineFile = "$procDir/$pid/cmdline";
        
        if (file_exists($cmdlineFile)) {
            $cmd = @file_get_contents($cmdlineFile);
            if (strpos($cmd, 'node') !== false || strpos($cmd, 'passenger') !== false || strpos($cmd, 'lsnode') !== false) {
                echo "Found target process PID $pid: " . str_replace("\0", " ", $cmd) . "\n";
                if (function_exists('posix_kill')) {
                    @posix_kill((int)$pid, 9);
                }
                @exec("kill -9 $pid 2>&1");
                $killed++;
            }
        }
    }
}

echo "\nTotal processes killed: $killed\n";

// Touch restart.txt for backend and frontend
@mkdir('/home/lexsankx/bucaresuite/backend/tmp', 0755, true);
@mkdir('/home/lexsankx/bucaresuite/frontend/tmp', 0755, true);
file_put_contents('/home/lexsankx/bucaresuite/backend/tmp/restart.txt', time());
file_put_contents('/home/lexsankx/bucaresuite/frontend/tmp/restart.txt', time());

echo "Touched restart.txt for backend and frontend.\n";
echo "Done! ✅\n";
?>
