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

  onChange: (event) ->
    @file = event.target.files[0]
    @reader[@types[@type]](@file)

  onLoad: (event) ->
    @data = event.target.result
    @trigger 'load', @data
