<?php
$uploaddir = 'data/assets/';

class Entry {
    public $id;
    public $header;
    public $description;
    public $type;
    public $duration;
    public $image_location;
    public $pdf_location;

    function __construct($header, $description, $duration) {
        $this->header = $header;
        $this->description = $description;
        $this->duration = $duration;
        $this->type = "PLAIN";
        $this->id = uniqid(rand());
    }
}

$object = new Entry($_POST["header"], $_POST["description"], $_POST["duration"]);

if (array_key_exists("userimage", $_FILES)) {
    $uploadfile = $uploaddir . basename($_FILES['userimage']['name']);
    if (move_uploaded_file($_FILES['userimage']['tmp_name'], $uploadfile)) {
        // Success
        $object->image_location = basename($_FILES['userimage']['name']);
        $object->type = "IMAGE";
    } else {
        // Error
        unlink($uploadfile);
        echo "Bild konnte nicht gespeichert werden.";
        exit(400);
    }
}

if (array_key_exists("userpdf", $_FILES)) {
    $uploadfile = $uploaddir . basename($_FILES['userpdf']['name']);
    if (move_uploaded_file($_FILES['userpdf']['tmp_name'], $uploadfile)) {
        // Success
        $object->pdf_location = basename($_FILES['userpdf']['name']);
        $object->type = "PDF";
    } else {
        // Error
        unlink($uploadfile);
        echo "PDF konnte nicht gespeichert werden.";
        exit(400);
    }
}

$file_list_data = file_get_contents('data/data.json');
$data = json_decode($file_list_data, true);

$data[] = $object;

$new_file_list_data = json_encode($data);
file_put_contents("data/data.json", $new_file_list_data);

echo "Success";
?>