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
    console.log @
  data: []
  actors: []

  mergeActors: ->
    console.log "Merging " + @size + " actors."

  makeFlat: (length, width, floorHeight) ->
    if length is undefined or null
      return console.error "Size parameter required."
    if width is undefined # assume that it is square
      width = length
    if floorHeight is undefined
      floorHeight = 1

    total = (length*width) - 1 # adjust for zero-indexing

    @settings =
      rows: width
      cols: length
      stacks: floorHeight

    #__ resets __#
    @data = []
    @size = 0
    x = 0
    y = 0
    z = 0 
    for eachSquare in [0..total]
      # increment for every complete row
      z += 1 if x is width
      # after the y increment, reset x to start to the first in the row
      x = 0 if x is width
      
      @data.push
        'id': eachSquare
        'x' : x
        'y' : floorHeight
        'z' : z
      x++
      @size++



  makeFromHeightMap: (heightMap, length, width) ->
    if heightMap or length or width is undefined
      return console.error "Missing parameter of Stage.makeFromHeightMap. 3 Parameters required."
    total = heightMap.length
    @settings =
      rows: width
      cols: length
      stacks: peak

    #__ resets __#
    @data = []
    @size = 0
    x = 0
    y = 0
    z = 0

    for eachSquare in [0..total]


      z += 1 if x is width # increment for every complete row
      x = 0 if x is width # after the y increment, reset x to start to the first in the row
      
      @data.push
        'id': eachSquare
        'x' : x
        'y' : 1 + ~~( Math.random()*10 )
        'z' : z
      x++
      @size++




  makeRandomData: ( length, width, peak, noise) ->

    return console.error "Arguments not specified. Stage.makeRandomData(h,w,maxZ) arguments needed." if length is undefined
    return console.error "Arguments not specified. Stage.makeRandomData(h,w,maxZ) arguments needed." if width is undefined
    console.warn "maximum Z value not specified, defaulting to 15" if peak is undefined
    peak = 15 if peak is undefined

    @settings =
      rows: width
      cols: length
      stacks: peak

    #__ resets __#
    @data = []
    @size = 0
    x = 0
    y = 0
    z = 0 

    noise = noise or peak

    console.groupCollapsed "Creating Data"

    # total = the amount of times everything needs iterating, -1 because of 0-index
    total = (length*width) - 1

    for eachSquare in [0..total]


      z += 1 if x is width # increment for every complete row
      x = 0 if x is width # after the y increment, reset x to start to the first in the row
      
      @data.push
        'id': eachSquare
        'x' : x
        'y' : 1 + ~~( Math.random()*10 )
        'z' : z
      x++
      @size++

    console.log @data
    console.groupEnd "Creating Data"
    return @

  clear: ->
    @data = []
    return @

  ###
  @method Stage.build
  ###
  build: (cubeGeometry, cubeMaterial, origin) ->

    baseHeight = cubeGeometry.height
    #console.clear()
    # Params are passed through from Stage.build()
    return console.error "I can't build without any lumber. (psst, data is missing)" if @data.length is 0

    margin = 0.001

    # origin is the relative position that 
    # the stage starts building itself from.
    origin = new THREE.Vector3( 0, 0, 0 ) if origin is undefined

    
    console.groupCollapsed "Building..."
    for datum in @data

      cubeGeometry.height = (baseHeight-1) *  datum.y
      # position based on it's position on the "grid".
      position = new THREE.Vector3 datum.x*( cubeGeometry.width )+( datum.x*margin ), (cubeGeometry.height/2), datum.z*( cubeGeometry.depth )+( datum.z*margin )

      # add the blocks
      actor = new Cube( cubeGeometry, cubeMaterial, position)
      
      # keep the data in the new object
      # for later references.
      actor.from = datum

      @actors.push actor
    
    console.log @actors

    console.groupEnd "Building..."
    return @

  addToScene: ->
    return console.error "Not enough actors." if @actors.length is 0
    for eachActor in @actors

        eachActor.addToScene()



  get: (values) ->
    return console.error "No arguments given. to Stage.get()" if values is undefined or values is null
    results = []
    results = _.where @data, values
    if results.length is 0
      return false
    else 
      return results    


      
