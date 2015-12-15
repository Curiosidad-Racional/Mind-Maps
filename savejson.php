<?php
if ($_POST['name'] == "" || $_POST['json'] == "") {
  echo json_encode(array("text"=>"Nothing to do","state"=>"void parameters"));
} else {
  $file = fopen("json/" . trim($_POST['name']) . ".json", "w") or die("Unable to open file!");
  fwrite($file, $_POST['json']);
  fclose($file);
  echo json_encode(array("text"=>"Saved","state"=>"saved"));
}
?>
