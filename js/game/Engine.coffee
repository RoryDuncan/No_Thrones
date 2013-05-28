
Engine = ->

  @.canvas = window.canvas
  @.stage = new createjs.Stage(window.canvas)

  @.backdrop = ->
    #console.log @
    stage = @.stage
    canvas = @.canvas
    #  Engine.backdrop is the 'skybox' of the output area
    fullRectangle = new createjs.Graphics().beginFill("#000").drawRect(0, 0, canvas.width, canvas.height)
    background = new createjs.Shape(fullRectangle)
    stage.addChild(background)
    # Update stage will render next frame
    stage.update()
  console.log "Engine started. Vrroom."
