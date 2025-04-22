<?php
include "types.php";

if ($_SERVER['REQUEST_METHOD'] != "POST") {
    http_response_code(405);
    exit;
}

if (!array_key_exists("Authorization", getallheaders())) {
    http_response_code(401);
    exit;
}
$token = getallheaders()["Authorization"];

$users = file_get_contents("../data/users.json");
$data = json_decode($users, true);

$found = false;
foreach ($data as $user) {
    if ($user["token"] == $token) {
        $found = true;
        break;
    }
}
if (!$found) {
    http_response_code(403);
    exit;
}

if (!(array_key_exists("name", $_GET) &&
      array_key_exists("extraClock", $_GET) &&
      array_key_exists("type", $_GET))) {
    http_response_code(400);
    exit;   
}

$object = new Composition($_GET["name"], $_GET["extraClock"], $_GET["type"]);

$file_list_data = file_get_contents('../data/compositions.json');
$data = json_decode($file_list_data, true);

$data[] = $object;

$new_file_list_data = json_encode($data, JSON_PRETTY_PRINT);
file_put_contents("../data/compositions.json", $new_file_list_data);

echo json_encode($object);