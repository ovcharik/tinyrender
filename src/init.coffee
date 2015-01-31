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
