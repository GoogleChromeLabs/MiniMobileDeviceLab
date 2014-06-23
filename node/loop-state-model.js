var dbHelper = require('./db-helper');

exports.addEntryForLoop = function(groupId, callback) {
    console.log('addEntryForLoop');
    dbHelper.openDb(function(dbConnection) {
        var dbParams = {
            group_id: groupId
        };
        console.log('addEntryForLoop SELECT');
        dbConnection.query('SELECT * FROM loopstate WHERE group_id = ?',
            [groupId],
            function (err, result) {
                console.log('addEntryForLoop SELECT err = '+err);
                if (err) {
                    dbConnection.destroy();
                    callback(err);
                    return;
                }

                console.log('addEntryForLoop SELECT result.length = '+result.length);

                if(result.length > 0) {
                    dbConnection.destroy();
                    callback(null, result[0].id);
                    return;
                }

                console.log('addEntryForLoop INSERT');
                try {
                dbConnection.query('INSERT INTO loopstate SET ?', dbParams,
                    function (err, result) {
                        dbConnection.destroy();
                        if (err) {
                            console.log('addEntryForLoop INSERT err = '+err);
                            callback(err);
                            return;
                        }

                        console.log('addEntryForLoop INSERT result.insertId = '+result.insertId);
                        callback(null, result.insertId);
                    }
                );
                } catch(exception) {
                    console.log('addEntryForLoop exception = '+err);
                }
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

exports.getLoopingGroups = function(callback) {
    dbHelper.openDb(function(dbConnection) {
        dbConnection.query('SELECT * FROM loopstate',
            [],
            function (err, result) {
                dbConnection.destroy();

                if (err) {
                    callback(err);
                    return;
                }

                callback(null, result);
            }
        );
    }, function(err) {
        callback(err);
    });
};