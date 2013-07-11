var Engine;

Engine = (function() {

  function Engine(name) {
    console.clear();
    window.pointer = this;
    _.bindAll(this, "addToScene", "update", "draw", "addFog", "ignition", "test", "initialize", "enableMouse");
    this.config.load(this);
  }

  Engine.prototype.initialized = false;

  Engine.prototype.initialize = function(ctx) {
    var HEIGHT, WIDTH, config, renderer;
    this.load.progress(80);
    config = this.config.defaults;
    console.log("Loading with default configuration:");
    console.log("Initializing Engine.");
    WIDTH = this.screen.getWidth();
    HEIGHT = this.screen.getHeight();
    this.name = name;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(config.camera.angle, WIDTH / HEIGHT, config.camera.near, config.camera.far);
    this.clock = new THREE.Clock(true);
    this.clock.start();
    this.renderer = renderer = new THREE.WebGLRenderer({
      antialaising: config.renderer.antialaising
    });
    this.renderer.setSize(WIDTH, HEIGHT);
    this.load.progress(100, this);
    if (!$('#screen') === false) {
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
    this.camera.position.z = config.camera.start.z;
    this.camera.position.y = config.camera.start.y;
    this.camera.position.x = config.camera.start.x;
    this.initialized = true;
    return this.addFog();
  };

  Engine.prototype.load = {
    start: function() {
      console.log("Loading");
      $('body').append("<div class='loading'><h1>Loading</h1></div>");
      $('.loading').append("<canvas id='loading_bar'> </canvas>");
      $('.loading').css({
        "position": "absolute",
        "top": "35%",
        "left": "35%",
        "width": "10%"
      });
      return $('#loading_bar').css({
        "background-color": "#fff",
        "width": "100px",
        "height": "15px",
        "border": "1px solid #ddd"
      });
    },
    progress: function(amount, ctx) {
      var c, cvs;
      if (amount === 100) {
        ctx.load.done();
        return;
      }
      cvs = document.getElementById('loading_bar');
      c = cvs.getContext('2d');
      c.fillStyle = "#000";
      return c.fillRect(0, 0, amount, 150);
    },
    done: function() {
      $('div.loading').remove();
      $('loading_bar').remove();
      return console.log("done");
    }
  };

  Engine.prototype.config = {
    load: function(ctx) {
      var JSON;
      ctx.load.start();
      console.log("Retrieving Configuration File: config.json");
      console.log(ctx);
      JSON = $.getJSON("js/game/config/config.json");
      JSON.done(function() {
        return ctx.load.progress(15);
      });
      return JSON.complete(function() {
        ctx.load.progress(60);
        ctx.config.defaults = jQuery.parseJSON(JSON.responseText);
        console.log("Config Loaded.");
        ctx.load.progress(70);
        return ctx.initialize(ctx);
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

  Engine.prototype.addFog = function(fogColor) {
    var color, fog, opacity;
    color = parseInt(this.config.defaults.renderer.fogColor);
    opacity = this.config.defaults.renderer.fogOpacity;
    this.renderer.setClearColor(color, opacity);
    this.renderer.clear();
    fog = new THREE.Fog(color, -1000, 3000);
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
    this.controller.orbit.userZoom = true;
    this.controller.orbit.userPan = true;
    return this.controller.orbit.autoRotate = true;
    /* For containing controls:
     @src https://github.com/mrdoob/three.js/blob/master/examples/js/controls/OrbitControls.js
    */

  };

  Engine.prototype.test = function() {
    /*
    # @CONTROLS
    */

    var above, centerOfStage, dir, plane, planeGeo, planeMat, unit;
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
    /*
    # @LIGHT
    */

    this.spotLight = new THREE.SpotLight(0xffffff0);
    this.spotLight.position.set(0, 1000, 300);
    this.spotLight.shadowMapWidth = 2048;
    this.spotLight.shadowMapHeight = 2048;
    this.spotLight.shadowCameraNear = 500;
    this.spotLight.shadowCameraFar = 4000;
    this.spotLight.shadowCameraFov = 30;
    /*
    # @PLANE
    */

    planeGeo = new THREE.PlaneGeometry(10000, 10000, 10, 10);
    planeMat = new THREE.MeshLambertMaterial({
      color: 0x000000
    });
    plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -100;
    plane.receiveShadow = true;
    this.addToScene([plane, this.spotLight]);
    /*
    # @STAGE
    */

    console.log(this.config.defaults.heightmap);
    this.stage = new Stage("test", this.config.defaults.world);
    this.stage.makeFromHeightMap(this.config.defaults.heightmap, 5, 5);
    this.stage.build();
    centerOfStage = this.stage.getCenter();
    above = new THREE.Vector3(0, 100, 0);
    centerOfStage.add(above);
    dir = new THREE.ArrowHelper(new THREE.Vector3(0, -2, 0), centerOfStage, 30, 0x771111);
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
