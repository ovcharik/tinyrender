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

    for face in model.faces
      for i in [0..2]
        v0 = model.verts[face[i]]
        v1 = model.verts[face[(i + 1) % 3]]

        x0 = ((v0.x.add(1)).mul(wHalf)).ceil()
        y0 = ((v0.y.add(1)).mul(hHalf)).ceil()
        x1 = ((v1.x.add(1)).mul(wHalf)).ceil()
        y1 = ((v1.y.add(1)).mul(hHalf)).ceil()

        line(x0, y0, x1, y1, 0xFFFFFF, canvas)

    canvas.draw()
