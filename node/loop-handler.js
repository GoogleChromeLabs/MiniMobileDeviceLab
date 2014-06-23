var RequestUtils = require('./request-utils.js');
var gplusController = require('./gplus-controller.js');
var urlModel = require('./url-model.js');
var ErrorCodes = require('./error_codes.js');
var pushController = require('./push-controller.js');
var userGroupModel = require('./user-group-model.js');
var loopStateModel = require('./loop-state-model.js');

var intervals = {};

exports.control = function(req, res) {
    var requiredParams = [
        'id_token',
        'is_looping',
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

                manageLoopState(groupId, req, res);
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

exports.state = function(req, res) {
    var requiredParams = [
        'id_token'
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

                getLoopState(groupId, req, res);
            }, function(err) {
                // Failed to register
                RequestUtils.respondWithError(
                    ErrorCodes.failed_to_delete,
                    "Failed to get loop state: "+err,
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

function getLoopState(groupId, req, res) {
    var isLooping = false;
    if(intervals[groupId] && intervals[groupId].intervalObject) {
        isLooping = true;
    }
    
    RequestUtils.respondWithData(
        {is_looping: isLooping},
        res
    );
}

function manageLoopState(groupId, req, res) {
    if(req.body.is_looping === 'false') {
        if(intervals[groupId] && intervals[groupId].intervalObject) {
            console.log('Clearing Interval for ID: '+groupId);
            clearInterval(intervals[groupId].intervalObject);
        }
        delete(intervals[groupId]);

        loopStateModel.removeEntryForLoop(groupId, function(err) {
            if(err) {
                RequestUtils.respondWithError(
                    ErrorCodes.failed_to_add,
                    "Failed to get loop state: "+err,
                    500,
                    res
                );
                return;
            }

            RequestUtils.respondWithData(
                {success: true},
                res
            );
        });
    } else {
        var delay = 60000;
        if(req.body.delay) {
            delay = parseInt(req.body.delay, 10);
        }
        startLoopingUrls(groupId, 0, 10000, delay);

        loopStateModel.addEntryForLoop(groupId, function(err) {
            if(err) {
                RequestUtils.respondWithError(
                    ErrorCodes.failed_to_add,
                    "Failed to get loop state: "+err,
                    500,
                    res
                );
                return;
            }

            RequestUtils.respondWithData(
                {success: true},
                res
            );
        });
    }
}

function startLoopingUrls(groupId, urlIndex, reminderPings, delay) {
    if(intervals[groupId] && intervals[groupId].intervalObject) {
        console.log('Clearing Interval for ID: '+groupId);
        clearInterval(intervals[groupId].intervalObject);
    }
    delete(intervals[groupId]);

    var session = '' + Math.floor(Math.random()*1000);

    sendPush(groupId, urlIndex, session);

    intervals[groupId] = {};

    // This should be changed to work to fire on the actual 
    // delay rather than reminder pings
    intervalObject = setInterval(function(args){
        sendPush(args.groupId, args.urlIndex, args.session);

        if(args.cumulativeInterval >= args.delay) {
            args.urlIndex++;
            args.cumulativeInterval = 0;

            var urlLength = intervals[groupId].urlLength;
            if(args.urlIndex >= urlLength) {
                args.urlIndex = 0;
            }
        } else {
            args.cumulativeInterval += args.reminderPings;
        }
    }, reminderPings, {
        groupId: groupId, 
        urlIndex: urlIndex++, 
        delay: delay, 
        reminderPings: reminderPings, 
        cumulativeInterval: 0,
        session: session
    });

    intervals[groupId].intervalObject = intervalObject;
}

function sendPush(groupId, urlIndex, session) {
    urlModel.getUrls(groupId, function(urls) {
        intervals[groupId].urlLength = urls.length;

        if(urlIndex >= urls.length) {
            urlIndex = 0;
        }
        var urlObj = urls[urlIndex];
        var urlString = urlObj.url;

        var browserPackage = "com.android.chrome";

        pushController.sendPushMsgToAllDevices(groupId, browserPackage, urlString, session, function(err) {
                if(err) {
                    console.log('Problem sending the push message: '+err);
                    return;
                }
            });
    }, function(err) {
        // NOOP
    });
}