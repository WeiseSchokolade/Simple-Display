<?php

class Composition {
    public $id;
    public $name;
    public $extraClock;
    public $type;
    public $slides; // Array of slide _references_
    public Condition|null $condition;
    public string|null $next;

    public function __construct($name, $extraClock, $type, $id=hash("sha256", $name . $extraClock . time())) {
        $this->id = $id;
        $this->name = $name;
        $this->extraClock = $extraClock;
        $this->type = $type;
        $this->slides = [];
        $this->condition = new NoneCondition();
        $this->next = null;
    }
}

class Slide {
    public string $id;
    public string $name;
    public string $type;
    public $data;
}

class SlideReference {
    public string $id;
    public Condition $condition;

    public function __construct($id, $condition)
    {
        $this->id = $id;
        $this->condition = $condition;
    }
}

abstract class Condition {
    public string $type;

    public function __construct($type) {
        $this->type = $type;
    }
}

class NoneCondition extends Condition {
    public function __construct() {
        parent::__construct("none");
    }
}

class DurationCondition extends Condition {
    public $durationInSeconds;
    public function __construct($durationInSeconds) {
        parent::__construct("duration");
        $this->durationInSeconds = $durationInSeconds;
    }
}
