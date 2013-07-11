/*

@_______________________No_Thrones_________________________@
@___________________________by_____________________________@
@_______________________Rory_Duncan________________________@
@             http://www.github.com/RoryDuncan             @
*/

/*
@class stage
@level 
@methods constructor
@params length, width, depth, color
*/

var Stage;

Stage = (function() {

  function Stage(name, config, origin) {
    this.name = name;
    this.title = "World " + name;
    this.config = config || false;
    console.log(this);
    origin = origin || new THREE.Vector3();
  }

  Stage.prototype.data = [];

  Stage.prototype.actors = [];

  Stage.prototype.getCenter = function() {
    var select;
    console.log("Getting center of stage");
    select = ~~(this.size / 2);
    return this.actors[select].mesh.position.clone();
  };

  Stage.prototype.makeFlat = function(length, width, floorHeight) {
    var eachSquare, total, x, y, z, _i, _results;
    if (length === void 0 || null) {
      return console.error("Size parameter required.");
    }
    if (width === void 0) {
      width = length;
    }
    if (floorHeight === void 0) {
      floorHeight = 1;
    }
    total = (length * width) - 1;
    this.settings = {
      rows: width,
      cols: length,
      stacks: floorHeight
    };
    this.data = [];
    this.size = 0;
    x = 0;
    y = 0;
    z = 0;
    _results = [];
    for (eachSquare = _i = 0; 0 <= total ? _i <= total : _i >= total; eachSquare = 0 <= total ? ++_i : --_i) {
      if (x === width) {
        z += 1;
      }
      if (x === width) {
        x = 0;
      }
      this.data.push({
        'id': eachSquare,
        'x': x,
        'y': floorHeight,
        'z': z
      });
      x++;
      _results.push(this.size++);
    }
    return _results;
  };

  Stage.prototype.makeFromHeightMap = function(height_map) {
    var eachSquare, total, x, y, z, _i, _ref, _results;
    console.group("INPUTS");
    console.log(height_map);
    console.groupEnd("INPUTS");
    if (height_map.length === 0) {
      return console.error("Height Map must be an array.");
    }
    total = height_map.length * height_map.width;
    this.settings = {
      rows: height_map.width,
      cols: height_map.length
    };
    this.data = [];
    this.size = 0;
    x = 0;
    y = 0;
    z = 0;
    _results = [];
    for (eachSquare = _i = 0, _ref = total - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; eachSquare = 0 <= _ref ? ++_i : --_i) {
      if (x === height_map.width) {
        z += 1;
      }
      if (x === height_map.width) {
        x = 0;
      }
      this.data.push({
        'id': eachSquare,
        'x': x,
        'y': height_map.data[eachSquare],
        'z': z
      });
      x++;
      _results.push(this.size++);
    }
    return _results;
  };

  Stage.prototype.makeRandom = function(length, width, peak, noise) {
    var eachSquare, total, x, y, z, _i;
    if (length === void 0) {
      return console.error("Arguments not specified. Stage.makeRandomData(h,w,maxZ) arguments needed.");
    }
    if (width === void 0) {
      return console.error("Arguments not specified. Stage.makeRandomData(h,w,maxZ) arguments needed.");
    }
    if (peak === void 0) {
      console.warn("maximum Z value not specified, defaulting to 15");
    }
    if (peak === void 0) {
      peak = 15;
    }
    this.settings = {
      rows: width,
      cols: length,
      stacks: peak
    };
    this.data = [];
    this.size = 0;
    x = 0;
    y = 0;
    z = 0;
    noise = noise || peak;
    console.groupCollapsed("Creating Data");
    total = (length * width) - 1;
    for (eachSquare = _i = 0; 0 <= total ? _i <= total : _i >= total; eachSquare = 0 <= total ? ++_i : --_i) {
      if (x === width) {
        z += 1;
      }
      if (x === width) {
        x = 0;
      }
      this.data.push({
        'id': eachSquare,
        'x': x,
        'y': 1 + ~~(Math.random() * 10),
        'z': z
      });
      x++;
      this.size++;
    }
    console.log(this.data);
    console.groupEnd("Creating Data");
    return this;
  };

  Stage.prototype.clear = function() {
    this.data = [];
    return this;
  };

  /*
  @method Stage.build
  */


  Stage.prototype.build = function(cubeGeometry, cubeMaterial, origin) {
    var actor, baseHeight, datum, depth, geometry, height, margin, material, position, width, _i, _len, _ref;
    if (this.data.length === 0) {
      return console.error("I can't build without any lumber. ( data is missing)");
    }
    /* @CONFIGURATION
    */

    geometry = this.config.geometry;
    material = this.config.material;
    material.color = parseInt(material.color, 16);
    /*  @SETTINGS
    */

    if (origin === void 0) {
      origin = new THREE.Vector3(0, 0, 0);
    }
    baseHeight = geometry.height;
    width = geometry.width;
    depth = geometry.depth;
    margin = geometry.margin;
    console.groupCollapsed("Building...");
    /*  @PROCESS
    */

    _ref = this.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      datum = _ref[_i];
      height = (baseHeight - 1) * datum.y;
      position = new THREE.Vector3(datum.x * width + (datum.x * margin), height / 2, datum.z * depth + (datum.z * margin));
      geometry.height = height;
      actor = new Cube(geometry, material, position);
      actor.from = datum;
      this.actors.push(actor);
    }
    console.groupEnd("Building...");
    return this;
  };

  Stage.prototype.addToScene = function() {
    var eachActor, _i, _len, _ref, _results;
    if (this.actors.length === 0) {
      return console.error("Not enough actors.");
    }
    _ref = this.actors;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      eachActor = _ref[_i];
      _results.push(eachActor.addToScene());
    }
    return _results;
  };

  Stage.prototype.get = function(values) {
    var results;
    if (values === void 0 || values === null) {
      return console.error("No arguments given. to Stage.get()");
    }
    results = [];
    results = _.where(this.data, values);
    if (results.length === 0) {
      return false;
    } else {
      return results;
    }
  };

  return Stage;

})();

// Generated by CoffeeScript 1.5.0-pre
