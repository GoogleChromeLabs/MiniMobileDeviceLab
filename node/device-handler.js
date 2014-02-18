var RequestUtils = require('./request-utils.js');
var gplusController = require('./gplus-controller.js');
var devicesController = require('./device-controller.js');
var ErrorCodes = require('./error_codes.js');

exports.get = function(req, res) {
    var requiredParams = [
        'id_token'
    ];
    if(!RequestUtils.ensureValidRequest(req, res, requiredParams)) {
        return;
    }

    gplusController.getUserId(req.body.id_token, function (userId) {
        // Success Callback
        devicesController.getDevices(userId, function(devices){
            RequestUtils.respondWithData(
                devices,
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
            { device_id: deviceId },
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