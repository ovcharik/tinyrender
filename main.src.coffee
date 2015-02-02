@assert = (expr) ->
  throw 'Assert failed' unless expr

@EventMixin =
  _eventHandlers: ->
    @__eventHandlers ||= {}

  _getHandlers: (name) ->
    @_eventHandlers()[name] ||= []
    return @_eventHandlers()[name]

  _setHandlers: (name, value) ->
    @_eventHandlers()[name] ||= value
    return

  on: (name, callback) ->
    return unless callback
    @_getHandlers(name).push callback

  off: (name, callback) ->
    unless callback
      @_setHandlers(name, [])
    else
      @_setHandlers name, @_getHandlers(name).filter (c) ->
        c == callback
    return

  trigger: (name, args...) ->
    for cb in @_getHandlers(name)
      return if cb.apply(@, args) == false
    return

moduleKeywords = ['extended', 'included']

class @Module
  @extend: (obj) ->
    for key, value of obj when key not in moduleKeywords
      @[key] = value

    obj.extended?.apply(@)
    this

  @include: (obj) ->
    for key, value of obj when key not in moduleKeywords
      # Assign properties to the prototype
      @::[key] = value

    obj.included?.apply(@)
    this

Number::add = (v) -> @ + v
Number::sub = (v) -> @ - v
Number::mul = (v) -> @ * v
Number::div = (v) -> @ / v
Number::pow = (v) -> Math.pow(@, v)
Number::sqr = -> Math.pow(@, 2)
Number::sqrt = -> Math.sqrt(@)
Number::ceil = -> Math.ceil(@)
Number::round = -> Math.round(@)
Number::abs = -> Math.abs(@)

class @Canvas extends Module
  @include EventMixin

  constructor: (id) ->
    @id = id
    @canvas = document.getElementById(id)
    @context = @canvas.getContext('2d')
    return

  # canvas
  setSize: (w, h) ->
    @width  = @canvas.width  = Math.ceil(w)
    @height = @canvas.height = Math.ceil(h)

    @imageData = @context.getImageData(0, 0, @width, @height)
    @clear()
    @trigger 'resize'
    return

  clear: ->
    @context.clearRect(0, 0, @width, @height)
    @imageData = @context.getImageData(0, 0, @width, @height)
    return

  draw: ->
    @context.putImageData @imageData, 0, 0
    return

  # helpers
  _position: (x = 0, y = 0) ->
    ((@height - y) * @width + x) * 4

  _numberToRGBA: (c = 0, alpha = false) ->
    return c if typeof c == 'object'
    {
      r: (c >> 16) & 0xFF
      g: (c >>  8) & 0xFF
      b: (c >>  0) & 0xFF
      a: alpha && (c >> 24) & 0xFF || 0xFF
    }

  # pixels
  putPixel: (x = 0, y = 0, c = 0, alpha = false) ->
    @putRGBAPixel x, y, @_numberToRGBA(c, alpha)

  putRGBAPixel: (x = 0, y = 0, rgba = {}) ->
    return if x > @width or y > @height

    bytes = [
      if rgba.r? then rgba.r else 0xFF
      if rgba.g? then rgba.g else 0xFF
      if rgba.b? then rgba.b else 0xFF
      if rgba.a? then rgba.a else 0xFF
    ]

    p = @_position(x, y)
    for b in bytes
      @imageData.data[p++] = b
    return

  getPixel: (x = 0, y = 0) ->
    result = 0x00
    p = @_position(x, y)
    for shift in [16, 8, 0, 24]
      b = @imageData.data[p++]
      result |= b << shift
    return result

  getRGBAPixel: (x = 0, y = 0) ->
    return @_numberToRGBA @getPixel(x, y), true

