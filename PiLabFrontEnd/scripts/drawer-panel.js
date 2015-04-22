'use strict';

document.addEventListener('template-bound', function() {
  var navicon = document.getElementById('navIcon');
  var drawerPanel = document.getElementById('drawerPanel');
  navicon.addEventListener('click', function() {
    drawerPanel.togglePanel();
  });
});