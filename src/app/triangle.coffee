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
