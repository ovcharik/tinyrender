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
