<?php
if ($_POST['name'] == "") {
  echo json_encode(array("text"=>"Nothing to do","state"=>"void parameters"));  
} else if ($_POST['doc'] == "") {
  if(unlink("doc/" . trim($_POST['name']))) {
    echo json_encode(array("text"=>"Deleted","state"=>"deleted"));
  } else {
    echo json_encode(array("text"=>"Delete fail","state"=>"not deleted"));
  }
} else {
  $file = fopen("doc/" . trim($_POST['name']), "w") or die("Unable to open file!");
  fwrite($file, $_POST['doc']);
  fclose($file);
  echo json_encode(array("text"=>"Saved","state"=>"saved"));
}
?>
