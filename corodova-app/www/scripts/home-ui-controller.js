/*global define */
define(['strings'], function (strings) {
    'use strict';

    var HOME = 0;
    var LOADING = 1;
    var LOGIN = 2;

    var exports = {};

    var currentState;
    var mainContentElement = document.getElementById('main-content');

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
            case HOME:
                return 'home';
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
            case HOME:
                mainContentElement.appendChild(getTitleElement(strings.home_title));

                for(var i = 0; i < strings.home_msgs.length; i++) {
                    var pElement = document.createElement('p');
                    pElement.appendChild(document.createTextNode(strings.home_msgs[i]));
                    mainContentElement.appendChild(pElement);
                }

                var logOutButton = document.createElement('a');
                logOutButton.classList.add('log-out-button');
                logOutButton.appendChild(document.createTextNode(strings.log_out));
                logOutButton.href= "#logout";
                logOutButton.onclick = function(e){
                    history.pushState(null, null, logOutButton.href);
                    e.preventDefault();
                    exports.logout();
                }
                mainContentElement.appendChild(logOutButton);
                break;
            case LOADING:
                element = document.createElement('div');
                element.classList.add('spinner');
                break;
            case LOGIN:
                window.location.hash = '';
                require(['login-ui-controller'], function(loginController){
                    loginController.init();
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

    exports.logout = function() {
        setUIState(LOGIN);
    }

    exports.init = function() {
        setUIState(HOME);
    }

    return exports;
});