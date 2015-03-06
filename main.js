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
      return this.__eventHandlers || (this.__eventHandlers = {});
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

  Number.prototype.abs = function() {
    return Math.abs(this);
  };

  this.BMPImage = (function(_super) {
    __extends(BMPImage, _super);

    BMPImage.include(EventMixin);

    BMPImage.prototype.colortypes = {
      grayscale: 1,
      rgb: 3,
      rgba: 4
    };

    BMPImage.prototype.formats = {
      palette: 1,
      truecolor: 2,
      monochrome: 3,
      rle: 8
    };

    function BMPImage(fileInput) {
      this.fileInput = fileInput;
      this.fileInput.setType('bytes');
      this.fileInput.on('load', this._onFileLoad.bind(this));
    }

    BMPImage.prototype._onFileLoad = function(data) {
      return this.readFileBuffer(data);
    };

    BMPImage.prototype._reset = function() {
      this._nextBytesOffset = 0;
      delete this._header;
      delete this._bytespp;
      delete this.width;
      return delete this.height;
    };

    BMPImage.prototype._readBytesAsNumber = function(count, offset, data) {
      var i, r, _i, _ref;
      r = 0;
      for (i = _i = _ref = count - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
        r |= (data[offset + i] & 0xFF) << (i * 8);
      }
      return r;
    };

    BMPImage.prototype._readNextBytesAsNumber = function(count, data) {
      var offset;
      offset = this._nextBytesOffset || (this._nextBytesOffset = 0);
      this._nextBytesOffset += count;
      return this._readBytesAsNumber(count, offset, data);
    };

    BMPImage.prototype._readHeader = function(data) {
      return {
        idlength: this._readNextBytesAsNumber(1, data),
        colormaptype: this._readNextBytesAsNumber(1, data),
        datatypecode: this._readNextBytesAsNumber(1, data),
        colormaporigin: this._readNextBytesAsNumber(2, data),
        colormaplength: this._readNextBytesAsNumber(2, data),
        colormapdepth: this._readNextBytesAsNumber(1, data),
        xOrigin: this._readNextBytesAsNumber(2, data),
        yOrigin: this._readNextBytesAsNumber(2, data),
        width: this._readNextBytesAsNumber(2, data),
        height: this._readNextBytesAsNumber(2, data),
        bitsperpixel: this._readNextBytesAsNumber(1, data),
        imagedescriptor: this._readNextBytesAsNumber(1, data)
      };
    };

    BMPImage.prototype._readPixel = function(bpp, data) {
      var color;
      color = this._readNextBytesAsNumber(bpp, data);
      if (bpp === this.colortypes.grayscale) {
        color = (0xFF << 24) | (color << 16) | (color << 8) | color;
      } else if (bpp === this.colortypes.rgb) {
        color = (0xFF << 24) | color;
      } else if (bpp !== this.colortypes.rgba) {
        throw new Error('Unknow color type');
      }
      return color;
    };

    BMPImage.prototype._readPixels = function(data) {
      if (!(this._header.datatypecode | this.formats.rle)) {
        return this._readSimplePixels(data);
      } else {
        return this._readRLEPixels(data);
      }
    };

    BMPImage.prototype._readSimplePixels = function(data) {
      var i, npixels, pixels, _i, _ref;
      npixels = this.width * this.height;
      pixels = [];
      for (i = _i = 0, _ref = npixels - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        pixels.push(this._readPixel(this._bytespp, data));
      }
      return pixels;
    };

    BMPImage.prototype._readRLEPixels = function(data) {
      var chunk, cpixel, i, npixels, pixel, pixels, _i, _j, _ref;
      npixels = this.width * this.height;
      cpixel = 0;
      pixels = [];
      while (npixels > cpixel) {
        chunk = this._readNextBytesAsNumber(1, data);
        if (chunk < 128) {
          for (i = _i = 0; 0 <= chunk ? _i <= chunk : _i >= chunk; i = 0 <= chunk ? ++_i : --_i) {
            pixels.push(this._readPixel(this._bytespp, data));
            cpixel++;
          }
        } else {
          chunk -= 127;
          pixel = this._readPixel(this._bytespp, data);
          for (i = _j = 0, _ref = chunk - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; i = 0 <= _ref ? ++_j : --_j) {
            pixels.push(pixel);
            cpixel++;
          }
        }
      }
      return pixels;
    };

    BMPImage.prototype.readFileBuffer = function(data) {
      this._reset();
      this._header = this._readHeader(data);
      this._bytespp = this._header.bitsperpixel >> 3;
      this.height = this._header.height;
      this.width = this._header.width;
      this._pixels = this._readPixels(data);
      if (this._header.imagedescriptor & 0x20) {
        this.flipVertically();
      }
      if (this._header.imagedescriptor & 0x10) {
        this.flipHorizontally();
      }
      return this.trigger('load');
    };

    BMPImage.prototype.flipHorizontally = function() {
      var half, i, j, p1, p2, _i, _ref, _results;
      if (!this._pixels) {
        return;
      }
      half = this.width >> 1;
      _results = [];
      for (i = _i = 0, _ref = half - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _ref1, _ref2, _results1;
          _results1 = [];
          for (j = _j = 0, _ref1 = this.height - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
            p1 = j * this.width + i;
            p2 = j * this.width + this.width - 1 - i;
            _results1.push((_ref2 = [this._pixels[p2], this._pixels[p1]], this._pixels[p1] = _ref2[0], this._pixels[p2] = _ref2[1], _ref2));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    BMPImage.prototype.flipVertically = function() {
      var half, i, j, p1, p2, _i, _ref, _results;
      if (!this._pixels) {
        return;
      }
      half = this.height >> 1;
      _results = [];
      for (i = _i = 0, _ref = half - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _ref1, _ref2, _results1;
          _results1 = [];
          for (j = _j = 0, _ref1 = this.width - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
            p1 = i * this.width + j;
            p2 = (this.height - 1 - i) * this.width + j;
            _results1.push((_ref2 = [this._pixels[p2], this._pixels[p1]], this._pixels[p1] = _ref2[0], this._pixels[p2] = _ref2[1], _ref2));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    BMPImage.prototype.getPixel = function(x, y) {
      return this._pixels[y * this.width + x];
    };

    BMPImage.prototype.setPixel = function(x, y, color) {
      return this._pixels[y * this.width + x] = color;
    };

    BMPImage.prototype.draw = function(canvas) {
      var p, x, y, _i, _len, _ref, _ref1;
      canvas.setSize(this.width, this.height);
      canvas.clear();
      _ref = [0, 0], x = _ref[0], y = _ref[1];
      _ref1 = this._pixels;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        p = _ref1[_i];
        canvas.putPixel(x, y, p);
        x++;
        if (x >= this.width) {
          y++;
          x = 0;
        }
      }
      return canvas.draw();
    };

    return BMPImage;

  })(Module);

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
      if (typeof c === 'object') {
        return c;
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

    FileInput.prototype.setType = function(type) {
      if (type == null) {
        type = 'text';
      }
      return this.type = type;
    };

    FileInput.prototype.onChange = function(event) {
      this.file = event.target.files[0];
      return this.reader[this.types[this.type]](this.file);
    };

    FileInput.prototype.onLoad = function(event) {
      this.data = event.target.result;
      if (this.type === 'bytes') {
        this.data = new Int8Array(this.data);
      }
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
      return new Vec2(this.x.add(v.x), this.y.add(v.y));
    };

    Vec2.prototype.sub = function(v) {
      return new Vec2(this.x.sub(v.x), this.y.sub(v.y));
    };

    Vec2.prototype.mul = function(v) {
      if (v instanceof Vec2) {
        return this.x.mul(v.x).add(this.y.mul(v.y));
      } else {
        return new Vec2(this.x.mul(v), this.y.mul(v));
      }
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
      return new Vec3(this.y.mul(v.z).sub(this.z.mul(v.y)), this.z.mul(v.x).sub(this.x.mul(v.z)), this.x.mul(v.y).sub(this.y.mul(v.x)));
    };

    Vec3.prototype.add = function(v) {
      return new Vec3(this.x.add(v.x), this.y.add(v.y), this.z.add(v.z));
    };

    Vec3.prototype.sub = function(v) {
      return new Vec3(this.x.sub(v.x), this.y.sub(v.y), this.z.sub(v.z));
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
      v: /^v\s+([-+\.\de]+)\s+([-+\.\de]+)\s+([-+\.\de]+)$/,
      vt: /^vt\s+([-+\.\de]+)\s+([-+\.\de]+)\s+([-+\.\de]+)$/,
      vn: /^vn\s+([-+\.\de]+)\s+([-+\.\de]+)\s+([-+\.\de]+)$/,
      f: /^f\s+(\d+)\/(\d+)\/(\d+)\s+(\d+)\/(\d+)\/(\d+)\s+(\d+)\/(\d+)\/(\d+)$/
    };

    function Model(data) {
      var f, line, v, vn, vt, _i, _len, _ref;
      this.verts = [null];
      this.texts = [null];
      this.norms = [null];
      this.faces = [];
      _ref = data.split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (v = line.match(this.regexs.v)) {
          v = v.slice(1).map(Number);
          this.verts.push(new Vec3(v[0], v[1], v[2]));
        } else if (vt = line.match(this.regexs.vt)) {
          vt = vt.slice(1).map(Number);
          this.texts.push(new Vec3(vt[0], vt[1], vt[2]));
        } else if (vn = line.match(this.regexs.vn)) {
          vn = vn.slice(1).map(Number);
          this.norms.push(new Vec3(vn[0], vn[1], vn[2]));
        } else if (f = line.match(this.regexs.f)) {
          f = f.slice(1).map(Number);
          this.faces.push([f.splice(0, 3), f.splice(0, 3), f]);
        }
      }
    }

    Model.prototype.face = function(i) {
      var f;
      f = this.faces[i];
      return {
        verts: [this.verts[f[0][0]], this.verts[f[1][0]], this.verts[f[2][0]]],
        texts: [this.texts[f[0][1]], this.texts[f[1][1]], this.texts[f[2][1]]],
        norms: [this.norms[f[0][2]], this.norms[f[1][2]], this.norms[f[2][2]]]
      };
    };

    Model.prototype.forEachFaces = function(cb) {
      var i, _i, _ref, _results;
      if (!cb) {
        return;
      }
      _results = [];
      for (i = _i = 0, _ref = this.faces.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (cb.apply(this, [this.face(i)]) === false) {
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Model.prototype.setDiffuse = function(tga) {
      return this._diffuseTexture = tga;
    };

    Model.prototype.diffuse = function(x, y) {
      return this._diffuseTexture.getPixel(x, y);
    };

    return Model;

  })(Module);

  this.TGAImage = (function(_super) {
    __extends(TGAImage, _super);

    TGAImage.include(EventMixin);

    TGAImage.prototype.colortypes = {
      grayscale: 1,
      rgb: 3,
      rgba: 4
    };

    TGAImage.prototype.formats = {
      palette: 1,
      truecolor: 2,
      monochrome: 3,
      rle: 8
    };

    function TGAImage(fileInput) {
      this.fileInput = fileInput;
      this.fileInput.setType('bytes');
      this.fileInput.on('load', this._onFileLoad.bind(this));
    }

    TGAImage.prototype._onFileLoad = function(data) {
      return this.readFileBuffer(data);
    };

    TGAImage.prototype._reset = function() {
      this._nextBytesOffset = 0;
      delete this._header;
      delete this._bytespp;
      delete this.width;
      return delete this.height;
    };

    TGAImage.prototype._readBytesAsNumber = function(count, offset, data) {
      var i, r, _i, _ref;
      r = 0;
      for (i = _i = _ref = count - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
        r |= (data[offset + i] & 0xFF) << (i * 8);
      }
      return r;
    };

    TGAImage.prototype._readNextBytesAsNumber = function(count, data) {
      var offset;
      offset = this._nextBytesOffset || (this._nextBytesOffset = 0);
      this._nextBytesOffset += count;
      return this._readBytesAsNumber(count, offset, data);
    };

    TGAImage.prototype._readHeader = function(data) {
      return {
        idlength: this._readNextBytesAsNumber(1, data),
        colormaptype: this._readNextBytesAsNumber(1, data),
        datatypecode: this._readNextBytesAsNumber(1, data),
        colormaporigin: this._readNextBytesAsNumber(2, data),
        colormaplength: this._readNextBytesAsNumber(2, data),
        colormapdepth: this._readNextBytesAsNumber(1, data),
        xOrigin: this._readNextBytesAsNumber(2, data),
        yOrigin: this._readNextBytesAsNumber(2, data),
        width: this._readNextBytesAsNumber(2, data),
        height: this._readNextBytesAsNumber(2, data),
        bitsperpixel: this._readNextBytesAsNumber(1, data),
        imagedescriptor: this._readNextBytesAsNumber(1, data)
      };
    };

    TGAImage.prototype._readPixel = function(bpp, data) {
      var color;
      color = this._readNextBytesAsNumber(bpp, data);
      if (bpp === this.colortypes.grayscale) {
        color = (0xFF << 24) | (color << 16) | (color << 8) | color;
      } else if (bpp === this.colortypes.rgb) {
        color = (0xFF << 24) | color;
      } else if (bpp !== this.colortypes.rgba) {
        throw new Error('Unknow color type');
      }
      return color;
    };

    TGAImage.prototype._readPixels = function(data) {
      if (!(this._header.datatypecode | this.formats.rle)) {
        return this._readSimplePixels(data);
      } else {
        return this._readRLEPixels(data);
      }
    };

    TGAImage.prototype._readSimplePixels = function(data) {
      var i, npixels, pixels, _i, _ref;
      npixels = this.width * this.height;
      pixels = [];
      for (i = _i = 0, _ref = npixels - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        pixels.push(this._readPixel(this._bytespp, data));
      }
      return pixels;
    };

    TGAImage.prototype._readRLEPixels = function(data) {
      var chunk, cpixel, i, npixels, pixel, pixels, _i, _j, _ref;
      npixels = this.width * this.height;
      cpixel = 0;
      pixels = [];
      while (npixels > cpixel) {
        chunk = this._readNextBytesAsNumber(1, data);
        if (chunk < 128) {
          for (i = _i = 0; 0 <= chunk ? _i <= chunk : _i >= chunk; i = 0 <= chunk ? ++_i : --_i) {
            pixels.push(this._readPixel(this._bytespp, data));
            cpixel++;
          }
        } else {
          chunk -= 127;
          pixel = this._readPixel(this._bytespp, data);
          for (i = _j = 0, _ref = chunk - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; i = 0 <= _ref ? ++_j : --_j) {
            pixels.push(pixel);
            cpixel++;
          }
        }
      }
      return pixels;
    };

    TGAImage.prototype.readFileBuffer = function(data) {
      this._reset();
      this._header = this._readHeader(data);
      this._bytespp = this._header.bitsperpixel >> 3;
      this.height = this._header.height;
      this.width = this._header.width;
      this._pixels = this._readPixels(data);
      if (this._header.imagedescriptor & 0x20) {
        this.flipVertically();
      }
      if (this._header.imagedescriptor & 0x10) {
        this.flipHorizontally();
      }
      return this.trigger('load');
    };

    TGAImage.prototype.flipHorizontally = function() {
      var half, i, j, p1, p2, _i, _ref, _results;
      if (!this._pixels) {
        return;
      }
      half = this.width >> 1;
      _results = [];
      for (i = _i = 0, _ref = half - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _ref1, _ref2, _results1;
          _results1 = [];
          for (j = _j = 0, _ref1 = this.height - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
            p1 = j * this.width + i;
            p2 = j * this.width + this.width - 1 - i;
            _results1.push((_ref2 = [this._pixels[p2], this._pixels[p1]], this._pixels[p1] = _ref2[0], this._pixels[p2] = _ref2[1], _ref2));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    TGAImage.prototype.flipVertically = function() {
      var half, i, j, p1, p2, _i, _ref, _results;
      if (!this._pixels) {
        return;
      }
      half = this.height >> 1;
      _results = [];
      for (i = _i = 0, _ref = half - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _ref1, _ref2, _results1;
          _results1 = [];
          for (j = _j = 0, _ref1 = this.width - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
            p1 = i * this.width + j;
            p2 = (this.height - 1 - i) * this.width + j;
            _results1.push((_ref2 = [this._pixels[p2], this._pixels[p1]], this._pixels[p1] = _ref2[0], this._pixels[p2] = _ref2[1], _ref2));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    TGAImage.prototype.getPixel = function(x, y) {
      return this._pixels[y * this.width + x];
    };

    TGAImage.prototype.setPixel = function(x, y, color) {
      return this._pixels[y * this.width + x] = color;
    };

    TGAImage.prototype.draw = function(canvas) {
      var p, x, y, _i, _len, _ref, _ref1;
      canvas.setSize(this.width, this.height);
      canvas.clear();
      _ref = [0, 0], x = _ref[0], y = _ref[1];
      _ref1 = this._pixels;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        p = _ref1[_i];
        canvas.putPixel(x, y, p);
        x++;
        if (x >= this.width) {
          y++;
          x = 0;
        }
      }
      return canvas.draw();
    };

    return TGAImage;

  })(Module);

  this.triangle = function(t0, t1, t2, u0, u1, u2, intensity, canvas, zBuffer) {
    var a, alpha, b, beta, color, i, idx, p, phi, secondHalf, segHeight, t10, t20, t21, totalHight, u10, u20, u21, ua, ub, up, x, y, _i, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
    if (zBuffer == null) {
      zBuffer = [];
    }
    if (t0.y === t1.y && t0.y === t2.y) {
      return;
    }
    if (t0.y > t1.y) {
      _ref = [t1, t0], t0 = _ref[0], t1 = _ref[1];
      _ref1 = [u1, u0], u0 = _ref1[0], u1 = _ref1[1];
    }
    if (t0.y > t2.y) {
      _ref2 = [t2, t0], t0 = _ref2[0], t2 = _ref2[1];
      _ref3 = [u2, u0], u0 = _ref3[0], u2 = _ref3[1];
    }
    if (t1.y > t2.y) {
      _ref4 = [t2, t1], t1 = _ref4[0], t2 = _ref4[1];
      _ref5 = [u2, u1], u1 = _ref5[0], u2 = _ref5[1];
    }
    t10 = t1.sub(t0);
    t20 = t2.sub(t0);
    t21 = t2.sub(t1);
    u10 = u1.sub(u0);
    u20 = u2.sub(u0);
    u21 = u2.sub(u1);
    totalHight = t2.y - t0.y;
    _results = [];
    for (i = _i = 0; 0 <= totalHight ? _i <= totalHight : _i >= totalHight; i = 0 <= totalHight ? ++_i : --_i) {
      secondHalf = i > t1.y - t0.y || t1.y === t0.y;
      segHeight = secondHalf && t2.y - t1.y || t1.y - t0.y;
      y = t0.y + i;
      alpha = i / totalHight;
      beta = (i - (secondHalf && t1.y - t0.y || 0)) / segHeight;
      a = t0.add(t20.mul(alpha));
      b = secondHalf && t1.add(t21.mul(beta)) || t0.add(t10.mul(beta));
      ua = u0.add(u20.mul(alpha));
      ub = secondHalf && u1.add(u21.mul(beta)) || u0.add(u10.mul(beta));
      if (a.x > b.x) {
        _ref6 = [b, a], a = _ref6[0], b = _ref6[1];
      }
      _results.push((function() {
        var _j, _ref7, _ref8, _results1;
        _results1 = [];
        for (x = _j = _ref7 = a.x.ceil(), _ref8 = b.x.ceil(); _ref7 <= _ref8 ? _j <= _ref8 : _j >= _ref8; x = _ref7 <= _ref8 ? ++_j : --_j) {
          phi = a.x === b.x && 1 || (x - a.x) / (b.x - a.x);
          p = b.sub(a).mul(phi).add(a);
          up = ub.sub(ua).mul(phi).add(ua);
          idx = p.y.mul(canvas.width).add(p.x);
          if (!((zBuffer[idx] != null) && zBuffer[idx] > p.z)) {
            zBuffer[idx] = p.z;
            color = model.diffuse(up.x, up.y);
            _results1.push(canvas.putPixel(x, t0.y + i, color));
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      })());
    }
    return _results;
  };

  canvas = null;

  model = null;

  width = 800;

  height = 800;

  window.onload = function() {
    var bmp, bmpFile, tga, tgaFile;
    tgaFile = new FileInput('tga', 'bytes');
    tga = new TGAImage(tgaFile);
    bmpFile = new FileInput('bmp', 'bytes');
    bmp = new BMPImage(bmpFile);
    canvas = new Canvas('canvas');
    tga.on('load', function() {
      return tga.draw(canvas);
    });
    return bmp.on('load', function() {
      return bmp.draw(canvas);
    });
  };

}).call(this);

//# sourceMappingURL=main.js.map
