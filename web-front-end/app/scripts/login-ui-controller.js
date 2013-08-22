/*global define */
define(['config', 'strings', 'gplus-identity', 'chrome-identity'], function (config, strings, gplusIdentity, chromeIdentity) {
    'use strict';

    var LOADING = 0;
    var SIGN_IN = 1;
    var HOME = 2;

    var exports = {};

    var currentState;
    var mainContentElement = document.getElementById('main-content');
    var controller;
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
            case SIGN_IN:
                return 'sign-in';
            case LOADING:
                return 'loading';
            default:
                return null;
        }
    }

    function getTitleElement(title) {
        var headerSection = document.createElement('header');
        var titleElement = document.createElement('h1');
        titleElement.innerHTML = title;
        headerSection.appendChild(titleElement);
        return headerSection;
    }

    function setUIState(newState) {
        if(currentState == newState) {
            return;
        }

        clearUpCurrentStateUI();

        var element;
        var stateClassName = getStateClass(newState);
        switch(newState) {
            case SIGN_IN:
                mainContentElement.appendChild(getTitleElement(strings.welcome_title));

                for(var i = 0; i < strings.welcome_msgs.length; i++) {
                    var pElement = document.createElement('p');
                    pElement.appendChild(document.createTextNode(strings.welcome_msgs[i]));
                    mainContentElement.appendChild(pElement);
                }

                controller.addSignInButton(mainContentElement, function(token) {
                    idToken = token;
                    // Success - Signed In
                    console.log('login-ui-controller Signed In');
                    setUIState(HOME)
                }, function(errorMsg) {
                    // Error
                    console.log('login-ui-controller - error on signing in '+errorMsg);
                });
                break;
            case LOADING:
                element = document.createElement('div');
                element.classList.add('spinner');
                break;
            case HOME:
                if(typeof(idToken) === 'undefined' || idToken === null) {
                    setUIState(SIGN_IN);
                    return;
                }

                window.location.hash = '#home';
                require(['home-ui-controller'], function(homeController){
                    console.log('login-ui-controller: homeController.init()');
                    homeController.init(idToken);
                });
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

    exports.init = function() {
        //if(chrome.experimental) {
        //    console.log('Using the ChromeIdentity controller');
        //    controller = chromeIdentity;
        //} else {
            console.log('Using the gplusIdentity controller');
            controller = gplusIdentity;
        //}


        setUIState(SIGN_IN); 
    }

    return exports;
});