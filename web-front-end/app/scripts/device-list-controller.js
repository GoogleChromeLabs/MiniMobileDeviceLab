/*global define */
define(['config'], function (config) {
    'use strict';

    var exports = {};

    exports.getDevices = function(idToken, successCb, errorCb) {
        performDeviceListRequest(idToken, successCb, errorCb);
    }


    function performDeviceListRequest(idToken, successCb, errorCb) {
        console.log('device-list-controller: performDeviceListRequest');
        var that = this;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', config.getRootUrl()+'/devicelab/devices/get/', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        var that = this;
        xhr.onreadystatechange = function(e) {
            console.log('device-list-controller: performDeviceListRequest() onreadystatechange');
            if (this.readyState == 4) {
                console.log('device-list-controller: performDeviceListRequest() readyState == 4');
                if(this.status != 200) {
                    console.log('device-list-controller: performDeviceListRequest() error()');
                    errorCb();
                    return;
                } else {
                    console.log('device-list-controller: performDeviceListRequest() xhr.responseText = '+xhr.responseText);
                    var data = JSON.parse(xhr.responseText);
                    successCb(data.devices);
                }
            }
        };

        var paramString = 'id_token='+encodeURIComponent(idToken);
        xhr.send(paramString);
    }

    return exports;
});