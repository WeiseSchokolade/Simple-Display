<?php

class Composition {
    public $id;
    public $name;
    public $extraClock;
    public $type;
    public $slides;
    public Condition $condition;
    public string|null $next;

    public function __construct($name, $extraClock, $type) {
        $this->id = hash("sha256", $name . $extraClock . time());
        $this->name = $name;
        $this->extraClock = $extraClock;
        $this->type = $type;
        $this->slides = [];
        $this->condition = new NoneCondition();
        $this->next = null;
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
