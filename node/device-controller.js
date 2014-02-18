var dbHelper = require('./db-helper');

exports.addDevice = function(userId, params, successCb, errorCb) {
    var cloudMsgId = params.cloud_msg_id;
    var deviceName = params.device_name;
    var deviceNickname = params.device_nickname;
    var platformId = params.platform_id;
    var platformVersion = params.platform_version;

    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            device_name: params.device_name,
            device_nickname: params.device_nickname,
            platform_id: params.platform_id,
            platform_version: params.platform_version,
            cloud_msg_id: params.cloud_msg_id
        }
        dbConnection.query('INSERT INTO devices SET ?', dbParams, 
            function (err, result) {
                if (err) {
                    errorCb(err);
                    return;
                }

                addDeviceUserPair(result.insertId, userId, successCb, errorCb);
                
            }
        );
    }, function(err) {
        errorCb(err);
    });
}

function addDeviceUserPair(deviceId, userId, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            device_id: deviceId,
            user_id: userId
        }
        dbConnection.query('INSERT INTO userdevicepairs SET ?', dbParams, 
            function (err, result) {
                if (err) {
                    errorCb(err);
                    return;
                }

                successCb(deviceId);
            }
        );
    }, function(err) {
        errorCb(err);
    });

    
}