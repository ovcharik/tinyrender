canvas = null
model = null

width  = 800
height = 800

window.onload = ->
  fileinput = new FileInput('file')
  canvas = new Canvas('canvas')
  canvas.setSize(width, height)

  fileinput.on 'load', (data) ->
    canvas.clear()

    model = new Model(data)

    wHalf = width / 2
    hHalf = height / 2

    light = new Vec3(0, 0, -1)

    for face in model.faces
      wc = []
      sc = []
      for i in [0..2]
        v = model.verts[face[i]]
        wc[i] = v
        sc[i] = new Vec2 ((v.x.add(1)).mul(wHalf)).ceil(), ((v.y.add(1)).mul(hHalf)).ceil()

      n = wc[2].sub(wc[0]).prod(wc[1].sub(wc[0])).normalize()
      i = n.mul(light).mul(255).ceil()

      if i > 0
        c = (i & 0xFF) | ((i << 8) & 0xFF00) | ((i << 16) & 0xFF0000)
        triangle.apply @, sc.concat( [c, canvas] )
    canvas.draw()
