/*global define */
define(['config', 'strings', 'device-list-controller', 'gcm-controller', 'android-browser-model'], function (config, strings, deviceListController, gcmController, androidBrowserModel) {
    'use strict';

    var LOADING = 0;
    var DEVICE_LIST = 1;

    var exports = {};

    var currentState;
    var mainContentElement = document.getElementById('main-content');
    var devices = [];
    var idToken;

    function clearUpCurrentStateUI() {
        var childNode = mainContentElement.firstChild;

        while(childNode) {
            mainContentElement.removeChild(childNode);
            childNode = mainContentElement.firstChild;
        }

        var currentClassName = getStateClass(currentState);
        if(currentClassName != null) {
            mainContentElement.classList.remove(currentClassName);
        }
    }

    function getStateClass(state) {
        switch(state) {
            case LOADING:
                return 'loading';
            case DEVICE_LIST:
                return 'device-list';
            default:
                return null;
        }
    }

    function getTitleElement(title, state) {
        var headerSection = document.createElement('header');
        var titleElement = document.createElement('h1');
        titleElement.innerHTML = title;
        headerSection.appendChild(titleElement);

        if(state === DEVICE_LIST && devices.length > 0) {
            var div = document.createElement('div');
            div.classList.add('search-container');

            var input = document.createElement('input');
            input.id = 'url-input';
            input.type = 'url';
            input.size = 35;
            input.onkeyup = function(e) {
                if(Modernizr && Modernizr.localstorage) {
                    localStorage.setItem("url-input-field", input.value);
                }
            };

            if(Modernizr && Modernizr.localstorage) {
                input.value = localStorage.getItem("url-input-field");
            }

            var launchButton = document.createElement('a');
            launchButton.appendChild(document.createTextNode(strings.launch_btn));
            launchButton.onclick = function(e) {
                e.preventDefault();
                var inputField = document.getElementById('url-input');
                if(typeof inputField === 'undefined') {
                    return;
                }

                var url = inputField.value;
                if(url === null || url.length === 0) {
                    // TODO Show error
                    return;
                }

                var browserOptions = [{
                    platform: 0,
                    pkg: androidBrowserModel.getSupportedBrowsers()[androidBrowserModel.getSelectedBrowser()].pkg
                }];

                gcmController.sendUrlPushMessage(idToken, url, devices, browserOptions);
            }

            div.appendChild(input);
            div.appendChild(launchButton);
            headerSection.appendChild(div);
        }

        return headerSection;
    }

    function createBrowserOptions() {
        var sectionElement = document.createElement('section');
        sectionElement.classList.add('device-heading');

        var titleElement = document.createElement('h1');
        titleElement.appendChild(document.createTextNode('Android'));
        sectionElement.appendChild(titleElement);

        var ulElement = document.createElement('ul');
        ulElement.classList.add('browser-options');
        
        var androidBrowsers = androidBrowserModel.getSupportedBrowsers();
        var selectedBrowser = androidBrowserModel.getSelectedBrowser();

        for(var i = 0; i < androidBrowsers.length; i++) {
            var liElement = document.createElement('li');
            
            var icon = document.createElement('img');
            icon.src = androidBrowsers[i].icon;
            
            var name = document.createElement('p');
            name.appendChild(document.createTextNode(androidBrowsers[i].name));

            liElement.appendChild(icon);
            liElement.appendChild(name);

            if(i === selectedBrowser) {
                liElement.classList.add('selected-browser');
            } else {
                liElement.onclick = onBrowserClickHandler(i);
            }

            ulElement.appendChild(liElement);
        }

        sectionElement.appendChild(ulElement);

        return sectionElement;
    }

    function onBrowserClickHandler(index) {
        return function(e){
            var browserOptions = document.getElementsByClassName('browser-options');
            for (var i = 0; i < browserOptions.length; ++i) {
                var browserList = browserOptions[i]; 
                
                var selectedItems = browserList.getElementsByClassName('selected-browser'); 
                for(var j = 0; j < selectedItems.length; i++) {
                    selectedItems[j].classList.remove('selected-browser');
                }

                if(browserList.children.length > index) {
                    browserList.children[index].classList.add('selected-browser');
                }
            }

            console.log('onBrowserClickHandler: index = '+index);
            androidBrowserModel.setSelectedBrowser(index);
            //element.classList.add('selected-browser');
        };
    }

    function setUIState(newState) {
        if(currentState == newState) {
            return;
        }

        clearUpCurrentStateUI();

        var element;
        var stateClassName = getStateClass(newState);
        switch(newState) {
            case LOADING:
                mainContentElement.appendChild(getTitleElement(strings.device_list_loading_title, newState));

                element = document.createElement('div');
                element.classList.add('spinner');
                break;
            case DEVICE_LIST:
                mainContentElement.appendChild(getTitleElement(strings.device_list_title, newState));

                if(devices.length == 0) {
                    for(var i = 0; i < strings.no_device_msgs.length; i++) {
                        var pElement = document.createElement('p');
                        pElement.appendChild(document.createTextNode(strings.no_device_msgs[i]));
                        mainContentElement.appendChild(pElement);
                    }    

                    var playStoreButton = document.createElement('a');
                    playStoreButton.classList.add('play-store-button');
                    playStoreButton.appendChild(document.createTextNode(strings.play_store));
                    playStoreButton.href= "http://play.google.com/";
                    mainContentElement.appendChild(playStoreButton);

                    var appStoreButton = document.createElement('a');
                    appStoreButton.classList.add('app-store-button');
                    appStoreButton.appendChild(document.createTextNode(strings.app_store));
                    appStoreButton.href= "https://itunes.apple.com/";
                    mainContentElement.appendChild(appStoreButton);
                } else {
                    mainContentElement.appendChild(createBrowserOptions());

                    var ulElement = document.createElement('ul');
                    ulElement.classList.add('device-list');

                    for(var i = 0; i < devices.length; i++) {
                        var liElement = document.createElement('li');
                        liElement.appendChild(document.createTextNode(devices[i].name));
                        ulElement.appendChild(liElement);
                    }
                    mainContentElement.appendChild(ulElement);    
                }
                               
                break;
        }

        if(stateClassName != null) {
            mainContentElement.classList.add(stateClassName);
        }

        if(element) {
            mainContentElement.appendChild(element);
        }
        currentState = newState;
    }

    exports.init = function(token) {
        console.log('home-ui-controller: init() token = '+token);
        idToken = token;

        if(typeof idToken !== 'undefined') {
            setUIState(LOADING);
            deviceListController.getDevices(idToken, function(d) {
                // Success
                devices = d;
                setUIState(DEVICE_LIST);
            }, function() {
                // Error

            });
        } else {
            require(['login-ui-controller'], function(loginController){
                console.log('home-ui-controller: loginController.init()');
                loginController.init();
            });
        }
    }

    return exports;
});