var dbHelper = require('./db-helper');

exports.getDevices = function(userId, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {

        dbConnection.query('SELECT * FROM devices WHERE user_id = ? ORDER BY platform_id ASC', [userId], 
            function (err, result) {
                if (err) {
                    errorCb(err);
                    return;
                }
                
                successCb(result);
            }
        );
    }, function(err) {
        errorCb(err);
    });
};

exports.addDevice = function(userId, params, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            user_id: userId,
            device_name: params.device_name,
            device_nickname: params.device_nickname,
            platform_id: params.platform_id,
            platform_version: params.platform_version,
            cloud_msg_id: params.cloud_msg_id
        };
        dbConnection.query('INSERT INTO devices SET ?', dbParams, 
            function (err, result) {
                if (err) {
                    errorCb(err);
                    return;
                }

                successCb(result.insertId);
            }
        );
    }, function(err) {
        errorCb(err);
    });
}