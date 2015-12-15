<?php
$files = scandir('doc');
echo json_encode($files);
?>