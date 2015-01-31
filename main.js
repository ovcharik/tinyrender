(function() {
  var canvas, moduleKeywords,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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

  this.Canvas = (function(_super) {
    __extends(Canvas, _super);

    Canvas.include(EventMixin);

    function Canvas(id) {
      this.id = id;
      this.canvas = document.getElementById(id);
      this.context = this.canvas.getContext('2d');
      this.clear();
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
      return (y * this.width + x) * 4;
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

  canvas = null;

  window.onload = function() {
    canvas = new Canvas('canvas');
    return window.onresize();
  };

  window.onresize = function() {
    var h, w;
    w = window.innerWidth * 0.9;
    h = window.innerHeight * 0.9;
    canvas.setSize(w, h);
    canvas.putPixel(10, 10, 0xff0000);
    canvas.putPixel(11, 11, 0xff0000);
    canvas.putPixel(12, 12, 0xff0000);
    canvas.putPixel(13, 13, 0xff0000);
    canvas.putPixel(10, 11, 0xff0000);
    canvas.putPixel(11, 12, 0xff0000);
    canvas.putPixel(12, 13, 0xff0000);
    canvas.putPixel(13, 14, 0xff0000);
    return canvas.draw();
  };

}).call(this);

//# sourceMappingURL=main.js.map
