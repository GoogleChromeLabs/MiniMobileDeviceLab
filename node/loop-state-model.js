var dbHelper = require('./db-helper');

exports.addEntryForLoop = function(groupId, callback) {
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            group_id: groupId
        };

        dbConnection.query('SELECT * FROM loopstate WHERE group_id = ?',
            [groupId],
            function (err, result) {
                if (err) {
                    dbConnection.destroy();
                    callback(err);
                    return;
                }

                if(result.length > 0) {
                    dbConnection.destroy();
                    callback(null, result[0].id);
                    return;
                }
                dbConnection.query('INSERT INTO loopstate SET ?', dbParams,
                    function (err, result) {
                        dbConnection.destroy();
                        if (err) {
                            callback(err);
                            return;
                        }

                        callback(null, result.insertId);
                    }
                );
            });
    }, function(err) {
        callback(err);
    });
};

exports.removeEntryForLoop = function(groupId, callback) {
    dbHelper.openDb(function(dbConnection) {
        dbConnection.query('DELETE FROM loopstate WHERE group_id = ?',
            [groupId],
            function (err, result) {
                dbConnection.destroy();

                if (err) {
                    callback(err);
                    return;
                }

                callback(null, result.affectedRows);
            }
        );
    }, function(err) {
        callback(err);
    });
};
