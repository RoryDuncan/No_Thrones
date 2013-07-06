var Engine;

Engine = (function() {

  function Engine(name) {
    var CAMERA_START, FAR, HEIGHT, NEAR, VIEW_ANGLE, WIDTH, renderer;
    console.clear();
    window.pointer = this;
    VIEW_ANGLE = 35;
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    NEAR = 0.1;
    FAR = 5000;
    CAMERA_START = 600;
    /*
      @Data until created elsewhere
    */

    this.config = {
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
          height: 5,
          color: 0xffffff
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
      $('.game').append(this.renderer.domElement);
      $('canvas').attr({
        'id': "screen"
      });
      $('canvas').css({
        "width": WIDTH + "px",
        "height": HEIGHT + "px"
      });
    }
    this.camera.position.z = CAMERA_START;
    this.camera.position.y = 200;
    this.camera.position.x = 300;
    _.bindAll(this, "addToScene", "update", "draw", "makeSkybox", "ignition", "test");
    return;
  }

  Engine.prototype.makeSkybox = function(fogColor) {
    var color, fog;
    color = fogColor || 0xaaaaaa;
    this.renderer.setClearColor(color, 1);
    this.renderer.clear();
    fog = new THREE.Fog(color, 0, 2000);
    this.scene.fog = fog;
    return this.test();
  };

  Engine.prototype.controller = {};

  Engine.prototype["entities"] = {
    "sprites": [],
    "all": [],
    "visible": []
  };

  Engine.prototype["nonEnts"] = {
    "blocks": []
  };

  Engine.prototype["world"] = {
    "blocks": [],
    "skybox": {}
  };

  Engine.prototype.enableMouse = function() {
    this.controller.orbit = new THREE.OrbitControls(this.camera, document.getElementById('screen'));
    return this.controller.orbit.userPanSpeed = 4;
    /* For containing controls:
     @src https://github.com/mrdoob/three.js/blob/master/examples/js/controls/OrbitControls.js
    */

  };

  Engine.prototype.test = function() {
    var dir, plane, planeGeo, planeMat, unit;
    console.group("test");
    this.enableMouse();
    this.world.skybox = new Cube({
      width: 25,
      depth: 25,
      height: 10
    }, {
      color: 0xffffff
    });
    unit = new Sprite("unit", "js/game/textures/sprites/test.gif", 36, 36);
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
    this.stage = new Stage(" test");
    this.stage.makeFlat(15, 15);
    this.stage.build({
      width: this.config.world.block.width,
      height: this.config.world.block.height,
      depth: this.config.world.block.depth
    }, {
      color: 0xeeffff,
      wireframe: false,
      wireframeLinewidth: 5.0
    });
    dir = new THREE.ArrowHelper(new THREE.Vector3(0, -2, 0), new THREE.Vector3(0, 100, 0), 30, 0x771111);
    this.scene.add(dir);
    this.stage.addToScene();
    console.log(this.stage);
    return this.ignition();
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

  Engine.prototype.update = function() {
    this.camera.lookAt(this.scene.position);
    return this.controller.orbit.update();
  };

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