class @FileInput extends Module
  @include EventMixin

  types:
    'text' : 'readAsText'
    'bytes': 'readAsArrayBuffer'

  constructor: (@id, @type = 'text') ->
    @input = document.getElementById(@id)
    @input.onchange = @onChange.bind(@)

    @reader = new FileReader()
    @reader.onload = @onLoad.bind(@)

  setType: (type = 'text') ->
    @type = type

  onChange: (event) ->
    @file = event.target.files[0]
    @reader[@types[@type]](@file)

  onLoad: (event) ->
    @data = event.target.result
    if @type == 'bytes'
      @data = new Int8Array @data
    @trigger 'load', @data

class @Vec2 extends Module

  constructor: (@x = 0, @y = 0) ->

  add: (v) -> new Vec2 @x.add(v.x), @y.add(v.y)
  sub: (v) -> new Vec2 @x.sub(v.x), @y.sub(v.y)
  mul: (v) ->
    if v instanceof Vec2
      @x.mul(v.x).add(@y.mul(v.y))
    else
      new Vec2 @x.mul(v), @y.mul(v)

  print: -> console.log "(#{@x}, #{@y})"

class @Vec3 extends Module

  constructor: (@x = 0, @y = 0, @z = 0) ->

  prod: (v) -> new Vec3 @y.mul(v.z).sub(@z.mul(v.y)), @z.mul(v.x).sub(@x.mul(v.z)), @x.mul(v.y).sub(@y.mul(v.x))
  add: (v) -> new Vec3 @x.add(v.x), @y.add(v.y), @z.add(v.z)
  sub: (v) -> new Vec3 @x.sub(v.x), @y.sub(v.y), @z.sub(v.z)
  mul: (v) ->
    if v instanceof Vec3
      @x.mul(v.x).add(@y.mul(v.y)).add(@z.mul(v.z))
    else
      new Vec3 @x.mul(v), @y.mul(v), @z.mul(v)

  norm: -> @x.mul(@x).add(@y.mul(@y)).add(@z.mul(@z)).sqrt()
  normalize: (l = 1) -> @mul(l / @norm())

  print: -> console.log "(#{@x}, #{@y}, #{@z})"

@line = (x0, y0, x1, y1, color, canvas) ->
  steep = false
  if Math.abs(x0 - x1) < Math.abs(y0 - y1)
    [x0, y0] = [y0, x0]
    [x1, y1] = [y1, x1]
    steep = true

  if x0 > x1
    [x0, x1] = [x1, x0]
    [y0, y1] = [y1, y0]

  dx = x1 - x0
  dy = y1 - y0

  derror2 = Math.abs(dy) * 2
  error2  = 0

  ystep = if y1 > y0 then 1 else -1
  y = y0

  for x in [x0..x1]
    if steep
      canvas.putPixel y, x, color
    else
      canvas.putPixel x, y, color

    error2 += derror2

    if error2 > dx
      y += ystep
      error2 -= dx * 2

class @Model extends Module

  regexs:
    v:  /^v\s+([-+\.\de]+)\s+([-+\.\de]+)\s+([-+\.\de]+)$/
    vt: /^vt\s+([-+\.\de]+)\s+([-+\.\de]+)\s+([-+\.\de]+)$/
    vn: /^vn\s+([-+\.\de]+)\s+([-+\.\de]+)\s+([-+\.\de]+)$/
    f:  /^f\s+(\d+)\/(\d+)\/(\d+)\s+(\d+)\/(\d+)\/(\d+)\s+(\d+)\/(\d+)\/(\d+)$/

  constructor: (data) ->
    @verts = [null]
    @texts = [null]
    @norms = [null]
    @faces = []

    for line in data.split('\n')
      if v = line.match(@regexs.v)
        v = v.slice(1).map Number
        @verts.push new Vec3(v[0], v[1], v[2])
      else if vt = line.match(@regexs.vt)
        vt = vt.slice(1).map Number
        @texts.push new Vec3(vt[0], vt[1], vt[2])
      else if vn = line.match(@regexs.vn)
        vn = vn.slice(1).map Number
        @norms.push new Vec3(vn[0], vn[1], vn[2])
      else if f = line.match(@regexs.f)
        f = f.slice(1).map Number
        @faces.push [f.splice(0, 3), f.splice(0, 3), f]

  face: (i) ->
    f = @faces[i]
    {
      verts: [@verts[f[0][0]], @verts[f[1][0]], @verts[f[2][0]]]
      texts: [@texts[f[0][1]], @texts[f[1][1]], @texts[f[2][1]]]
      norms: [@norms[f[0][2]], @norms[f[1][2]], @norms[f[2][2]]]
    }

  forEachFaces: (cb) ->
    return unless cb
    for i in [0..@faces.length - 1]
      break if cb.apply(@, [@face(i)]) == false

