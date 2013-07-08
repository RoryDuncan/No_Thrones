var Engine;

Engine = (function() {

  function Engine(name) {
    $('body').append("<div class='loading'><h1>Loading</h1></div>");
    $('.loading').css({
      "position": "absolute",
      "top": "40%",
      "left": "40%",
      "width": "10%"
    });
    window.pointer = this;
    _.bindAll(this, "addToScene", "update", "draw", "makeSkybox", "ignition", "test");
    this.config.get(this);
  }

  Engine.prototype.initialize = function() {
    var HEIGHT, WIDTH, renderer;
    console.log("Initializing Engine.");
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    this.name = name;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.config.camera.angle, WIDTH / HEIGHT, this.config.camera.near, this.config.camera.far);
    this.clock = new THREE.Clock(true);
    this.clock.start();
    console.log(this.camera);
    this.renderer = renderer = new THREE.WebGLRenderer({
      antialaising: true
    });
    this.renderer.setSize(WIDTH, HEIGHT);
    if (!($('canvas')[0]) || !$('#screen')) {
      $('.game').append(this.renderer.domElement);
      $('canvas').attr({
        'id': "screen"
      });
      $('canvas').css({
        "width": WIDTH + "px",
        "height": HEIGHT + "px"
      });
    }
    this.$el = $('canvas#screen');
    this.camera.position.z = this.config.camera.start.z;
    this.camera.position.y = this.config.camera.start.y;
    return this.camera.position.x = this.config.camera.start.x;
  };

  Engine.prototype.config = {
    get: function(ctx) {
      var JSON, self;
      self = ctx;
      console.log("Retrieving Configuration File");
      JSON = $.getJSON("js/game/config/config.json");
      return JSON.done(function() {
        console.log("Parsing");
        this.config["default"] = JSON;
        ctx.initialize();
        console.log("Config Loaded.");
        return console.log("Initializing Engine.");
      });
    },
    saveToCookie: function(configuration) {
      return console.log("Saving to cookie.");
    }
  };

  Engine.prototype.screen = {
    getWidth: function() {
      return window.innerWidth;
    },
    getHeight: function() {
      return window.innerHeight;
    }
  };

  Engine.prototype.makeSkybox = function(fogColor) {
    var color, fog;
    color = fogColor || 0xeeeeee;
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
    return this.controller.orbit.userPanSpeed = 1.5;
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
