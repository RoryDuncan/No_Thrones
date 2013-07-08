
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//
//    This is a non-game related file. system.js will keep track of the interface, as well as initiate the game engine, and track modules.
//    If this contains game code other than initializers and user interface, im doing it wrong.
//
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

Module = function(group, name, title, content, data) {

  //errors and catching
  if (!group) return console.error("Module called without a group. A group is vital for managing modules.");
  if (!name) return console.error("Module called without a name. Names are vital for managing modules.");
  if (group[name] !== undefined) {
    console.error("Caught attempt to add module \"" + name + "\" to a group that already has a module with that name.");
    console.warn("There can only be one module with a specific name per group.");
    return;
    }

  this.name = name;

  //function to inject the module into the dom and display it.
  this.create = function(_name, _title, _content, _data) {

    var className = "div#" + _name + ".module"; // selector

    // create() controls the "view" of the module
    // this long line cold probably be resolved with a templating lib
    $('<div class="module" id="'+_name + '"><div class="modTitle" >'+_title+'<div class="modOptions" id="'+_name+'"><img class="min" src="img/module_close.png" height="5px" width="16px" alt="minimize" longdesc="Minimize this window." title="Minimize" /><img class="close" src="img/module_close.png" alt="close" longdesc="Close this window." title="Close" /></div></div><div class="modText">'+ _content + '</div></div>').appendTo('body')[0];
    
    // Draggable Option
    if (_data.fixed !== true) $('.module').draggable();
    if (_data.position !== undefined) {
      $(className).position(_data.position);
    }
    // Custom CSS
    if (_data.css !== undefined) {
      $(className).css(_data.css);
    }

    return;
  };
  this.move = function(x, y) {

  };
  this.hide = function() {

    // hide() will only hide it from the DOM, making it unaccessable unless using "ModuleName".show()

     var className = "div#" + name + ".module";
     $(className).hide();
  };
  this.show = function() {
    // undoes hide()
     var className = "div#" + name + ".module";
     $(className).fadeIn();
  };
  this.close = function() {

    // close() is a permenant close, as in the variable will be set up to be garbage collected.
    // 
    // Check to see if it's a module that WE want closing. If it's not, just hide it.
    //    Having this check removes a layer of difference we would need between
    //    modules that are temporary and modules that aren't.

    if (system.Modules[name].data.immortal === true) {

      system.Modules[name].hide() // the user won't know the difference. HE HE HE
    }
    else {
      //  first, remove from DOM
      var className = "div#" + name + ".module";
      $(className).remove();
      delete group[name]; //remove from list of modules

      delete name;        //remove reference
      return console.log(name + " deleted.");
    }
  };
  
  this.minimize = function() {

    // minimize / maximize of module. Bound to double clicking of title bar.

    var className = "div#" + name + ".module";
    if ($(className).css("height") !== "21px") {
      $(className).css({"min-height":"18px", "height": "21px", "width": "300px", "overflow":"hidden"});
    }
    else {
      console.log()
      $(className).css({"min-height":"150px", "height": "auto", "width": system.Modules[name].data.css.width, "overflow-y":"auto"});
    }
    return;
  };

  // Content is the information to be displayed in the body of the module. 
  // HTML is able to be injected as well, though css should be assigned to the new html.
  this.content = content || console.warn("No Content was specified for " + name + ". You are creating a module with an empty body.");

  // The title is the text shown at the top of the window
  this.title = title || "Information";

  // Data deals with the 'settings' of the module like position, fixed, CSS, etc.
  this.data = data || { css: {}, fixed: false, immortal: false };

  // Make it happen on the webpage, then add to list of modules
  this.create(this.name, this.title, this.content, this.data);
  group[name] = this;

  //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//
  //              EVENTS                     //
  //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//

  $('div#'+name+'.module .modTitle').dblclick( this.minimize);
  $('div#'+name+'.module .modTitle .modOptions img.min').click(this.minimize)
  $('div#'+name+'.module .modTitle .modOptions img.close').click( this.close);

};


//
//
//

var System = function() {

  // Settings, that can be set by the user in the settings page.

  this.settings = {
    defaults: { width: "600", height: "600", fullscreen: false},
    width: "600",
    height: "600",
    fullscreen: false
  }


  // incase nested or anonymous functions
  // need the instance dynamically.
  this.point = this; 

  // May be removed if Engine 'handles' it

  this.update = function() {};
  this.menu = {};
  this.menu.data = {
    item1: "Start",
    item2: "Load",
    item3: "Settings",
    item4: "Exit"
    };
  this.menu.play = function(e){

    console.log("Starting Game");
    system.Modules.StartMenu.close();
    system.game.states.initialize();
    $('html, body').animate({scrollTop: $('div.game').offset().top + 'px'}, 'fast');

    
  };
  this.menu.load = function(e){
    console.log("Saving and loading not implemented yet.");
  };
  this.menu.settings = function(e){
    console.log("No settings added yet.");
  };
  this.menu.exit = function(e){
    console.warn("Exiting won't be implemented until release, so not to annoy the developer when he misclicks.")
    /*
    window.open('', '_self', ''); 
    window.close(); 
    */
  };
    // template for the "start game" menu
  this.menu.template =
    "<ul class='gameMenu'><a href='#' id='menu_"
     + this.menu.data.item1
     + "'><li>"
     + this.menu.data.item1
     + "</li></a><a href='#' id='menu_"
     + this.menu.data.item2
     + "'><li>"
     + this.menu.data.item2
     + "</li></a><a href='#' id='menu_"
     + this.menu.data.item3
     + "'><li>"
     + this.menu.data.item3
     + "</li></a><a href='#' id='menu_"
     + this.menu.data.item4
     + "'><li>"
     + this.menu.data.item4
     + "</li></a></ul>";

  this.game = {};
  this.game.state = 0;
  this.game.states = {};

  this.game.states.menu = function(){

    // then watch for the items to be clicked
    $('a#menu_' + system.menu.data.item1).click(system.menu.play);    //play
    $('a#menu_' + system.menu.data.item2).click(system.menu.load);    //load
    $('a#menu_' + system.menu.data.item3).click(system.menu.settings);//settings
    $('a#menu_' + system.menu.data.item4).click(system.menu.exit);    //exit

  };

  this.game.states.test = function() {

  };
  this.game.states.initialize = function() {

    // Engine should be initialized here
    var init = _.once( (function() {

      window.engine = new Engine("engine");
    }))

    init();
    

  };
  this.game.states.story = {};
  this.game.states.mapOverview = {};
  this.game.states.battle = {};
  this.game.states.edit = {};


  this.models = {};
  this.settings = {};
  this.Modules = {};

console.log("System initialized.")
};


var system = new System();


