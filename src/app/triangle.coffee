@triangle = (t0, t1, t2, u0, u1, u2, intensity, canvas, zBuffer = []) ->
  return if t0.y == t1.y and t0.y == t2.y
  if t0.y > t1.y then [t0, t1] = [t1, t0]; [u0, u1] = [u1, u0]
  if t0.y > t2.y then [t0, t2] = [t2, t0]; [u0, u2] = [u2, u0]
  if t1.y > t2.y then [t1, t2] = [t2, t1]; [u1, u2] = [u2, u1]

  t10 = t1.sub(t0)
  t20 = t2.sub(t0)
  t21 = t2.sub(t1)

  u10 = u1.sub(u0)
  u20 = u2.sub(u0)
  u21 = u2.sub(u1)

  totalHight = t2.y - t0.y

  for i in [0..totalHight]
    secondHalf = i > t1.y - t0.y || t1.y == t0.y
    segHeight = secondHalf && t2.y - t1.y || t1.y - t0.y

    y = t0.y + i

    alpha = i / totalHight
    beta  = (i - (secondHalf && t1.y - t0.y || 0)) / segHeight

    a = t0.add t20.mul(alpha)
    b = secondHalf && t1.add(t21.mul(beta)) || t0.add(t10.mul(beta))

    ua = u0.add u20.mul(alpha)
    ub = secondHalf && u1.add(u21.mul(beta)) || u0.add(u10.mul(beta))

    [a, b] = [b, a] if a.x > b.x

    for x in [a.x.ceil()..b.x.ceil()]
      phi = a.x == b.x && 1 || (x - a.x) / (b.x - a.x)
      p = b.sub(a).mul(phi).add(a)
      up = ub.sub(ua).mul(phi).add(ua)
      idx = p.y.mul(canvas.width).add(p.x)
      unless zBuffer[idx]? and zBuffer[idx] > p.z
        zBuffer[idx] = p.z
        color = model.diffuse(up.x, up.y)
        canvas.putPixel x, t0.y + i, color
