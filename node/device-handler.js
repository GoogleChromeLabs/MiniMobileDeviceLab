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
};

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
    devicesController.addDevice(res, userId, params, function(deviceId){
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

exports.remove = function(req, res) {
    var requiredParams = [
        'id_token',
        'device_id'
    ];
    if(!RequestUtils.ensureValidRequest(req, res, requiredParams)) {
        return;
    }

    gplusController.getUserId(req.body.id_token, function (userId) {
        // Success Callback
        deleteDevice(userId, req.body, res);
    }, function() {
        RequestUtils.respondWithError(
            ErrorCodes.invalid_id_token,
            "The supplied id_token is invalid",
            400,
            res
        );
    });
};

function deleteDevice(userId, params, res) {
    devicesController.deleteDevice(userId, params, function(affectedRows){
        // Device deleted
        if(affectedRows === 0) {
            RequestUtils.respondWithError(
                ErrorCodes.not_in_database,
                "The supplied device_id couldn't be found in the database",
                400,
                res
            );
            return;
        }

        RequestUtils.respondWithData(
            { success: true },
            res
        );
    }, function(err) {
        // Failed to delete
        RequestUtils.respondWithError(
            ErrorCodes.failed_to_add,
            "Failed to delete device: "+err,
            500,
            res
        );
    });
}

exports.edit = function(req, res) {
    var requiredParams = [
        'id_token',
        'device_id'
    ];
    if(!RequestUtils.ensureValidRequest(req, res, requiredParams)) {
        return;
    }

    gplusController.getUserId(req.body.id_token, function (userId) {
        // Success Callback
        editDevice(userId, req.body, res);
    }, function() {
        RequestUtils.respondWithError(
            ErrorCodes.invalid_id_token,
            "The supplied id_token is invalid",
            400,
            res
        );
    });
};

function editDevice(userId, params, res) {
    devicesController.updateDevice(userId, params, function(affectedRows){
        // Device Edited
        if(affectedRows === 0) {
            RequestUtils.respondWithError(
                ErrorCodes.not_in_database,
                "The supplied device_id couldn't be found in the database",
                400,
                res
            );
            return;
        }

        RequestUtils.respondWithData(
            { success: true },
            res
        );
    }, function(err) {
        // Failed to delete
        RequestUtils.respondWithError(
            ErrorCodes.failed_to_add,
            "Failed to delete device: "+err,
            500,
            res
        );
    });
}
