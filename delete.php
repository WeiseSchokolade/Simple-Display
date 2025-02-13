<?php

$id = $_GET["id"];

$file_list_data = file_get_contents('data/data.json');
$data = json_decode($file_list_data, true);

$deleted = false;
$i = 0;
foreach($data as $element) {
    if($id == $data[$i]["id"]){
        $article = $data[$i];
        

        array_splice($data, $i, 1);
        $deleted = true;
    }
    $i++;
}
if (!$deleted) {
    print "{\"id\":$id,\"error\":\"Unknown\"}";
    exit(404);
}

$new_file_list_data = json_encode($data);
file_put_contents("data/data.json", $new_file_list_data);

echo "Delete successfully";
?>