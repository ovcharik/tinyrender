class @Model extends Module

  regexs:
    v: /^v +([-+\.\de]+) +([-+\.\de]+) +([-+\.\de]+)$/
    f: /^f +(\d+)\/(\d+)\/(\d+) +(\d+)\/(\d+)\/(\d+) +(\d+)\/(\d+)\/(\d+)$/

  constructor: (data) ->
    @verts = [null]
    @faces = []

    for line in data.split('\n')
      if v = line.match(@regexs.v)
        v = v.slice(1).map Number
        @verts.push new Vec3(v[0], v[1], v[2])
      else if f = line.match(@regexs.f)
        f = f.slice(1).map Number
        @faces.push [f[0], f[3], f[6]]
