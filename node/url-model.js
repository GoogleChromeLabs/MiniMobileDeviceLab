var dbHelper = require('./db-helper');

exports.getUrls = function(groupId, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {

        dbConnection.query('SELECT * FROM urls WHERE group_id = ? ORDER BY sort_order ASC', [groupId],
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

exports.addUrl = function(res, groupId, params, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            group_id: groupId,
            url: params.url
        };

        dbConnection.query('SELECT * FROM urls WHERE group_id = ? AND url = ?',
            [groupId, params.url],
            function (err, result) {
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
                        "URL already added",
                        500,
                        res
                    );
                    dbConnection.destroy();
                    return;
                }
                dbConnection.query('INSERT INTO urls SET ?', dbParams,
                    function (err, result) {
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

exports.deleteUrl = function(groupId, params, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            group_id: groupId,
            id: parseInt(params.url_id, 10)
        };
        dbConnection.query('DELETE FROM urls WHERE group_id = ? AND id = ?',
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

exports.updateUrl = function(groupId, params, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            group_id: groupId,
            id: parseInt(params.url_id, 10)
        };

        var updateParams = {ur: params.url};

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
