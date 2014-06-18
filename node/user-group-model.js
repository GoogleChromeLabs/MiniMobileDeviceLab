var dbHelper = require('./db-helper');

exports.getUsersInGroupWithUserId = function(userId, callback) {
    dbHelper.openDb(function(dbConnection) {
        dbConnection.query('SELECT group_id FROM usergroups WHERE user_id = ?', [userId],
            function (err, result) {
                if (err) {
                    callback(err);
                    return;
                }

                if(result.length !== 1) {
                    // Either no results or unexpected result
                    callback(null, [userId]);
                    return;
                }

                var groupId = result[0].group_id;
                dbConnection.query('SELECT user_id FROM usergroups WHERE group_id = ?', [groupId],
                    function (err, result) {
                        if (err) {
                            callback(err);
                            return;
                        }

                        var userIds = [];
                        for(var i = 0; i < result.length; i++) {
                            userIds.push(result.user_id);
                        }

                        callback(userIds);
                        
                    });
            });
        }, function(err) {
            callback(err);
        });
};
