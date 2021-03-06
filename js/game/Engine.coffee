

class Engine

  constructor: (name) ->
    console.clear()

    # Keep it tidy, m'love
    #console.clear()
    #set a fallback reference
    window.pointer = @
    # Any method that 'this' needs to be in
    _.bindAll @, "addToScene", "update", "draw", "addFog", "ignition", "test", "initialize", "enableMouse"

    # get the data needed to start everythign up.
    # data located in config.json
    @config.load(@) # context passed in.

  initialized: false

  initialize:  (ctx) ->
    @load.progress(80)
    # Initialize the engine based off of
    # settings described in config.json
    config = @config.defaults

    console.log "Loading with default configuration:"

    console.log "Initializing Engine."
    WIDTH = @screen.getWidth()
    HEIGHT = @screen.getHeight()

    @name = name
    @scene = new THREE.Scene()
    @camera = new THREE.PerspectiveCamera( config.camera.angle, WIDTH / HEIGHT, config.camera.near, config.camera.far)
    @clock = new THREE.Clock( true )
    @clock.start()

    @renderer = renderer = new THREE.WebGLRenderer({ antialaising: config.renderer.antialaising })
    @renderer.setSize( WIDTH, HEIGHT )

    # inject the canvas
    # if not already present
    @load.progress(100, @)

    if ( !$('#screen') is false )
      $('.game').append( @renderer.domElement )
      $('canvas').attr({'id':"screen"})

      $('canvas').css {"width": (WIDTH) + "px", "height": (HEIGHT) + "px"}

    @$el = $('canvas#screen') 

    @camera.position.z = config.camera.start.z
    @camera.position.y = config.camera.start.y
    @camera.position.x = config.camera.start.x
    #@camera.rotation.x = -0.45
    @initialized = true
    
    @addFog()
    
  load:
    start: ->
      console.log "Loading"
      $('body').append "<div class='loading'><h1>Loading</h1></div>"
      $('.loading').append "<canvas id='loading_bar'> </canvas>"
      $('.loading').css
        "position":"absolute"
        "top":"35%"
        "left":"35%"
        "width":"10%"
      $('#loading_bar').css
        "background-color":"#fff"
        "width":"100px"
        "height":"15px"
        "border":"1px solid #ddd"
    progress: (amount, ctx) ->
      #c = context
      if amount is 100
        ctx.load.done()
        return
      cvs = document.getElementById('loading_bar')
      c = cvs.getContext('2d')
      c.fillStyle = "#000"

      c.fillRect 0,0,amount,150



    done: ->
      $('div.loading').remove()
      $('loading_bar').remove()
      console.log "done"

  config:
    load: (ctx) ->
      #check to see if there is a cookie with configurations in it.

      ctx.load.start()

      # @ is the config object
      console.log "Retrieving Configuration File: config.json"
      console.log ctx

      #ajax request
      JSON = $.getJSON "js/game/config/config.json"
      JSON.done ->
        ctx.load.progress(15)

      # when done, 
      JSON.complete ->
        ctx.load.progress(60)
        # attach to the Engine object as the 'defaults'
        ctx.config.defaults = jQuery.parseJSON JSON.responseText
        # Now we're ready to kick off the Engine
        console.log "Config Loaded."
        ctx.load.progress(70)

        ctx.initialize(ctx)
    saveToCookie: (configuration) ->
      console.log "Saving to cookie."


  screen: 
    getWidth: ->
      return window.innerWidth
    getHeight: ->
      return window.innerHeight

  addFog: ( fogColor ) ->

    color = parseInt(@config.defaults.renderer.fogColor)
    opacity = @config.defaults.renderer.fogOpacity

    @renderer.setClearColor(color, opacity)
    @renderer.clear()

    fog = new THREE.Fog( color, -1000, 3000 )
    @scene.fog = fog
    @test()

  controller: {}

  "entities": 
    "sprites": []
    "all": []
    "visible": []

  "nonEnts":
    "blocks": []

  "world" :
    "blocks": [] # list for the environment
    "skybox": {}

  enableMouse: ->
    
    @controller.orbit = new THREE.OrbitControls @camera, document.getElementById('screen') 
    @controller.orbit.userZoom = true
    @controller.orbit.userPan = true
    @controller.orbit.autoRotate = true
    ### For containing controls:
     @src https://github.com/mrdoob/three.js/blob/master/examples/js/controls/OrbitControls.js
    ###
  test: ->

    ###
    # @CONTROLS
    ###
    console.group "test"

    @enableMouse()


    #@controller.moveCamera()

    @world.skybox = new Cube {width:25, depth:25, height:10,}, {color:0xffffff}
    unit = new Sprite "unit", "js/game/textures/sprites/test.gif", 36, 36

    #@addToScene [@world.skybox.mesh]
    #console.log @world.skybox
    ###
    # @LIGHT
    ###
    # only spot lights enable shadows
    @spotLight = new THREE.SpotLight( 0xffffff0 )
    @spotLight.position.set( 0, 1000, 300 )

    # shadow config
    @spotLight.shadowMapWidth = 2048
    @spotLight.shadowMapHeight = 2048
    @spotLight.shadowCameraNear = 500
    @spotLight.shadowCameraFar = 4000
    @spotLight.shadowCameraFov = 30

    #@scene.add( @spotLight )

    #console.log @world.skybox
    ###
    # @PLANE
    ###
    planeGeo = new THREE.PlaneGeometry(10000, 10000, 10, 10)
    planeMat = new THREE.MeshLambertMaterial({color: 0x000000})
    plane = new THREE.Mesh( planeGeo, planeMat)
    plane.rotation.x = -Math.PI/2
    plane.position.y = -100
    plane.receiveShadow = true

    #@scene.add @plane

    @addToScene( [plane, @spotLight] )

    ###
    # @STAGE
    ###

    console.log @config.defaults.heightmap
    @stage = new Stage "test", @config.defaults.world
    @stage.makeFromHeightMap(@config.defaults.heightmap, 5, 5)
    @stage.build()
    centerOfStage = @stage.getCenter()
    above = new THREE.Vector3( 0, 100, 0 )
    centerOfStage.add above
    dir = new THREE.ArrowHelper( (new THREE.Vector3( 0, -2, 0 )), centerOfStage, 30, 0x771111 ) 
    @scene.add dir
    @stage.addToScene()

    console.log @stage

    @ignition()

  ignition: ->
    #ignition is used to start looping the engine's drawing process
    pointer = @
    pointer.loop( pointer.draw )

  ###
  @method Engine.addToScene
  @paremtype array
  @param items
  ###

  addToScene: (items) ->

    if items is null or items is undefined
      return console.warn "Improper use of addToScene."
    for x in items
      @scene.add x


  update: () ->
    @camera.lookAt(@scene.position)
    @controller.orbit.update()
    #pointer.world.skybox.mesh.position.y += 0

  draw: () ->

    # Any change of data is checked first via update
    @update()
    # access via the global variable 'engine' because it goes through Engine.loop(),
    # which changes *this* to the Window object,and is a better alternative
    # than daisy-chaining through function parameters
    @renderer.render(@scene, @camera)
    return

  ###
  @method Engine.loop
  @paremtype function instance
  @param The name of the function that is looped
  ###
  loop: (function_to_be_looped) ->

    start = window.mozAnimationStartTime or Date.now()

    step = (timestamp) ->
      progress = timestamp - start
      function_to_be_looped()
      if (progress < 2000)
        requestAnimationFrame(step)
    requestAnimationFrame(step)



  destructObjects: (object) ->
    switch true
      when object instanceof THREE.Object3D
        @destructObjects(child) for child in object.children
        object.parent?.remove(object)
        object.deallocate()
        object.geometry?.deallocate()
        @renderer.deallocateObject(object)
        object.destruct?(this)

      when object instanceof THREE.Material
        object.deallocate()
        @renderer.deallocateMaterial(object)

      when object instanceof THREE.Texture
        object.deallocate()
        @renderer.deallocateTexture(object)

      when object instanceof THREE.EffectComposer
        @destructObjects(object.copyPass.material)
        object.passes.forEach (pass) =>
          @destructObjects(pass.material) if pass.material
          @renderer.deallocateRenderTarget(pass.renderTarget) if pass.renderTarget
          @renderer.deallocateRenderTarget(pass.renderTarget1) if pass.renderTarget1
          @renderer.deallocateRenderTarget(pass.renderTarget2) if pass.renderTarget2


