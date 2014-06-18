var dbHelper = require('./db-helper');

exports.getDevices = function(groupId, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {

        dbConnection.query('SELECT * FROM devices WHERE group_id = ? ORDER BY platform_id ASC', [groupId],
            function (err, result) {
                dbConnection.destroy();

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

exports.addDevice = function(res, groupId, params, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            group_id: groupId,
            device_name: params.device_name,
            device_nickname: params.device_nickname,
            platform_id: params.platform_id,
            platform_version: params.platform_version,
            cloud_msg_id: params.cloud_msg_id
        };

        dbConnection.query('SELECT * FROM devices WHERE cloud_msg_id = ? AND platform_id = ?',
            [params.cloud_msg_id, params.platform_id],
            function (err, result) {
                console.log('addDevice SELECT err = '+err+' results = '+JSON.stringify(result));
                if (err) {
                    errorCb(err);
                    dbConnection.destroy();
                    return;
                }

                if(result.length > 0) {
                    var RequestUtils = require('./request-utils.js');
                    var ErrorCodes = require('./error_codes.js');

                    RequestUtils.respondWithError(
                        ErrorCodes.already_added,
                        "Device's cloud_msg_id already in use",
                        500,
                        res
                    );
                    dbConnection.destroy();
                    return;
                }

                dbConnection.query('INSERT INTO devices SET ?', dbParams,
                    function (err, result) {
                        console.log('addDevice INSERT err = '+err+' results = '+JSON.stringify(result));
                        dbConnection.destroy();

                        if (err) {
                            errorCb(err);
                            return;
                        }

                        successCb(result.insertId);
                    }
                );
            });
    }, function(err) {
        errorCb(err);
    });
};

exports.deleteDevice = function(groupId, params, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            group_id: groupId,
            id: parseInt(params.device_id, 10)
        };
        dbConnection.query('DELETE FROM devices WHERE group_id = ? AND id = ?',
            [dbParams.group_id, dbParams.id],
            function (err, result) {
                dbConnection.destroy();

                if (err) {
                    errorCb(err);
                    return;
                }

                successCb(result.affectedRows);
            }
        );
    }, function(err) {
        errorCb(err);
    });
};

exports.updateDevice = function(groupId, params, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            group_id: groupId,
            id: parseInt(params.device_id, 10)
        };

        var updateParams = {};
        if(params.device_nickname) {
            updateParams.device_nickname = params.device_nickname;
        }

        if(params.platform_version) {
            updateParams.platform_version = params.platform_version;
        }

        dbConnection.query('UPDATE devices SET ? WHERE group_id = ? AND id = ?',
            [updateParams, dbParams.group_id, dbParams.id],
            function (err, result) {
                dbConnection.destroy();
                
                if (err) {
                    errorCb(err);
                    return;
                }

                successCb(result.affectedRows);
            }
        );
    }, function(err) {
        errorCb(err);
    });
};
