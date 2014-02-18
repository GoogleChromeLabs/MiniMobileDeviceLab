var RequestUtils = require('./request-utils.js');
var gplusController = require('./gplus-controller.js');
var devicesController = require('./device-controller.js');
var ErrorCodes = require('./error_codes.js');

exports.get = function(req, res) {
    console.log('/devices/get POST Request');

    var requiredParams = [
        'id_token'
    ];
    if(!RequestUtils.ensureValidRequest(req, res, requiredParams)) {
        return;
    }

    gplusController.getUserId(req.body.id_token, function (userId) {
        // Success Callback
        devicesController.getDevices(userId, function(devices){
            var groupedDevices = [];
            var device;
            for(var i = 0; i < devices.length; i++) {
                device = devices[i];
                if(typeof groupedDevices[device.platform_id] === 'undefined') {
                    groupedDevices[device.platform_id] = {
                        platform_id: device.platform_id,
                        devices: []
                    };
                }

                groupedDevices[device.platform_id].devices.push({
                    device_id: device.id,
                    device_name: device.device_name,
                    device_nickname: device.device_nickname
                });
            }
            console.log('groupedDevices = '+JSON.stringify(groupedDevices));
            RequestUtils.respondWithData(
                groupedDevices,
                res
            );
        }, function(err) {
            // Failed to register
            RequestUtils.respondWithError(
                ErrorCodes.failed_to_add,
                "Failed to add device: "+err,
                500,
                res
            );
        });
    }, function() {
        RequestUtils.respondWithError(
            ErrorCodes.invalid_id_token,
            "The supplied id_token is invalid",
            400,
            res
        );
    });
}

exports.add = function(req, res) {
    var requiredParams = [
        'id_token',
        'cloud_msg_id',
        'device_name',
        'device_nickname',
        'platform_id',
        'platform_version'
    ];
    if(!RequestUtils.ensureValidRequest(req, res, requiredParams)) {
        return;
    }

    gplusController.getUserId(req.body.id_token, function (userId) {
        // Success Callback
        addDevice(userId, req.body, res);
    }, function() {
        RequestUtils.respondWithError(
            ErrorCodes.invalid_id_token,
            "The supplied id_token is invalid",
            400,
            res
        );
    });
};

function addDevice(userId, params, res) {
    devicesController.addDevice(userId, params, function(deviceId){
        // Device registered
        RequestUtils.respondWithData(
            { deviceId: deviceId },
            res
        );
    }, function(err) {
        // Failed to register
        RequestUtils.respondWithError(
            ErrorCodes.failed_to_add,
            "Failed to add device: "+err,
            500,
            res
        );
    });
}