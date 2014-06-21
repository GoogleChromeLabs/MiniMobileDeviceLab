var dbHelper = require('./db-helper');

exports.getUsersInGroupWithUserId = function(userId, callback) {
    dbHelper.openDb(function(dbConnection) {
        dbConnection.query('SELECT group_id FROM usergroups WHERE user_id = ?', [userId],
            function (err, result) {
                if (err) {
                    dbConnection.destroy();
                    callback(err);
                    return;
                }

                if(result.length !== 1) {
                    // Either no results or unexpected result
                    dbConnection.destroy();
                    callback(null, [userId]);
                    return;
                }

                var groupId = result[0].group_id;
                dbConnection.query('SELECT user_id FROM usergroups WHERE group_id = ?', [groupId],
                    function (err, result) {
                        dbConnection.destroy();

                        if (err) {
                            callback(err);
                            return;
                        }

                        var userIds = [];
                        for(var i = 0; i < result.length; i++) {
                            userIds.push(result[i].user_id);
                        }

                        callback(null, userIds);
                        
                    });
            });
        }, function(err) {
            callback(err);
        });
};

exports.getUsersGroupId = function(userId, callback) {
    console.log('getUsersGroupId()');
    dbHelper.openDb(function(dbConnection) {
        dbConnection.query('SELECT group_id FROM usergroups WHERE user_id = ? AND group_id > 0', [userId],
            function (err, result) {
                dbConnection.destroy();

                if (err) {
                    callback(err);
                    return;
                }

                if(result.length > 1) {
                    // Either no results or unexpected result
                    callback("Found multiple groups for user. Eek.");
                    return;
                }

                if(result.length === 0) {
                    callback("User is not assigned to a group");
                    return;
                }

                console.log('getUsersGroupId() SELECT result[0].group_id = '+JSON.stringify(result[0]));
                var groupId = result[0].group_id;
                callback(null, groupId);
            });
        }, function(err) {
            callback(err);
        });
};

exports.insertUserAndCreateGroup = function(userId, callback) {
    console.log('insertUserAndCreateGroup()');
    dbHelper.openDb(function(dbConnection) {
        dbConnection.query('INSERT INTO usergroups SET ?', {user_id: userId},
            function (err, result) {
                console.log('insertUserAndCreateGroup() INSERT err = '+err);
                if (err) {
                    dbConnection.destroy();
                    callback(err);
                    return;
                }
                var groupId = result.insertId;
                console.log('insertUserAndCreateGroup() result.insertId = '+result.insertId);
                dbConnection.query('UPDATE usergroups SET ? WHERE user_id = ?', [{group_id: groupId}, userId],
                    function (err, result) {
                        dbConnection.destroy();
                        if(err) {
                            callback(err);
                            return;
                        }

                        console.log('insertUserAndCreateGroup() SUCCESS');

                        callback(null, groupId);
                    });
            });
        }, function(err) {
            callback(err);
        });
};
