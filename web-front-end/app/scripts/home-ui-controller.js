/**
Copyright 2013 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/
define(['config', /**'device-list-controller', 'gcm-controller', 'android-browser-model'**/], function (config) {
    'use strict';

    var LOADING = 0;
    var DEVICE_LIST = 1;

    var exports = {};

    var currentState;
    //var mainContentElement = document.getElementById('main-content');
    var devices = [];
    var idToken;
    var isAutoSignIn = false;

    /**function clearUpCurrentStateUI() {
        var childNode = mainContentElement.firstChild;

        while(childNode) {
            mainContentElement.removeChild(childNode);
            childNode = mainContentElement.firstChild;
        }

        var currentClassName = getStateClass(currentState);
        if(currentClassName != null) {
            mainContentElement.classList.remove(currentClassName);
        }
    }**/

    function getStateClass(state) {
        switch(state) {
            case LOADING:
                return 'loading';
            case DEVICE_LIST:
                return 'device-lab-home';
            default:
                return null;
        }
    }

    /**function getTitleElement(title, state) {
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
                    localStorage.setItem('url-input-field', input.value);
                }
            };

            if(Modernizr && Modernizr.localstorage) {
                input.value = localStorage.getItem('url-input-field');
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
            };

            div.appendChild(input);
            div.appendChild(launchButton);
            headerSection.appendChild(div);
        }

        return headerSection;
    }**/

    /**function createBrowserOptions() {
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
            }

            liElement.onclick = onBrowserClickHandler(i);

            ulElement.appendChild(liElement);
        }

        sectionElement.appendChild(ulElement);

        return sectionElement;
    }**/

    /**function onBrowserClickHandler(index) {
        return function(){
            var browserList = document.querySelector('.browser-options');
            var selectedItems = browserList.querySelectorAll('.selected-browser');
            for(var i = 0; i < selectedItems.length; i++) {
                selectedItems[i].classList.remove('selected-browser');
            }

            browserList.children[index].classList.add('selected-browser');

            androidBrowserModel.setSelectedBrowser(index);
        };
    }*/

    function setUIState(newState) {
        if(currentState === newState) {
            return;
        }

        //clearUpCurrentStateUI();

        var loading = document.querySelector('.loading');
        var emptyLabScreen = document.querySelector('.empty-lab');

        var element;
        var stateClassName = getStateClass(newState);
        switch(newState) {
            case LOADING:
                loading.style.visibility = 'visible';
                emptyLabScreen.style.visibility = 'hidden';
                break;
            case DEVICE_LIST:
                //mainContentElement.appendChild(getTitleElement(strings.device_list_title, newState));
                loading.style.visibility = 'hidden';
                if(devices.length === 0) {
                    /**for(var i = 0; i < strings.no_device_msgs.length; i++) {
                        var pElement = document.createElement('p');
                        pElement.appendChild(document.createTextNode(strings.no_device_msgs[i]));
                        mainContentElement.appendChild(pElement);
                    }    

                    var playStoreButton = document.createElement('a');
                    playStoreButton.classList.add('play-store-button');
                    playStoreButton.appendChild(document.createTextNode(strings.play_store));
                    playStoreButton.href= "http://play.google.com/";
                    mainContentElement.appendChild(playStoreButton);**/
                    emptyLabScreen.style.visibility = 'visible';
                    
                } else {
                    /**mainContentElement.appendChild(createBrowserOptions());

                    var ulElement = document.createElement('ul');
                    ulElement.classList.add('device-list');

                    for(var i = 0; i < devices.length; i++) {
                        var liElement = document.createElement('li');
                        liElement.appendChild(document.createTextNode(devices[i].name));
                        ulElement.appendChild(liElement);
                    }
                    mainContentElement.appendChild(ulElement);**/
                }
                               
                break;
        }

        if(stateClassName !== null) {
            //mainContentElement.classList.add(stateClassName);
        }

        if(element) {
            //mainContentElement.appendChild(element);
        }
        currentState = newState;
    }

    exports.init = function(token, autoSignIn) {
        console.log('home-ui-controller: init() token = '+token);
        idToken = token;
        isAutoSignIn = autoSignIn;

        if(typeof idToken !== 'undefined') {
            setUIState(LOADING);
            /**deviceListController.getDevices(idToken, function(d) {
                // Success
                devices = d;
                setUIState(DEVICE_LIST);
            }, function() {
                // Error

            });**/
            setUIState(DEVICE_LIST);
        } else {
            require(['login-ui-controller'], function(loginController){
                console.log('home-ui-controller: loginController.init()');
                loginController.init();
            });
        }
    };

    return exports;
});