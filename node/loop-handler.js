var RequestUtils = require('./request-utils.js');
var gplusController = require('./gplus-controller.js');
var urlModel = require('./url-model.js');
var ErrorCodes = require('./error_codes.js');
var pushController = require('./push-controller.js');
var userGroupModel = require('./user-group-model.js');

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

function manageLoopState(groupId, req, res) {
    if(req.body.is_looping === 'false') {
        if(intervals[groupId] && intervals[groupId].intervalObject) {
            console.log('Clearing Interval for ID: '+groupId);
            clearInterval(intervals[groupId].intervalObject);
        }
        delete(intervals[groupId]);
    } else {
        var delay = 60000;
        if(req.body.delay) {
            delay = parseInt(req.body.delay, 10);
        }
        startLoopingUrls(groupId, 0, 10000, delay);
    }
    RequestUtils.respondWithData(
        {success: true},
        res
    );
}

function startLoopingUrls(groupId, urlIndex, reminderPings, delay) {
    if(intervals[groupId] && intervals[groupId].intervalObject) {
        console.log('Clearing Interval for ID: '+groupId);
        clearInterval(intervals[groupId].intervalObject);
    }
    delete(intervals[groupId]);

    sendPush(groupId, urlIndex);

    intervals[groupId] = {};

    // This should be changed to work to fire on the actual 
    // delay rather than reminder pings
    intervalObject = setInterval(function(args){
        sendPush(args.groupId, args.urlIndex);

        //args.urlIndex++;


        if(args.cumulativeInterval >= args.delay) {
            args.urlIndex++;
            args.cumulativeInterval = 0;

            var urlLength = intervals[groupId].urlLength;
            if(args.urlIndex >= urlLength) {
                args.urlIndex = 0;
            }
        }
    }, reminderPings, {groupId: groupId, urlIndex: urlIndex++, delay: delay, cumulativeInterval: 0});

    intervals[groupId].intervalObject = intervalObject;
}

function sendPush(groupId, urlIndex) {
    urlModel.getUrls(groupId, function(urls) {
        intervals[groupId].urlLength = urls.length;

        if(urlIndex >= urls.length) {
            urlIndex = 0;
        }
        var urlObj = urls[urlIndex];
        var urlString = urlObj.url;

        var browserPackage = "com.android.chrome";

        pushController.sendPushMsgToAllDevices(groupId, browserPackage, urlString, function(err) {
                if(err) {
                    console.log('Problem sending the push message: '+err);
                    return;
                }
            });
    }, function(err) {
        // NOOP
    });
}