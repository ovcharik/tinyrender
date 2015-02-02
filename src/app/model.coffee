class @Model extends Module

  regexs:
    v:  /^v\s+([-+\.\de]+)\s+([-+\.\de]+)\s+([-+\.\de]+)$/
    vt: /^vt\s+([-+\.\de]+)\s+([-+\.\de]+)\s+([-+\.\de]+)$/
    vn: /^vn\s+([-+\.\de]+)\s+([-+\.\de]+)\s+([-+\.\de]+)$/
    f:  /^f\s+(\d+)\/(\d+)\/(\d+)\s+(\d+)\/(\d+)\/(\d+)\s+(\d+)\/(\d+)\/(\d+)$/

  constructor: (data) ->
    @verts = [null]
    @texts = [null]
    @norms = [null]
    @faces = []

    for line in data.split('\n')
      if v = line.match(@regexs.v)
        v = v.slice(1).map Number
        @verts.push new Vec3(v[0], v[1], v[2])
      else if vt = line.match(@regexs.vt)
        vt = vt.slice(1).map Number
        @texts.push new Vec3(vt[0], vt[1], vt[2])
      else if vn = line.match(@regexs.vn)
        vn = vn.slice(1).map Number
        @norms.push new Vec3(vn[0], vn[1], vn[2])
      else if f = line.match(@regexs.f)
        f = f.slice(1).map Number
        @faces.push [f.splice(0, 3), f.splice(0, 3), f]

  face: (i) ->
    f = @faces[i]
    {
      verts: [@verts[f[0][0]], @verts[f[1][0]], @verts[f[2][0]]]
      texts: [@texts[f[0][1]], @texts[f[1][1]], @texts[f[2][1]]]
      norms: [@norms[f[0][2]], @norms[f[1][2]], @norms[f[2][2]]]
    }

  forEachFaces: (cb) ->
    return unless cb
    for i in [0..@faces.length - 1]
      break if cb.apply(@, [@face(i)]) == false
