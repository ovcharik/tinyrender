(function() {
  var canvas, height, model, moduleKeywords, width,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.assert = function(expr) {
    if (!expr) {
      throw 'Assert failed';
    }
  };

  this.EventMixin = {
    _eventHandlers: function() {
      return this._eventHandlers || (this._eventHandlers = {});
    },
    _getHandlers: function(name) {
      var _base;
      (_base = this._eventHandlers())[name] || (_base[name] = []);
      return this._eventHandlers()[name];
    },
    _setHandlers: function(name, value) {
      var _base;
      (_base = this._eventHandlers())[name] || (_base[name] = value);
    },
    on: function(name, callback) {
      if (!callback) {
        return;
      }
      return this._getHandlers(name).push(callback);
    },
    off: function(name, callback) {
      if (!callback) {
        this._setHandlers(name, []);
      } else {
        this._setHandlers(name, this._getHandlers(name).filter(function(c) {
          return c === callback;
        }));
      }
    },
    trigger: function() {
      var args, cb, name, _i, _len, _ref;
      name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = this._getHandlers(name);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cb = _ref[_i];
        if (cb.apply(this, args) === false) {
          return;
        }
      }
    }
  };

  moduleKeywords = ['extended', 'included'];

  this.Module = (function() {
    function Module() {}

    Module.extend = function(obj) {
      var key, value, _ref;
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) {
          this[key] = value;
        }
      }
      if ((_ref = obj.extended) != null) {
        _ref.apply(this);
      }
      return this;
    };

    Module.include = function(obj) {
      var key, value, _ref;
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      if ((_ref = obj.included) != null) {
        _ref.apply(this);
      }
      return this;
    };

    return Module;

  })();

  Number.prototype.add = function(v) {
    return this + v;
  };

  Number.prototype.sub = function(v) {
    return this - v;
  };

  Number.prototype.mul = function(v) {
    return this * v;
  };

  Number.prototype.div = function(v) {
    return this / v;
  };

  Number.prototype.pow = function(v) {
    return Math.pow(this, v);
  };

  Number.prototype.sqr = function() {
    return Math.pow(this, 2);
  };

  Number.prototype.sqrt = function() {
    return Math.sqrt(this);
  };

  Number.prototype.ceil = function() {
    return Math.ceil(this);
  };

  Number.prototype.round = function() {
    return Math.round(this);
  };

  this.Canvas = (function(_super) {
    __extends(Canvas, _super);

    Canvas.include(EventMixin);

    function Canvas(id) {
      this.id = id;
      this.canvas = document.getElementById(id);
      this.context = this.canvas.getContext('2d');
      return;
    }

    Canvas.prototype.setSize = function(w, h) {
      this.width = this.canvas.width = Math.ceil(w);
      this.height = this.canvas.height = Math.ceil(h);
      this.imageData = this.context.getImageData(0, 0, this.width, this.height);
      this.clear();
      this.trigger('resize');
    };

    Canvas.prototype.clear = function() {
      this.context.clearRect(0, 0, this.width, this.height);
      this.imageData = this.context.getImageData(0, 0, this.width, this.height);
    };

    Canvas.prototype.draw = function() {
      this.context.putImageData(this.imageData, 0, 0);
    };

    Canvas.prototype._position = function(x, y) {
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      return ((this.height - y) * this.width + x) * 4;
    };

    Canvas.prototype._numberToRGBA = function(c, alpha) {
      if (c == null) {
        c = 0;
      }
      if (alpha == null) {
        alpha = false;
      }
      return {
        r: (c >> 16) & 0xFF,
        g: (c >> 8) & 0xFF,
        b: (c >> 0) & 0xFF,
        a: alpha && (c >> 24) & 0xFF || 0xFF
      };
    };

    Canvas.prototype.putPixel = function(x, y, c, alpha) {
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      if (c == null) {
        c = 0;
      }
      if (alpha == null) {
        alpha = false;
      }
      return this.putRGBAPixel(x, y, this._numberToRGBA(c, alpha));
    };

    Canvas.prototype.putRGBAPixel = function(x, y, rgba) {
      var b, bytes, p, _i, _len;
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      if (rgba == null) {
        rgba = {};
      }
      if (x > this.width || y > this.height) {
        return;
      }
      bytes = [rgba.r != null ? rgba.r : 0xFF, rgba.g != null ? rgba.g : 0xFF, rgba.b != null ? rgba.b : 0xFF, rgba.a != null ? rgba.a : 0xFF];
      p = this._position(x, y);
      for (_i = 0, _len = bytes.length; _i < _len; _i++) {
        b = bytes[_i];
        this.imageData.data[p++] = b;
      }
    };

    Canvas.prototype.getPixel = function(x, y) {
      var b, p, result, shift, _i, _len, _ref;
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      result = 0x00;
      p = this._position(x, y);
      _ref = [16, 8, 0, 24];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        shift = _ref[_i];
        b = this.imageData.data[p++];
        result |= b << shift;
      }
      return result;
    };

    Canvas.prototype.getRGBAPixel = function(x, y) {
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      return this._numberToRGBA(this.getPixel(x, y), true);
    };

    return Canvas;

  })(Module);

  this.FileInput = (function(_super) {
    __extends(FileInput, _super);

    FileInput.include(EventMixin);

    FileInput.prototype.types = {
      'text': 'readAsText',
      'bytes': 'readAsArrayBuffer'
    };

    function FileInput(id, type) {
      this.id = id;
      this.type = type != null ? type : 'text';
      this.input = document.getElementById(this.id);
      this.input.onchange = this.onChange.bind(this);
      this.reader = new FileReader();
      this.reader.onload = this.onLoad.bind(this);
    }

    FileInput.prototype.onChange = function(event) {
      this.file = event.target.files[0];
      return this.reader[this.types[this.type]](this.file);
    };

    FileInput.prototype.onLoad = function(event) {
      this.data = event.target.result;
      return this.trigger('load', this.data);
    };

    return FileInput;

  })(Module);

  this.Vec2 = (function(_super) {
    __extends(Vec2, _super);

    function Vec2(x, y) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
    }

    Vec2.prototype.add = function(v) {
      return new Vec2(this.x.add(v.x, this.y.add(v.y)));
    };

    Vec2.prototype.sub = function(v) {
      return new Vec2(this.x.sub(v.x, this.y.sub(v.y)));
    };

    Vec2.prototype.mul = function(f) {
      return new Vec2(this.x.mul(f, this.y.mul(f)));
    };

    Vec2.prototype.print = function() {
      return console.log("(" + this.x + ", " + this.y + ")");
    };

    return Vec2;

  })(Module);

  this.Vec3 = (function(_super) {
    __extends(Vec3, _super);

    function Vec3(x, y, z) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.z = z != null ? z : 0;
    }

    Vec3.prototype.prod = function(v) {
      return new Vec3(this.y.mul(v.z).sub(this.z.mul(v.y), this.z.mul(v.x).sub(this.x.mul(v.z), this.x.mul(v.y).sub(this.y.mul(v.x)))));
    };

    Vec3.prototype.add = function(v) {
      return new Vec3(this.x.add(v.x, this.y.add(v.y, this.z.add(v.z))));
    };

    Vec3.prototype.sub = function(v) {
      return new Vec3(this.x.sub(v.x, this.y.sub(v.y, this.z.sub(v.z))));
    };

    Vec3.prototype.mul = function(v) {
      if (v instanceof Vec3) {
        return this.x.mul(v.x).add(this.y.mul(v.y)).add(this.z.mul(v.z));
      } else {
        return new Vec3(this.x.mul(v), this.y.mul(v), this.z.mul(v));
      }
    };

    Vec3.prototype.norm = function() {
      return this.x.mul(this.x).add(this.y.mul(this.y)).add(this.z.mul(this.z)).sqrt();
    };

    Vec3.prototype.normalize = function(l) {
      if (l == null) {
        l = 1;
      }
      return this.mul(l / this.norm());
    };

    Vec3.prototype.print = function() {
      return console.log("(" + this.x + ", " + this.y + ", " + this.z + ")");
    };

    return Vec3;

  })(Module);

  this.line = function(x0, y0, x1, y1, color, canvas) {
    var derror2, dx, dy, error2, steep, x, y, ystep, _i, _ref, _ref1, _ref2, _ref3, _results;
    steep = false;
    if (Math.abs(x0 - x1) < Math.abs(y0 - y1)) {
      _ref = [y0, x0], x0 = _ref[0], y0 = _ref[1];
      _ref1 = [y1, x1], x1 = _ref1[0], y1 = _ref1[1];
      steep = true;
    }
    if (x0 > x1) {
      _ref2 = [x1, x0], x0 = _ref2[0], x1 = _ref2[1];
      _ref3 = [y1, y0], y0 = _ref3[0], y1 = _ref3[1];
    }
    dx = x1 - x0;
    dy = y1 - y0;
    derror2 = Math.abs(dy) * 2;
    error2 = 0;
    ystep = y1 > y0 ? 1 : -1;
    y = y0;
    _results = [];
    for (x = _i = x0; x0 <= x1 ? _i <= x1 : _i >= x1; x = x0 <= x1 ? ++_i : --_i) {
      if (steep) {
        canvas.putPixel(y, x, color);
      } else {
        canvas.putPixel(x, y, color);
      }
      error2 += derror2;
      if (error2 > dx) {
        y += ystep;
        _results.push(error2 -= dx * 2);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  this.Model = (function(_super) {
    __extends(Model, _super);

    Model.prototype.regexs = {
      v: /^v +([-+\.\de]+) +([-+\.\de]+) +([-+\.\de]+)$/,
      f: /^f +(\d+)\/(\d+)\/(\d+) +(\d+)\/(\d+)\/(\d+) +(\d+)\/(\d+)\/(\d+)$/
    };

    function Model(data) {
      var f, line, v, _i, _len, _ref;
      this.verts = [null];
      this.faces = [];
      _ref = data.split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (v = line.match(this.regexs.v)) {
          v = v.slice(1).map(Number);
          this.verts.push(new Vec3(v[0], v[1], v[2]));
        } else if (f = line.match(this.regexs.f)) {
          f = f.slice(1).map(Number);
          this.faces.push([f[0], f[3], f[6]]);
        }
      }
    }

    return Model;

  })(Module);

  canvas = null;

  model = null;

  width = 800;

  height = 800;

  window.onload = function() {
    var fileinput;
    fileinput = new FileInput('file');
    canvas = new Canvas('canvas');
    canvas.setSize(width, height);
    return fileinput.on('load', function(data) {
      var face, hHalf, i, v0, v1, wHalf, x0, x1, y0, y1, _i, _j, _len, _ref;
      canvas.clear();
      model = new Model(data);
      wHalf = width / 2;
      hHalf = height / 2;
      _ref = model.faces;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        face = _ref[_i];
        for (i = _j = 0; _j <= 2; i = ++_j) {
          v0 = model.verts[face[i]];
          v1 = model.verts[face[(i + 1) % 3]];
          x0 = ((v0.x.add(1)).mul(wHalf)).ceil();
          y0 = ((v0.y.add(1)).mul(hHalf)).ceil();
          x1 = ((v1.x.add(1)).mul(wHalf)).ceil();
          y1 = ((v1.y.add(1)).mul(hHalf)).ceil();
          line(x0, y0, x1, y1, 0xFFFFFF, canvas);
        }
      }
      return canvas.draw();
    });
  };

}).call(this);

//# sourceMappingURL=main.js.map
