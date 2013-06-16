###

@_______________________No_Thrones_________________________@
@___________________________by_____________________________@
@_______________________Rory_Duncan________________________@
@             http://www.github.com/RoryDuncan             @
###

###
@class stage
@level 
@methods constructor
@params length, width, depth, color

###

class Stage
  constructor: (name) ->
    @name = name
    @title = "World " + name
    @blocks = 0
    console.log @
  data: []
  actors: []
  ###
  @method Stage.makeRandomData
  ###
  makeRandomData: ( height, width, maxZ) ->

    return console.error "Arguments not specified. Stage.makeRandomData(h,w,maxZ) arguments needed." if height is undefined
    return console.error "Arguments not specified. Stage.makeRandomData(h,w,maxZ) arguments needed." if width is undefined
    console.warn "maximum Z value not specified, defaulting to 15" if maxZ is undefined
    maxZ = 15 if maxZ is undefined

    @settings =
      rows: width
      cols: height
      stacks: maxZ
    #__ resets __#
    @data = []
    @size = 0
    x = 0
    y = 0
    z = 0 
    console.groupCollapsed "Creating Data"

    # first make a heightMap
    # which is an array with the heights of each x,y coordinate
    # Example:
    # [ 1, 1, 2] <- coordinates 0,0 and 1,0 are 1 layer high,
    #               while coordinate 2,0 is 2 layers high

    # total = the amount of times everything needs iterating, -1 because of 0-index
    total = (height*width) - 1
    @heightMap = []
    for hmap in [0..total]
      @heightMap.push 1 + ~~(Math.random()*3)

    console.log @heightMap
    
    #another for loop is needed.
    for layer in [1..maxZ]
      x = 0
      z = 0
      for height in @heightMap


        z += 1 if x is width # increment for every complete row
        x = 0 if x is width # after the y increment, reset x to start to the first in the row
       

        id = ++@size
        visible = true
        visible = false if layer > height

        @data.push
          'id': id
          'x' : x
          'y' : layer
          'z' : z
          'heightMap': height
          'visible' : visible
        x++

    console.log @data
    console.groupEnd "Creating Data"
    return "done"

  clear: ->
    @data = []

  ###
  @method Stage.build
  ###
  build: (cubeGeometry, cubeMaterial, origin) ->
    #console.clear()
    # Params are passed through from Stage.build()
    return console.error "I can't build without any lumber. (psst, data is missing)" if @data.length is 0
    # origin is the relative position that 
    # the stage starts building itself from.
    origin = new THREE.Vector3( 0, 0, 0 ) if origin is undefined

    console.groupCollapsed "Building..."
    for datum in @data
      position = new THREE.Vector3( datum.x*cubeGeometry.width, datum.y*cubeGeometry.height, datum.z*cubeGeometry.depth )
      actor = new Cube(cubeGeometry, cubeMaterial, position) if datum.visible is true
      actor = new Cube(cubeGeometry, {wireframe:true}, position) if datum.visible is false
      

      actor.from = datum
      @actors.push actor
    
    console.log @actors

    console.groupEnd "Building..."
  addToScene: ->
    return console.error "Not enough actors." if @actors.length is 0
    for eachActor in @actors
      # eachActor.addToScene()
      if eachActor.from.visible is true
        eachActor.addToScene()
      else continue

  toObject: ->
    _.object @data
    console.log @data
  ###
  @method Stage.get
  @description Returns the
  @paremtype object
  @param values

  ###

  get: (values) ->
    return console.error "No arguments given. to Stage.get()" if values is undefined or values is null
    results = []
    results = _.where @data, values
    if results.length is 0
      return false
    else 
      return results    


      
