
var hideOtherContent = function() {
  $('.game').hide();
  $('.about').hide();
  $('.settings').hide();
  return true;
}

$(document).ready(function() {

  $('#loading').hide();
  $('.main').fadeIn();

  //add visual element to selected navigation
  $('nav ul a').click( (function(e) {
    $('.selected').removeClass('selected');
    $(e.target).addClass('selected');
  }));

  $('#play').click( (function(){
    hideOtherContent();
    $('div.start').css({});
    $('div.game').fadeIn();

    var StartMenu = new Module(system.Modules, "gameMenu", "Main Menu", system.menu.template, {css:{"width": "500px"}, position: {my:"center center", at:"left+25% top+50%", of:"#screen" }} ); /*** MODULE ***/
    system.game.states.menu();

  }));

  $('#settings').click( (function(){
    hideOtherContent();
    $('div.settings').fadeIn();
  }));

  $('#about').click( (function(){
    hideOtherContent();
    $('div.about').fadeIn();
  }));





});