class @TGAImage extends Module
  @include EventMixin

  colortypes:
    grayscale : 1
    rgb       : 3
    rgba      : 4

  formats:
    palette    : 1
    truecolor  : 2
    monochrome : 3
    rle        : 8

  constructor: (@fileInput) ->
    @fileInput.setType('bytes')
    @fileInput.on 'load', @_onFileLoad.bind(@)

  _onFileLoad: (data) ->
    @readFileBuffer data

  _reset: ->
    @_nextBytesOffset = 0
    delete @_header
    delete @_bytespp
    delete @width
    delete @height

  _readBytesAsNumber: (count, offset, data) ->
    r = 0
    for i in [count - 1..0]
      r |= ((data[offset + i] & 0xFF) << (i * 8))
    r

  _readNextBytesAsNumber: (count, data) ->
    offset = @_nextBytesOffset ||= 0
    @_nextBytesOffset += count
    @_readBytesAsNumber(count, offset, data)

  _readHeader: (data) ->
    idlength:        @_readNextBytesAsNumber(1, data)
    colormaptype:    @_readNextBytesAsNumber(1, data)
    datatypecode:    @_readNextBytesAsNumber(1, data)
    colormaporigin:  @_readNextBytesAsNumber(2, data)
    colormaplength:  @_readNextBytesAsNumber(2, data)
    colormapdepth:   @_readNextBytesAsNumber(1, data)
    xOrigin:         @_readNextBytesAsNumber(2, data)
    yOrigin:         @_readNextBytesAsNumber(2, data)
    width:           @_readNextBytesAsNumber(2, data)
    height:          @_readNextBytesAsNumber(2, data)
    bitsperpixel:    @_readNextBytesAsNumber(1, data)
    imagedescriptor: @_readNextBytesAsNumber(1, data)

  _readPixel: (bpp, data) ->
    color = @_readNextBytesAsNumber(bpp, data)
    if bpp == @colortypes.grayscale
      color = (0xFF << 24) | (color << 16) | (color << 8) | color
    else if bpp == @colortypes.rgb
      color = (0xFF << 24) | color
    else unless bpp == @colortypes.rgba
      throw new Error('Unknow color type')
    color

  _readPixels: (data) ->
    unless @_header.datatypecode | @formats.rle
      @_readSimplePixels(data)
    else
      @_readRLEPixels(data)

  _readSimplePixels: (data) ->
    npixels = @width * @height
    pixels = []
    for i in [0..npixels - 1]
      pixels.push @_readPixel @_bytespp, data
    pixels

  _readRLEPixels: (data) ->
    npixels = @width * @height
    cpixel = 0
    pixels = []
    while npixels > cpixel
      chunk = @_readNextBytesAsNumber(1, data)
      if chunk < 128
        for i in [0..chunk]
          pixels.push @_readPixel @_bytespp, data
          cpixel++
      else
        chunk -= 127
        pixel = @_readPixel @_bytespp, data
        for i in [0..chunk - 1]
          pixels.push pixel
          cpixel++
    pixels

  readFileBuffer: (data) ->
    @_reset()
    @_header = @_readHeader(data)
    @_bytespp = @_header.bitsperpixel >> 3
    @height = @_header.height
    @width = @_header.width
    @_pixels = @_readPixels(data)
    if @_header.imagedescriptor & 0x20
      @flipVertically()
    if @_header.imagedescriptor & 0x10
      @flipHorizontally()
    @trigger 'load'

  flipHorizontally: ->
    return unless @_pixels
    half = @width >> 1
    for i in [0..half - 1]
      for j in [0..@height - 1]
        p1 = j * @width + i
        p2 = j * @width + @width - 1 - i
        [@_pixels[p1], @_pixels[p2]] = [@_pixels[p2], @_pixels[p1]]

  flipVertically: ->
    return unless @_pixels
    half = @height >> 1
    for i in [0..half - 1]
      for j in [0..@width - 1]
        p1 = i * @width + j
        p2 = (@height - 1 - i) * @width + j
        [@_pixels[p1], @_pixels[p2]] = [@_pixels[p2], @_pixels[p1]]

  getPixel: (x, y) -> @_pixels[y * @width + x]
  setPixel: (x, y, color) -> @_pixels[y * @width + x] = color

  draw: (canvas) ->
    canvas.setSize(@width, @height)
    canvas.clear()
    [x, y] = [0, 0]
    for p in @_pixels
      canvas.putPixel x, y, p
      x++
      if x >= @width
        y++
        x = 0
    canvas.draw()


