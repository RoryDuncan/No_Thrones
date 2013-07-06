###
@class Engine
@description
@methods constructor, makeSkybox, test, toggleShadows,
@params length, width, depth, color
###

class Engine

  constructor: (name) ->

    console.clear()

    # engine is the instance,
    # Engine is the Class,
    #     and
    # pointer is the pointer.
    window.pointer = @

    VIEW_ANGLE = 35
    WIDTH = window.innerWidth
    HEIGHT = window.innerHeight
    NEAR = 0.1
    FAR = 5000
    CAMERA_START = 600

    ###
      @Data until created elsewhere
    ###

    @settings =
      statics:
        viewAngle: VIEW_ANGLE
        width: WIDTH
        height: HEIGHT
        near: NEAR
        far: FAR
      world:
        grid:
          color: 0xFFFF55
          margin: 1
        block:
          width: 25
          depth: 25
          height: 5
          color: 0xffffff



    @name = name
    @scene = new THREE.Scene()
    @camera = new THREE.PerspectiveCamera( VIEW_ANGLE, WIDTH / HEIGHT, NEAR, FAR)
    @clock = new THREE.Clock( true )
    @clock.start()
    console.log @camera
    @renderer = renderer = new THREE.WebGLRenderer({ antialaising: true })
    @renderer.setSize(WIDTH, HEIGHT )

    # inject the canvas
    if ( !($('canvas')[0]) )
      $('.game').append( @renderer.domElement )
      $('canvas').attr({'id':"screen"})

      $('canvas').css {"width": (WIDTH) + "px", "height": (HEIGHT) + "px"}

    @camera.position.z = CAMERA_START
    @camera.position.y = 200
    @camera.position.x = 300
    #@camera.rotation.x = -0.45
    



    # Any method that 'this' needs to be in
    _.bindAll @, "addToScene", "update", "draw", "makeSkybox", "ignition", "test"
    return
    
  makeSkybox: ( fogColor ) ->

    color = fogColor or 0xaaaaaa

    @renderer.setClearColor(color, 1)
    @renderer.clear()

    fog = new THREE.Fog( color, 0, 2000 )
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
    @controller.orbit.userPanSpeed = 8
    ### For containing controls:
     @src https://github.com/mrdoob/three.js/blob/master/examples/js/controls/OrbitControls.js
    ###
  test: ->

    # CONTROLS
    console.group "test"

    @enableMouse()


    #@controller.moveCamera()

    @world.skybox = new Cube {width:25, depth:25, height:10,}, {color:0xffffff}
    unit = new Sprite "unit", "js/game/textures/sprites/test.gif", 36, 36

    #@addToScene [@world.skybox.mesh]
    #console.log @world.skybox

    # light
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

    # plane
    planeGeo = new THREE.PlaneGeometry(1, 1, 10, 10)
    planeMat = new THREE.MeshLambertMaterial({color: 0xe6e6e6})
    plane = new THREE.Mesh( planeGeo, planeMat)
    plane.rotation.x = -Math.PI/2
    plane.position.y = -30
    plane.receiveShadow = true

    #@scene.add @plane

    @addToScene([plane, @spotLight])
    # window for dev purposes only
    @stage = new Stage " test"
    @stage.makeRandomData(15,15,10)
    @stage.build 
      width:  @settings.world.block.width
      height: @settings.world.block.height
      depth:  @settings.world.block.depth
    ,
      color: 0x483758
      wireframe: false
      wireframeLinewidth: 5.0
          # ( dir, origin, length, hex )
    dir = new THREE.ArrowHelper( (new THREE.Vector3( 0, -2, 0 )), (new THREE.Vector3( 0, 100, 0 )), 30, 0x771111 ) 
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


