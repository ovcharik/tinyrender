@EventMixin =
  _eventHandlers: ->
    @_eventHandlers ||= {}

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

class @Canvas extends Module
  @include EventMixin

  constructor: (id) ->
    @id = id
    @canvas = document.getElementById(id)
    @context = @canvas.getContext('2d')
    @clear()
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
    return

  draw: ->
    @context.putImageData @imageData, 0, 0
    return

  # helpers
  _position: (x = 0, y = 0) ->
    (y * @width + x) * 4

  _numberToRGBA: (c = 0, alpha = false) ->
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

canvas = null

window.onload = ->
  canvas = new Canvas('canvas')
  window.onresize()

window.onresize = ->
  w = window.innerWidth  * 0.9
  h = window.innerHeight * 0.9
  canvas.setSize(w, h)
  canvas.putPixel(10, 10, 0xff0000)
  canvas.putPixel(11, 11, 0xff0000)
  canvas.putPixel(12, 12, 0xff0000)
  canvas.putPixel(13, 13, 0xff0000)
  canvas.putPixel(10, 11, 0xff0000)
  canvas.putPixel(11, 12, 0xff0000)
  canvas.putPixel(12, 13, 0xff0000)
  canvas.putPixel(13, 14, 0xff0000)
  canvas.draw()
