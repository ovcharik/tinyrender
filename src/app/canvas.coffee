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
