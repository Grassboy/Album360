//modified from wasd-controls
AFRAME.registerComponent('rotate-controls', {
  schema: {
    acceleration: {default: 300},
    adAxis: {default: 'y', oneOf: ['x', 'y', 'z']},
    adEnabled: {default: true},
    adInverted: {default: false},
    easing: {default: 10},
    enabled: {default: true},
    wsAxis: {default: 'x', oneOf: ['x', 'y', 'z']},
    wsEnabled: {default: true},
    wsInverted: {default: false}
  },

  init: function () {
    this.KEYCODE_TO_DIRECTION = {
        '38': 'Up',
        '37': 'Left',
        '40': 'Down',
        '39': 'Right',
        '87': 'Up',
        '65': 'Left',
        '83': 'Down',
        '68': 'Right',
        //firefox - + in keyboard area
        '61': 'SpeedUp',
        '173': 'SpeedDown',
        //chrome - + in keyboard area
        '187': 'SpeedUp',
        '189': 'SpeedDown',
        // - + in NumPad
        '107': 'SpeedUp',
        '109': 'SpeedDown'
    };
    // To keep track of the pressed keys.
    this.keys = {};
    this.velocity = new THREE.Vector3();
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.keys.Right = true;
    this.play();
  },

  tick: function (time, delta) {
    var data = this.data;
    var el = this.el;
    var movementVector;
    var rotation;
    var nextRotation;
    var velocity = this.velocity;

    // Use seconds.
    delta = delta / 1000;

    // Get velocity.
    this.updateVelocity(delta);
    if (!velocity[data.adAxis] && !velocity[data.wsAxis]) { return; }

    // Get movement vector and translate rotation.
    movementVector = this.getMovementVector(delta);
    rotation = el.getAttribute('rotation');
    nextRotation = {
      x: rotation.x + movementVector.x,
      y: rotation.y + movementVector.y,
      z: rotation.z + movementVector.z
    };
    if(nextRotation[data.wsAxis] > 90) nextRotation[data.wsAxis] = 90;
    if(nextRotation[data.wsAxis] < -90) nextRotation[data.wsAxis] = -90;
    if(nextRotation[data.adAxis] > 360) nextRotation[data.adAxis] = 0;
    if(nextRotation[data.adAxis] < 0) nextRotation[data.adAxis] = 360;
    el.setAttribute('rotation', nextRotation);
  },

  remove: function () {
    this.removeKeyEventListeners();
  },

  play: function () {
    this.attachKeyEventListeners();
  },

  updateVelocity: function (delta) {
    var acceleration;
    var adAxis;
    var adSign;
    var data = this.data;
    var keys = this.keys;
    var velocity = this.velocity;
    var wsAxis;
    var wsSign;
    
    var MAX_DELTA = 0.2;
    var CLAMP_VELOCITY = 0.00001;

    adAxis = data.adAxis;
    wsAxis = data.wsAxis;

    // If FPS too low, reset velocity.
    if (delta > MAX_DELTA) {
      velocity[adAxis] = 0;
      velocity[wsAxis] = 0;
      return;
    }

    // Decay velocity.
    if (velocity[adAxis] !== 0) {
      velocity[adAxis] -= velocity[adAxis] * data.easing * delta;
    }
    if (velocity[wsAxis] !== 0) {
      velocity[wsAxis] -= velocity[wsAxis] * data.easing * delta;
    }

    // Clamp velocity easing.
    if (Math.abs(velocity[adAxis]) < CLAMP_VELOCITY) { velocity[adAxis] = 0; }
    if (Math.abs(velocity[wsAxis]) < CLAMP_VELOCITY) { velocity[wsAxis] = 0; }

    if (!data.enabled) { return; }

    // Update velocity using keys pressed.
    acceleration = data.acceleration;
    if (data.adEnabled) {
      adSign = data.adInverted ? -1 : 1;
      if (keys.Left) { velocity[adAxis] += adSign * acceleration * delta; }
      if (keys.Right) { velocity[adAxis] -= adSign * acceleration * delta; }
    }
    if (data.wsEnabled) {
      wsSign = data.wsInverted ? -1 : 1;
      if (keys.Up) { velocity[wsAxis] += wsSign * acceleration * delta; }
      if (keys.Down) { velocity[wsAxis] -= wsSign * acceleration * delta; }
    }
  },

  getMovementVector: (function () {
    var directionVector = new THREE.Vector3(0, 0, 0);

    return function (delta) {
      var velocity = this.velocity;

      directionVector.copy(velocity);
      directionVector.multiplyScalar(delta);

      return directionVector;
    };
  })(),


  attachKeyEventListeners: function () {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  },

  removeKeyEventListeners: function () {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  },


  onKeyDown: function (event) {
    var direction;
    if (event.metaKey) { return false; }
    direction = this.KEYCODE_TO_DIRECTION[event.keyCode];
    if(!direction) return;
    switch(direction) {
    case "SpeedUp":
    case "SpeedDown":
        return;
    default:
        this.keys[direction] = true;
        break;
    }
  },

  onKeyUp: function (event) {
    var direction;
    direction = this.KEYCODE_TO_DIRECTION[event.keyCode];
    if(!direction) return;
    switch(direction) {
    case "SpeedUp":
        if(this.data.acceleration < 800) {
            this.data.acceleration+=25;
        }
        return;
    case "SpeedDown":
        if(this.data.acceleration > 50) {
            this.data.acceleration-=25;
        }
        return;
    case "Up":
        this.keys.Down = false;
        break;
    case "Down":
        this.keys.Up = false;
        break;
    case "Left":
        this.keys.Right = false;
        break;
    case "Right":
        this.keys.Left = false;
        break;
    }
    if(event.shiftKey && direction) {
        this.keys[direction] = true;
    } else {
        this.keys[direction] = false;
    }
  }
});
