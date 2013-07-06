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

  function Stage(name) {
    this.name = name;
    this.title = "World " + name;
    console.log(this);
  }

  Stage.prototype.data = [];

  Stage.prototype.actors = [];

  /*
  @params heightMap - array
  */


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

  Stage.prototype.makeFromHeightMap = function(heightMap, length, width) {
    var eachSquare, total, x, y, z, _i, _results;
    if (heightMap || length || width === void 0) {
      return console.error("Missing parameter of Stage.makeFromHeightMap. 3 Parameters required.");
    }
    total = heightMap.length;
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
        'y': 1 + ~~(Math.random() * 10),
        'z': z
      });
      x++;
      _results.push(this.size++);
    }
    return _results;
  };

  Stage.prototype.makeRandomData = function(length, width, peak, noise) {
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
    var actor, baseHeight, datum, margin, position, _i, _len, _ref;
    baseHeight = cubeGeometry.height;
    if (this.data.length === 0) {
      return console.error("I can't build without any lumber. (psst, data is missing)");
    }
    margin = 0.001;
    if (origin === void 0) {
      origin = new THREE.Vector3(0, 0, 0);
    }
    console.groupCollapsed("Building...");
    _ref = this.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      datum = _ref[_i];
      cubeGeometry.height = (baseHeight - 1) * datum.y;
      position = new THREE.Vector3(datum.x * cubeGeometry.width + (datum.x * margin), cubeGeometry.height / 2, datum.z * cubeGeometry.depth + (datum.z * margin));
      actor = new Cube(cubeGeometry, cubeMaterial, position);
      actor.from = datum;
      this.actors.push(actor);
    }
    console.log(this.actors);
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
