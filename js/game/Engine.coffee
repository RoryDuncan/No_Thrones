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
    # ENGINE is the pointer.




    VIEW_ANGLE = 50
    WIDTH = 1000
    HEIGHT = 600
    NEAR = 0.1
    FAR = 1000
    CAMERA_START = 100

    @name = name
    @scene = new THREE.Scene()
    @camera = new THREE.PerspectiveCamera( VIEW_ANGLE, WIDTH / HEIGHT, NEAR, FAR)
    @renderer = renderer = new THREE.WebGLRenderer()
    @renderer.setSize(WIDTH, HEIGHT )

    # inject the canvas
    if ( !($('canvas')[0]) )
      $('.game').append( renderer.domElement )
      $('canvas').attr({'id':"screen"})

    @camera.position.z = CAMERA_START
    @camera.position.y = 50
    @camera.rotation.x = - 0.33

    _.bindAll @, "addToScene", "update", "draw", "makeSkybox", "ignition", "test", "toggleShadows" ##

  makeSkybox: (fogColor) ->

    color = fogColor or 0x80b4e5

    @renderer.setClearColor(color, 1)
    @renderer.clear()

    fog = new THREE.Fog( color, 50, 300 )
    @scene.fog = fog

    @test()
  animations:

    bounce: ( value ) ->




      


  test: ->

    @world.skybox = new Cube 10,10,10, 0x73432c
    @addToScene [@world.skybox.mesh]
    console.log @world.skybox

    # light
    # only spot lights enable shadows
    @spotLight = new THREE.SpotLight( 0xfffff0 )
    @spotLight.position.set( 0, 1000, 800 )

    # shadow config
    @spotLight.shadowMapWidth = 1024
    @spotLight.shadowMapHeight = 1024
    @spotLight.shadowCameraNear = 500
    @spotLight.shadowCameraFar = 4000
    @spotLight.shadowCameraFov = 30

    #@scene.add( @spotLight )

    # plane
    @planeGeo = new THREE.PlaneGeometry(400, 400, 10, 10)
    @planeMat = new THREE.MeshLambertMaterial({color: 0x5b9cd8})
    @plane = new THREE.Mesh( @planeGeo, @planeMat)
    @plane.rotation.x = - Math.PI/2
    @plane.position.y = - 10
    @plane.receiveShadow = true

    #@scene.add @plane

    @addToScene([@plane, @spotLight])

    @ignition()
  toggleShadows: ->

      # toggle shadows - in general
      @renderer.shadowMapEnabled = true if @renderer.shadowMapEnabled is false

      # enable shadows for a light
      @spotLight.castShadow = true if @spotLight.castShadow is false

      # enable shadows for an object
      @world.skybox.castShadow = true if @world.skybox.castShadow is false
      @world.skybox.receiveShadow = true if @world.skybox.receiveShadow is false

  ignition: ->
    #ignition is used to start looping the engine's drawing process
    ENGINE = @
    ENGINE.loop( ENGINE.draw )

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
    console.log THREE.clock

    @world.skybox.mesh.position.y = ~~Math.random(0,100)

  draw: () ->

    # Any change of data is checked first via update
    @update()
    # access via the global variable 'engine' because it goes through Engine.loop(),
    # which changes *this* to the Window object,and is a better alternative
    # than daisy-chaining through function parameters

    @renderer.render(@scene, @camera)

  ###
  @method Engine.loop
  @paremtype function instance
  @param The name of the function that is looped
  ###
  loop: (function_to_be_looped) ->

    requestAnimationFrame = window.requestAnimationFrame or window.mozRequestAnimationFrame or window.webkitRequestAnimationFrame or window.msRequestAnimationFrame
    window.requestAnimationFrame = requestAnimationFrame

    start = window.mozAnimationStartTime or Date.now()

    step = (timestamp) ->
      progress = timestamp - start
      function_to_be_looped()
      if (progress < 2000)
        requestAnimationFrame(step)
    requestAnimationFrame(step)

  entities: {}
  world:
    blocks: [] # list for the environment
    skybox: {}

###
@class Cube
@methods constructor
@params length, width, depth, color
###

class Cube

  constructor: (l, w, d, colorInHex) ->
    @geometry = new THREE.CubeGeometry(l,w,d)
    @material = new THREE.MeshLambertMaterial( { color: colorInHex } )
    @mesh = new THREE.Mesh( @geometry, @material )
