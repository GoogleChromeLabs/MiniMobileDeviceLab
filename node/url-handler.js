var RequestUtils = require('./request-utils.js');
var gplusController = require('./gplus-controller.js');
var urlController = require('./url-controller.js');
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
        urlController.getUrls(userId, function(urls) {
            var filteredUrls = [];
            for(var i = 0; i < urls.length; i++) {
                var url = urls[i];
                filteredUrls.push({
                    id: url.id,
                    url: url.url,
                    sort_order: url.sort_order
                });
            }
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
        'url'
    ];
    if(!RequestUtils.ensureValidRequest(req, res, requiredParams)) {
        return;
    }
    gplusController.getUserId(req.body.id_token, function (userId) {
        // Success Callback
        addUrl(userId, req.body, res);
    }, function() {
        RequestUtils.respondWithError(
            ErrorCodes.invalid_id_token,
            "The supplied id_token is invalid",
            400,
            res
        );
    });
};

function addUrl(userId, params, res) {
    urlController.addUrl(res, userId, params, function(urlId) {
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
        deleteUrl(userId, req.body, res);
    }, function() {
        RequestUtils.respondWithError(
            ErrorCodes.invalid_id_token,
            "The supplied id_token is invalid",
            400,
            res
        );
    });
};

function deleteUrl(userId, params, res) {
    urlController.deleteUrl(userId, params, function(affectedRows) {
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
        editUrl(userId, req.body, res);
    }, function() {
        RequestUtils.respondWithError(
            ErrorCodes.invalid_id_token,
            "The supplied id_token is invalid",
            400,
            res
        );
    });
};

function editUrl(userId, params, res) {
    urlController.updateUrl(userId, params, function(affectedRows){
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