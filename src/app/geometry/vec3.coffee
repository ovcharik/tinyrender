class @Vec3 extends Module

  constructor: (@x = 0, @y = 0, @z = 0) ->

  prod: (v) -> new Vec3 @y.mul(v.z).sub @z.mul(v.y), @z.mul(v.x).sub @x.mul(v.z), @x.mul(v.y).sub @y.mul(v.x)
  add: (v) -> new Vec3 @x.add v.x, @y.add v.y, @z.add v.z
  sub: (v) -> new Vec3 @x.sub v.x, @y.sub v.y, @z.sub v.z
  mul: (v) ->
    if v instanceof Vec3
      @x.mul(v.x).add(@y.mul(v.y)).add(@z.mul(v.z))
    else
      new Vec3 @x.mul(v), @y.mul(v), @z.mul(v)

  norm: -> @x.mul(@x).add(@y.mul(@y)).add(@z.mul(@z)).sqrt()
  normalize: (l = 1) -> @mul(l / @norm())

  print: -> console.log "(#{@x}, #{@y}, #{@z})"
