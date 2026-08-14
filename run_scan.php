<?php
ob_start();
include "check_passenger_config.php";
$out = ob_get_clean();
file_put_contents("scan_results.txt", $out);
echo "DONE";
?>
