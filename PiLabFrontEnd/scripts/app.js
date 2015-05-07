'use strict';

var template = document.querySelector('#tmpl');
template.appbarTitle = 'PiLab';
template.selected = 'section-controls';
template.isLooping = false;
template.enableSender = false;
template.invalidURL = false;
template.stateInitialised = false;

var firebase = new Firebase(window.PiLab.config.firebaseUrl);
firebase.authWithCustomToken(window.PiLab.config.firebaseKey, function(error) {
  if (error) {
    throw new Error('Unable to auth with Firebase', error);
  }

  firebase.child('loop/urls').on('value', function(snapshot) {
    var loopUrls = snapshot.val();
    if (!loopUrls || loopUrls.constructor !== Array) {
      loopUrls = [];
    }
    console.log('loopUrls = ', loopUrls);
    var template = document.querySelector('#tmpl');
    template.loopUrls = loopUrls;
  });

  firebase.child('config/useMode').on('value', function(snapshot) {
    var mode = snapshot.val();

    var urlTextfield = document.querySelector('.js-sendurltextfield');
    urlTextfield.disabled = mode !== 'static';

    template.isLooping = mode === 'loop';
    template.stateInitialised = true;
  }.bind(this));
});

template.toggleLoop = function(event) {
  var mode = event.target.checked ? 'loop' : 'static';

  firebase.child('config/useMode').set(mode);
};

template.onSendUrl = function(event) {
  var toast = document.querySelector('.js-toast');
  if (template.isLooping) {
    toast.text = 'Can\'t send a URL while the device lab is looping';
    toast.show();
    return;
  }
  var urlTextfield = document.querySelector('.js-sendurltextfield');

  firebase.child('currenturl').set({url: urlTextfield.value});

  toast.text = urlTextfield.value + ' sent.';
  toast.show();

  urlTextfield.value = '';
};

template.urlTextFieldChange = function(event) {
  var urlTextfield = document.querySelector('.js-sendurltextfield');
  if (urlTextfield.value === '') {
    this.enableSender = false;
    this.invalidURL = false;
  } else if (urlTextfield.validity.valid === true) {
    this.enableSender = true;
    this.invalidURL = false;
  } else {
    this.enableSender = false;
    this.invalidURL = true;
  }
};

template.addLoopUrlTextFieldChange = function(event) {
  var urlTextfield = document.querySelector('.js-addurltolooptextfield');
  if (urlTextfield.value === '') {
    this.enableSender = false;
    this.invalidURL = false;
  } else if (urlTextfield.validity.valid === true) {
    this.enableSender = true;
    this.invalidURL = false;
  } else {
    this.enableSender = false;
    this.invalidURL = true;
  }
};

template.onAddLoopUrl = function(event) {
  var template = document.querySelector('#tmpl');
  var loopUrls = template.loopUrls;
  var urlTextfield = document.querySelector('.js-addurltolooptextfield');
  loopUrls.push(urlTextfield.value);
  firebase.child('loop/urls/').set(loopUrls);
  urlTextfield.value = '';
};

template.onDeleteUrl = function(event) {
  console.log(event.target.dataset.url);
  console.log(event.target.dataset.index);
  var template = document.querySelector('#tmpl');
  var loopUrls = template.loopUrls;
  loopUrls.splice(event.target.dataset.index, 1);
  firebase.child('loop/urls/').set(loopUrls);
};

template.onPageSelectionChange = function(event) {
  console.log('On Page Selection Change', event);
  if (template.stateInitialised === false) {
    return;
  }
  if (event.detail.isSelected === false) {
    return;
  }

  var corePages = document.querySelector('.js-core-pages');
  var mode = template.isLooping ? 'loop' : 'static';
  if (corePages.selected === 'section-labsetup') {
    firebase.child('config/globalMode').set('config');
  } else {
    firebase.child('config/globalMode').set('use');
  }
};

template.onResetDisplaysClick = function(event) {
  firebase.child('device-display-types').remove();
};
