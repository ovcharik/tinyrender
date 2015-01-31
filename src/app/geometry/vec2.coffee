class @Vec2 extends Module

  constructor: (@x = 0, @y = 0) ->

  add: (v) -> new Vec2 @x.add v.x, @y.add v.y
  sub: (v) -> new Vec2 @x.sub v.x, @y.sub v.y
  mul: (f) -> new Vec2 @x.mul f  , @y.mul f

  print: -> console.log "(#{@x}, #{@y})"
