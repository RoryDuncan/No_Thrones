###

@_______________________No_Thrones_________________________@
@__________________________by______________________________@
@_______________________Rory_Duncan________________________@
@             http://www.github.com/RoryDuncan             @

###

###
@class Cube
@level atomic, graphical
@params [Object] geometry, [Object] material, [Object] position
###

class Cube

  constructor: (geometry, material, position) ->

    @geometry = new THREE.CubeGeometry(geometry.width, geometry.height, geometry.depth)
    @material = new THREE.MeshLambertMaterial(material)
    @mesh = new THREE.Mesh( @geometry, @material )
    @mesh.position = position || new THREE.Vector3( 0, 0, 0 )
    _.bindAll @, "addToScene", "setPosition"
  from: {}
  addToScene: ->
    pointer.scene.add(@mesh)

  setPosition: (x,y,z) ->
    
    @mesh.position.set(x,y,z)



###
@class Entity
@level atomic, graphical
@ConstructorParams name, path
###

class Entity

    constructor: (name, path) ->

      _.bindAll(@, "addToScene", "adjust", "loaded")

      entity = @
      @name = name || ""

      source = path
      texture = new THREE.TextureLoader
      texture.load source
      texture.addEventListener "load", @loaded

    addToScene: ->

      console.log "Adding ", @
      @adjust()
      pointer.scene.add @sprite
      console.log "Entity \"" + @name + "\" added to scene"

    adjust: ->
      
      console.log "adjusting:", @sprite

      @sprite.scale.x  = @sprite.scale.z  = @sprite.scale.y = 1 * 50 #@texture.image.height
      @sprite.position.set( 0, 20, 0 )
      #@sprite.position.normalize()
      

    loaded: (e) ->

      #console.log "this:", @, e
      
      # get the texture that was loaded
      # from TextureLoader()'s event
      @texture = e.content

      h = @texture.image.naturalHeight
      w = @texture.image.naturalWidth

      # build a cube 
      material = new THREE.SpriteMaterial({map: @texture, useScreenCoordinates: false, color: 0xffffff, fog: true })

      @material = material
      ###

      @geometry = new THREE.PlaneGeometry(w, h)

      @sprite = new THREE.Mesh @geometry, @material
      @sprite.doubleSided = true
      ###

      @sprite = new THREE.Sprite( @material )
      #sprite.position.multiplyScalar( radius )
      # then, add to the scene list
      @addToScene()