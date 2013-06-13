/*
@class Engine
@description
@methods constructor, makeSkybox, test, toggleShadows,
@params length, width, depth, color
*/

var Engine;

Engine = (function() {

  function Engine(name) {
    var CAMERA_START, FAR, HEIGHT, NEAR, VIEW_ANGLE, WIDTH, renderer;
    console.clear();
    window.pointer = this;
    VIEW_ANGLE = 33;
    WIDTH = 1000;
    HEIGHT = 600;
    NEAR = 0.1;
    FAR = 5000;
    CAMERA_START = 300;
    /*
      @Data until created elsewhere
    */

    this.settings = {
      statics: {
        viewAngle: VIEW_ANGLE,
        width: WIDTH,
        height: HEIGHT,
        near: NEAR,
        far: FAR
      },
      world: {
        grid: {
          color: 0xFFFF55,
          margin: 1
        },
        block: {
          width: 25,
          depth: 25,
          height: 15,
          color: 0x2f5b2b
        }
      }
    };
    this.name = name;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, WIDTH / HEIGHT, NEAR, FAR);
    this.clock = new THREE.Clock(true);
    this.clock.start();
    console.log(this.camera);
    this.renderer = renderer = new THREE.WebGLRenderer({
      antialaising: true
    });
    this.renderer.setSize(WIDTH, HEIGHT);
    if (!($('canvas')[0])) {
      $('.game').append(renderer.domElement);
      $('canvas').attr({
        'id': "screen"
      });
    }
    this.camera.position.z = CAMERA_START;
    this.camera.position.y = 200;
    this.camera.position.x = -150;
    this.camera.rotation.x = -0.45;
    this.camera.lookAt(this.scene.position);
    _.bindAll(this, "addToScene", "update", "draw", "makeSkybox", "ignition", "test", "toggleShadows");
  }

  Engine.prototype.makeSkybox = function(fogColor) {
    var color, fog;
    color = fogColor || 0xeeeeee;
    this.renderer.setClearColor(color, 1);
    this.renderer.clear();
    fog = new THREE.Fog(color, 100, 1200);
    this.scene.fog = fog;
    return this.test();
  };

  Engine.prototype.controller = {
    moveCamera: function() {
      var amount, duration, eng, pan, progress;
      amount = 100;
      duration = 1;
      progress = 0;
      eng = pointer;
      $(document).keydown(function(e) {
        console.log(e.which);
        if (e.which === 65 || e.keyCode === 65) {
          pan("x", true);
        }
        if (e.which === 87 || e.keyCode === 87) {
          pan("z", true);
        }
        if (e.which === 68 || e.keyCode === 68) {
          pan("x", false);
        }
        if (e.which === 83 || e.keyCode === 83) {
          return pan("z", false);
        } else {

        }
      });
      pan = function(axis, add) {
        var animate, start;
        start = eng.camera.position[axis];
        animate = function(item) {
          var dur, end, step;
          dur = 1000 * item.time;
          end = +new Date() + dur;
          step = function() {
            var current, rate, remaining;
            current = +new Date();
            remaining = end - current;
            if (remaining < 60) {
              item.run(1);
              return;
            } else {
              rate = 1 - remaining / dur;
              item.run(rate);
            }
            return requestAnimationFrame(step);
          };
          return step();
        };
        if (add === true) {
          animate({
            time: duration,
            run: function(rate) {
              eng.camera.position[axis] = start - (amount * rate);
              return eng.camera.lookAt(eng.scene.position);
            }
          });
        }
        if (add === false) {
          return animate({
            time: duration,
            run: function(rate) {
              eng.camera.position[axis] = start + (amount * rate);
              return eng.camera.lookAt(eng.scene.position);
            }
          });
        } else {

        }
        /*
        if add is true
          for c in [1..frames]
            requestAnimationFrame ->
              eng.camera.position[axis] += (amount / frames)
              console.log "Panning?"
              
        
        if add is false
          for c in [1..frames] 
            
            requestAnimationFrame ->
              eng.camera.position[axis] -= (amount / frames)
        else return
        */

      };
    }
  };

  Engine.prototype.entities = {
    all: {},
    visible: []
  };

  Engine.prototype.world = {
    blocks: [],
    skybox: {}
  };

  Engine.prototype.test = function() {
    var plane, planeGeo, planeMat, stage, unit;
    this.controller.moveCamera();
    console.log(this.scene);
    this.world.skybox = new Cube({
      width: 25,
      depth: 25,
      height: 10
    }, {
      color: 0x73432c
    });
    unit = new Entity("unit", "js/game/textures/sprites/test.gif", 36, 36);
    this.addToScene([this.world.skybox.mesh]);
    console.log(this.world.skybox);
    this.spotLight = new THREE.SpotLight(0xffffff0);
    this.spotLight.position.set(0, 1000, 300);
    this.spotLight.shadowMapWidth = 2048;
    this.spotLight.shadowMapHeight = 2048;
    this.spotLight.shadowCameraNear = 500;
    this.spotLight.shadowCameraFar = 4000;
    this.spotLight.shadowCameraFov = 30;
    planeGeo = new THREE.PlaneGeometry(1, 1, 10, 10);
    planeMat = new THREE.MeshLambertMaterial({
      color: 0xe6e6e6
    });
    plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -30;
    plane.receiveShadow = true;
    this.addToScene([plane, this.spotLight]);
    stage = new Stage(" test");
    stage.makeRandomData(10, 10, 10);
    stage.build({
      width: this.settings.world.block.width,
      height: this.settings.world.block.height,
      depth: this.settings.world.block.depth
    }, {
      color: this.settings.world.block.color,
      wireframe: true,
      wireframeLinewidth: 5.0
    });
    stage.addToScene();
    console.log(stage);
    return this.ignition();
  };

  Engine.prototype.toggleShadows = function() {
    if (this.renderer.shadowMapEnabled === false) {
      this.renderer.shadowMapEnabled = true;
    }
    if (this.spotLight.castShadow === false) {
      this.spotLight.castShadow = true;
    }
    if (this.world.skybox.castShadow === false) {
      this.world.skybox.castShadow = true;
    }
    if (this.world.skybox.receiveShadow === false) {
      return this.world.skybox.receiveShadow = true;
    }
  };

  Engine.prototype.ignition = function() {
    var pointer;
    pointer = this;
    return pointer.loop(pointer.draw);
  };

  /*
  @method Engine.addToScene
  @paremtype array
  @param items
  */


  Engine.prototype.addToScene = function(items) {
    var x, _i, _len, _results;
    if (items === null || items === void 0) {
      return console.warn("Improper use of addToScene.");
    }
    _results = [];
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      x = items[_i];
      _results.push(this.scene.add(x));
    }
    return _results;
  };

  Engine.prototype.update = function() {};

  Engine.prototype.draw = function() {
    this.update();
    this.renderer.render(this.scene, this.camera);
  };

  /*
  @method Engine.loop
  @paremtype function instance
  @param The name of the function that is looped
  */


  Engine.prototype.loop = function(function_to_be_looped) {
    var start, step;
    start = window.mozAnimationStartTime || Date.now();
    step = function(timestamp) {
      var progress;
      progress = timestamp - start;
      function_to_be_looped();
      if (progress < 2000) {
        return requestAnimationFrame(step);
      }
    };
    return requestAnimationFrame(step);
  };

  Engine.prototype.destructObjects = function(object) {
    var child, _i, _len, _ref, _ref1, _ref2,
      _this = this;
    switch (true) {
      case object instanceof THREE.Object3D:
        _ref = object.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          this.destructObjects(child);
        }
        if ((_ref1 = object.parent) != null) {
          _ref1.remove(object);
        }
        object.deallocate();
        if ((_ref2 = object.geometry) != null) {
          _ref2.deallocate();
        }
        this.renderer.deallocateObject(object);
        return typeof object.destruct === "function" ? object.destruct(this) : void 0;
      case object instanceof THREE.Material:
        object.deallocate();
        return this.renderer.deallocateMaterial(object);
      case object instanceof THREE.Texture:
        object.deallocate();
        return this.renderer.deallocateTexture(object);
      case object instanceof THREE.EffectComposer:
        this.destructObjects(object.copyPass.material);
        return object.passes.forEach(function(pass) {
          if (pass.material) {
            _this.destructObjects(pass.material);
          }
          if (pass.renderTarget) {
            _this.renderer.deallocateRenderTarget(pass.renderTarget);
          }
          if (pass.renderTarget1) {
            _this.renderer.deallocateRenderTarget(pass.renderTarget1);
          }
          if (pass.renderTarget2) {
            return _this.renderer.deallocateRenderTarget(pass.renderTarget2);
          }
        });
    }
  };

  return Engine;

})();

// Generated by CoffeeScript 1.5.0-pre
