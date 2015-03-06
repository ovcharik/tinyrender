canvas = null
model = null

width  = 800
height = 800

window.onload = ->
  # modelFile = new FileInput 'model'
  tgaFile = new FileInput 'tga', 'bytes'
  tga = new TGAImage tgaFile

  bmpFile = new FileInput 'bmp', 'bytes'
  bmp = new BMPImage bmpFile

  canvas = new Canvas('canvas')

  tga.on 'load', ->
    tga.draw(canvas)

  bmp.on 'load', ->
    bmp.draw(canvas)

  # modelFile.on 'load', (data) ->
  #   canvas.setSize(width, height)
  #   canvas.clear()

  #   model = new Model(data)

  #   wHalf = width / 2
  #   hHalf = height / 2
  #   zBuffer = []

  #   light = new Vec3(0, 0, -1)

  #   model.forEachFaces (face) ->
  #     wc = face.verts
  #     sc = wc.map (v) -> new Vec3 ((v.x.add(1)).mul(wHalf)).ceil(), ((v.y.add(1)).mul(hHalf)).ceil(), v.z

  #     n = wc[2].sub(wc[0]).prod(wc[1].sub(wc[0])).normalize()
  #     i = n.mul(light).mul(255).ceil()

  #     if i > 0
  #       c = (i & 0xFF) | ((i << 8) & 0xFF00) | ((i << 16) & 0xFF0000)
  #       triangle.apply @, sc.concat( [c, canvas, zBuffer] )
  #   canvas.draw()
