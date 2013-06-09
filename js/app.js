
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//
//    This is a non-game related page. app.js will keep track of UI events of the web page itself.
//
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

var StartMenu;

var hideOtherContent = function() {
  if (system.Modules.StartMenu !== undefined ) system.Modules.StartMenu.close();
  $('.game').hide();
  $('.about').hide();
  $('.settings').hide();
  return true;
}

$(document).ready(function() {

  $('#loading').hide();
  $('.main').fadeIn();

  StartMenu = new Module(system.Modules, "StartMenu", "Main Menu", system.menu.template, {css:{"width": "500px"}, position: {my:"center center", at:"left+30% top+50%", of:".game" }, immortal: true} ); /*** MODULE ***/
  system.game.states.menu();

  //add visual element to selected navigation
  $('nav ul a').click( (function(e) {
    $('.selected').removeClass('selected');
    $(e.target).addClass('selected');
  }));

  $('#play').click( (function(){

    hideOtherContent();

    $('div.start').css({});
    $('div.game').fadeIn();

    var moduleSize = ~~($('.game')[0].clientWidth );
    if (StartMenu === undefined || StartMenu === null) {
      StartMenu = new Module(system.Modules, "StartMenu", "Main Menu", system.menu.template, {css: {"width": "500px"}, position: {my:"center center", at:"left+25% top+50%", of:".game" }, immortal: true} ); /*** MODULE ***/
    }
    else StartMenu.show();
    // event listeners.
    system.game.states.menu();

  }));

  $('#settings').click( (function() {
    hideOtherContent();
    $('div.settings').fadeIn();
  }));

  $('#about').click( (function(){
    hideOtherContent();
    $('div.about').fadeIn();
  }));





});