@triangle = (t0, t1, t2, color, canvas, zBuffer = []) ->
  [t0, t1, t2] = [t0, t1, t2].sort (a, b) -> a.y - b.y

  t10 = t1.sub(t0)
  t20 = t2.sub(t0)
  t21 = t2.sub(t1)

  totalHight = t2.y - t0.y

  for i in [0..totalHight]
    secondHalf = i > t1.y - t0.y || t1.y == t0.y
    segHeight = secondHalf && t2.y - t1.y || t1.y - t0.y

    y = t0.y + i

    alpha = i / totalHight
    beta  = (i - (secondHalf && t1.y - t0.y || 0)) / segHeight

    Vec3 a = t0.add t20.mul(alpha)
    Vec3 b = secondHalf && t1.add(t21.mul(beta)) || t0.add(t10.mul(beta))

    [a, b] = [b, a] if a.x > b.x

    for x in [a.x.ceil()..b.x.ceil()]
      phi = a.x == b.x && 1 || (x - a.x) / (b.x - a.x)
      p = b.sub(a).mul(phi).add(a)
      idx = p.y.mul(canvas.width).add(p.x)
      unless zBuffer[idx]? and zBuffer[idx] > p.z
        zBuffer[idx] = p.z
        canvas.putPixel x, t0.y + i, color

canvas = null
model = null

width  = 800
height = 800

window.onload = ->
  modelFile = new FileInput 'model'
  diffuseFile = new FileInput 'diffuse', 'bytes'
  tga = new TGAImage diffuseFile
  canvas = new Canvas('canvas')

  tga.on 'load', ->
    tga.draw(canvas)

  modelFile.on 'load', (data) ->
    canvas.setSize(width, height)
    canvas.clear()

    model = new Model(data)

    wHalf = width / 2
    hHalf = height / 2
    zBuffer = []

    light = new Vec3(0, 0, -1)

    model.forEachFaces (face) ->
      wc = face.verts
      sc = wc.map (v) -> new Vec3 ((v.x.add(1)).mul(wHalf)).ceil(), ((v.y.add(1)).mul(hHalf)).ceil(), v.z

      n = wc[2].sub(wc[0]).prod(wc[1].sub(wc[0])).normalize()
      i = n.mul(light).mul(255).ceil()

      if i > 0
        c = (i & 0xFF) | ((i << 8) & 0xFF00) | ((i << 16) & 0xFF0000)
        triangle.apply @, sc.concat( [c, canvas, zBuffer] )
    canvas.draw()
