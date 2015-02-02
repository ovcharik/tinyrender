class @FileInput extends Module
  @include EventMixin

  types:
    'text' : 'readAsText'
    'bytes': 'readAsArrayBuffer'

  constructor: (@id, @type = 'text') ->
    @input = document.getElementById(@id)
    @input.onchange = @onChange.bind(@)

    @reader = new FileReader()
    @reader.onload = @onLoad.bind(@)

  setType: (type = 'text') ->
    @type = type

  onChange: (event) ->
    @file = event.target.files[0]
    @reader[@types[@type]](@file)

  onLoad: (event) ->
    @data = event.target.result
    if @type == 'bytes'
      @data = new Int8Array @data
    @trigger 'load', @data
