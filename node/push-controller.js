var dbHelper = require('./db-helper');
var RequestUtils = require('./request-utils.js');
var gplusController = require('./gplus-controller.js');
var ErrorCodes = require('./error_codes.js');
var gcm = require('node-gcm');
var config = require('./config.js');
var userGroupModel = require('./user-group-model.js');
var request = require('request');

var PLATFORM_ID_ANDROID = 0;

exports.pushUrl = function(req, res) {
    'use strict';

    var requiredParams = [
        'id_token',
        'url',
        'device_params'
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

                pushUrlToDevice(groupId, req, res);
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

function pushUrlToDevice(groupId, req, res) {
    var deviceParams = req.body.device_params;
    var deviceIds = '';
    var packages = {};
    for(var i = 0; i < deviceParams.length; i++) {
        var params = deviceParams[i];
        deviceIds += params.id;
        packages[params.id] = params.pkg;
        if(i+1 != deviceParams.length) {
            deviceIds += ',';
        }
    }

    dbHelper.openDb(function(dbConnection) {
        dbConnection.query('SELECT cloud_msg_id, platform_id, id FROM devices WHERE group_id = ? AND id IN ('+deviceIds+')', [groupId],
            function (err, result) {
                    dbConnection.destroy();
                    
                    if (err) {
                        RequestUtils.respondWithError(
                            ErrorCodes.database_error,
                            "Unable to send push messages due to a database error",
                            400,
                            res
                        );
                        return;
                    }

                    for(var i = 0; i < result.length; i++) {
                        var deviceId = result[i].id;
                        var cloudMsgId = result[i].cloud_msg_id;
                        var platformId = result[i].platform_id;

                        switch(parseInt(platformId)) {
                            case PLATFORM_ID_ANDROID:
                                //console.log('');

                                // Figure out what to do for batching messages
                                // create a message with default values
                                var message = new gcm.Message();
                                message.addDataWithKeyValue('url', req.body.url);
                                message.addDataWithKeyValue('pkg', packages[deviceId]);

                                //console.log('Sending url: '+req.body.url);
                                //console.log('Sending pkg: '+packages[deviceId]);

                                var sender = new gcm.Sender(config.gcmClientId);
                                var registrationIds = [];
                                registrationIds.push(cloudMsgId);

                                sendWebHookPush(groupId, packages[deviceId], req.body.url, null);

                                sender.send(message, registrationIds, 5, function (err, result) {
                                    //console.log(result);
                                });

                                break;
                        }
                    }

                    RequestUtils.respondWithData(null, res);
                    //successCb(result);
                });
    }, function(err) {
        errorCb(err);
    });
}

// No longer needed
/**exports.pushUrlAll = function (req, res) {
    'use strict';

    var requiredParams = [
        'id_token',
        'url'
    ];
    if(!RequestUtils.ensureValidRequest(req, res, requiredParams)) {
        return;
    }

    var browserPackage = "com.android.chrome";

    gplusController.getUserId(req.body.id_token, function (userId) {
        // Success Callback
        this.sendPushMsgToAllDevices(userId, browserPackage, req.body.url, function(err) {
            if(err) {
                RequestUtils.respondWithError(
                        ErrorCodes.database_error,
                        "Unable to send push messages due to a database error",
                        400,
                        res
                    );
                return;
            }

            RequestUtils.respondWithData(null, res);
        }.bind(this));
    }, function() {
        RequestUtils.respondWithError(
            ErrorCodes.invalid_id_token,
            "The supplied id_token is invalid",
            400,
            res
        );
    });
};**/

exports.sendPushMsgToAllDevices = function(groupId, browserPackage, url, session, callback) {
    sendWebHookPush(groupId, browserPackage, url, session);

    dbHelper.openDb(function(dbConnection) {
        dbConnection.query('SELECT cloud_msg_id, platform_id, id FROM devices WHERE group_id = ?', [groupId],
            function (err, result) {
                if (err) {
                    callback(err);
                    return;
                }

                //console.log('result = ', JSON.stringify(result));

                for(var i = 0; i < result.length; i++) {
                    var deviceId = result[i].id;
                    var cloudMsgId = result[i].cloud_msg_id;
                    var platformId = result[i].platform_id;

                    switch(parseInt(platformId)) {
                        case PLATFORM_ID_ANDROID:
                            //console.log('');

                            // Figure out what to do for batching messages
                            // create a message with default values
                            var message = new gcm.Message();
                            message.addDataWithKeyValue('url', url);
                            message.addDataWithKeyValue('pkg', browserPackage);
                            message.addDataWithKeyValue('session', session);

                            console.log('Sending url: '+url);
                            //console.log('Sending pkg: '+browserPackage);
                            console.log('Sending session: '+session);

                            var sender = new gcm.Sender(config.gcmClientId);
                            var registrationIds = [];
                            registrationIds.push(cloudMsgId);

                            sender.send(message, registrationIds, 5, function (err, result) {
                                //console.log(result);
                            });

                            break;
                    }
                }

                callback();
                //successCb(result);
            });
        }, function(err) {
            errorCb(err);
        });
};

function sendWebHookPush(groupId, browserPackage, url, session) {
    if(!config.webhookurl) {
        return;
    }

    request.post(config.webhookurl, {form:{url:url, pkg: browserPackage, session: session, group_id: groupId, secret: config.webhookSecret}})
}