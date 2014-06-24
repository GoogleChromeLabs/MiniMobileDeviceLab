var RequestUtils = require('./request-utils.js');
var gplusController = require('./gplus-controller.js');
var urlModel = require('./url-model.js');
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
                    RequestUtils.respondWithError(
                        ErrorCodes.failed_to_delete,
                        "User isn't assigned to a group: "+err,
                        500,
                        res
                    );
                    return;
                }

                getUrls(groupId, req, res);
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

function getUrls(groupId, req, res) {
    console.log('url-controller.js: getUrls() groupId = '+groupId);
    urlModel.getUrls(groupId, function(urls) {
            var filteredUrls = [];
            for(var i = 0; i < urls.length; i++) {
                var url = urls[i];
                filteredUrls.push({
                    id: url.id,
                    url: url.url,
                    sort_order: url.sort_order
                });
            }

            console.log('url-controller.js: getUrls() returning filteredUrls.length = '+filteredUrls.length);
            RequestUtils.respondWithData(
                filteredUrls,
                res
            );
        }, function(err) {
            // Failed to register
            RequestUtils.respondWithError(
                ErrorCodes.failed_to_get,
                "Failed to get urls: "+err,
                500,
                res
            );
        });
}

exports.add = function(req, res) {
    var requiredParams = [
        'id_token',
        'url'
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

                addUrl(groupId, req.body, res);
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

function addUrl(groupId, params, res) {
    urlModel.addUrl(res, groupId, params, function(urlId) {
            RequestUtils.respondWithData(
                {url_id: urlId},
                res
            );
        }, function(err) {
            // Failed to register
            RequestUtils.respondWithError(
                ErrorCodes.failed_to_add,
                "Failed to add url: "+err,
                500,
                res
            );
        });
    /**devicesController.addDevice(res, userId, params, function(deviceId){
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
    });**/
}

exports.remove = function(req, res) {
    var requiredParams = [
        'id_token',
        'url_id'
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

                deleteUrl(groupId, req.body, res);
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

function deleteUrl(groupId, params, res) {
    urlModel.deleteUrl(groupId, params, function(affectedRows) {
        // URL deleted
        if(affectedRows === 0) {
            RequestUtils.respondWithError(
                ErrorCodes.not_in_database,
                "The supplied url_id couldn't be found in the database",
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
                "Failed to delete url: "+err,
                500,
                res
            );
        });
    /**devicesController.deleteDevice(userId, params, function(affectedRows){
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
    });**/
}

exports.edit = function(req, res) {
    var requiredParams = [
        'id_token',
        'url_id',
        'url'
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

                editUrl(groupId, req.body, res);
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

function editUrl(groupId, params, res) {
    urlModel.updateUrl(groupId, params, function(affectedRows){
        // Device Edited
        if(affectedRows === 0) {
            RequestUtils.respondWithError(
                ErrorCodes.not_in_database,
                "The supplied url_id couldn't be found in the database",
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