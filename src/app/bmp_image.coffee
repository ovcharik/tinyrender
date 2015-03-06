class @BMPImage extends Module
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
