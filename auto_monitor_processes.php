<?php
/**
 * Monitor y Guardián Automático de Procesos para cPanel
 * Cuenta el total de procesos del usuario mediante /proc.
 * Si supera el umbral (por defecto 300 o el 75-80% del límite de NPROC),
 * ejecuta automáticamente la purga de procesos Node colgados (zombies).
 */

header('Content-Type: text/plain');

$THRESHOLD_PROCESSES = 300; // Umbral de disparo (puedes ajustarlo según tu límite)
$procDir = '/proc';
$myUid = getmyuid();

echo "[" . date('Y-m-d H:i:s') . "] === MONITOR DE PROCESOS ARRANQUE ===\n";
echo "Usuario UID: $myUid | Umbral de alerta: $THRESHOLD_PROCESSES procesos\n\n";

if (!file_exists($procDir)) {
    die("No se pudo acceder a /proc en este entorno.\n");
}

$allPids = scandir($procDir);
$userProcessCount = 0;
$nodeProcesses = [];

foreach ($allPids as $pid) {
    if (!is_numeric($pid)) continue;
    
    // Verificar si el proceso pertenece al mismo usuario de cPanel
    $stat = @stat("$procDir/$pid");
    if ($stat && isset($stat['uid']) && $stat['uid'] == $myUid) {
        $userProcessCount++;
        
        $cmdlineFile = "$procDir/$pid/cmdline";
        if (file_exists($cmdlineFile)) {
            $cmd = @file_get_contents($cmdlineFile);
            if (strpos($cmd, 'node') !== false || strpos($cmd, 'lsnode') !== false || strpos($cmd, 'passenger') !== false) {
                $nodeProcesses[$pid] = str_replace("\0", " ", $cmd);
            }
        }
    }
}

echo "Procesos totales activos del usuario: $userProcessCount\n";
echo "Procesos Node/Passenger detectados: " . count($nodeProcesses) . "\n\n";

if ($userProcessCount >= $THRESHOLD_PROCESSES) {
    echo "⚠️ ADVERTENCIA: El uso de procesos ($userProcessCount) ha superado el umbral ($THRESHOLD_PROCESSES).\n";
    echo "Iniciando purga automática de emergencia...\n\n";
    
    $killed = 0;
    foreach ($nodeProcesses as $pid => $cmd) {
        if ($pid == getmypid()) continue;
        
        echo "Eliminando PID $pid: $cmd\n";
        if (function_exists('posix_kill')) {
            @posix_kill((int)$pid, 9);
        }
        @exec("kill -9 $pid 2>&1");
        $killed++;
    }
    
    echo "\nTotal de procesos Node colgados eliminados: $killed\n";
    
    // Reiniciar suavemente las apps activas mediante touch restart.txt
    @mkdir('/home/lexsankx/bucaresuite/backend/tmp', 0755, true);
    @mkdir('/home/lexsankx/bucaresuite/frontend/tmp', 0755, true);
    file_put_contents('/home/lexsankx/bucaresuite/backend/tmp/restart.txt', time());
    file_put_contents('/home/lexsankx/bucaresuite/frontend/tmp/restart.txt', time());
    
    echo "Se ha enviado la señal de reinicio limpio (restart.txt).\n";
    echo "🛡️ Limpieza de emergencia completada con éxito.\n";
} else {
    echo "✅ El uso de procesos está dentro del rango seguro ($userProcessCount < $THRESHOLD_PROCESSES). No se requiere acción.\n";
}
?>
