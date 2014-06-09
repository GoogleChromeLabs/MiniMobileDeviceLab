var dbHelper = require('./db-helper');

exports.getUrls = function(userId, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {

        dbConnection.query('SELECT * FROM urls WHERE user_id = ? ORDER BY sort_order ASC', [userId],
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

exports.addUrl = function(res, userId, params, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            user_id: userId,
            url: params.url
        };

        dbConnection.query('SELECT * FROM urls WHERE user_id = ? AND url = ?',
            [userId, params.url],
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

exports.deleteUrl = function(userId, params, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            user_id: userId,
            id: parseInt(params.url_id, 10)
        };
        dbConnection.query('DELETE FROM urls WHERE user_id = ? AND id = ?',
            [dbParams.user_id, dbParams.id],
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

exports.updateUrl = function(userId, params, successCb, errorCb) {
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            user_id: userId,
            id: parseInt(params.url_id, 10)
        };

        var updateParams = {ur: params.url};

        dbConnection.query('UPDATE devices SET ? WHERE user_id = ? AND id = ?',
            [updateParams, dbParams.user_id, dbParams.id],
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
