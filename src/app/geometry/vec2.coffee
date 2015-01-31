class @Vec2 extends Module

  constructor: (@x = 0, @y = 0) ->

  add: (v) -> new Vec2 @x.add(v.x), @y.add(v.y)
  sub: (v) -> new Vec2 @x.sub(v.x), @y.sub(v.y)
  mul: (v) ->
    if v instanceof Vec2
      @x.mul(v.x).add(@y.mul(v.y))
    else
      new Vec2 @x.mul(v), @y.mul(v)

  print: -> console.log "(#{@x}, #{@y})"
