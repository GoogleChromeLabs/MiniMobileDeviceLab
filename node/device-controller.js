var RequestUtils = require('./request-utils.js');
var gplusController = require('./gplus-controller.js');
var devicesModel = require('./device-model.js');
var ErrorCodes = require('./error_codes.js');
var userGroupModel = require('./user-group-model.js');

exports.get = function(req, res) {
    var requiredParams = [
        'id_token'
    ];
    if(!RequestUtils.ensureValidRequest(req, res, requiredParams)) {
        return;
    }

    gplusController.getUserId(req.body.id_token, function (userId) {
        // Success Callback
        userGroupModel.getUsersGroupId(userId, function(err, groupId) {
            if(err) {
                // Failed to register
                RequestUtils.respondWithError(
                    ErrorCodes.failed_to_get,
                    "The user isn't a member of a group: "+err,
                    500,
                    res
                );
                return;
            }

            devicesModel.getDevices(groupId, function(devices){
                RequestUtils.respondWithData(
                    devices,
                    res
                );
            }, function(err) {
                // Failed to register
                RequestUtils.respondWithError(
                    ErrorCodes.failed_to_get,
                    "Failed to get device: "+err,
                    500,
                    res
                );
            });
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
        userGroupModel.getUsersGroupId(userId, function(err, groupId) {
                if(err) {
                    userGroupModel.insertUserAndCreateGroup(userId, function(err) {
                        if(err) {
                            RequestUtils.respondWithError(
                                ErrorCodes.failed_to_add,
                                "Failed to add device: "+err,
                                500,
                                res
                            );
                            return;
                        }

                        addDevice(groupId, req.body, res);
                    });
                    return;
                }

                addDevice(groupId, req.body, res);
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

function addDevice(groupId, params, res) {
    devicesModel.addDevice(res, groupId, params, function(deviceId){
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
        userGroupModel.getUsersGroupId(userId, function(err, groupId) {
                if(err) {
                    RequestUtils.respondWithError(
                        ErrorCodes.failed_to_delete,
                        "User isn't assigned to a group: "+err,
                        500,
                        res
                    );
                    return;
                }

                deleteDevice(groupId, req.body, res);
            }, function(err) {
                // Failed to register
                RequestUtils.respondWithError(
                    ErrorCodes.failed_to_delete,
                    "Failed to delete device: "+err,
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

function deleteDevice(groupId, params, res) {
    devicesModel.deleteDevice(groupId, params, function(affectedRows){
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
        userGroupModel.getUsersGroupId(userId, function(err, groupId) {
                if(err) {
                    RequestUtils.respondWithError(
                        ErrorCodes.failed_to_delete,
                        "User isn't assigned to a group: "+err,
                        500,
                        res
                    );
                    return;
                }

                editDevice(groupId, req.body, res);
            }, function(err) {
                // Failed to register
                RequestUtils.respondWithError(
                    ErrorCodes.failed_to_delete,
                    "Failed to delete device: "+err,
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

function editDevice(groupId, params, res) {
    devicesModel.updateDevice(groupId, params, function(affectedRows){
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
