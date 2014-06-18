var RequestUtils = require('./request-utils.js');
var gplusController = require('./gplus-controller.js');
var urlController = require('./url-controller.js');
var ErrorCodes = require('./error_codes.js');
var pushHandler = require('./push-handler.js');
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
        if(req.body.is_looping == false) {
            if(intervals[userId] && intervals[userId].intervalObject) {
                clearInterval(intervals[userId].intervalObject);
            }
            delete(intervals[userId]);
        } else {
            var delay = 60000;
            if(req.body.delay) {
                delay = parseInt(req.body.delay, 10);
            }
            startLoopingUrls(userId, 0, delay);
        }
        RequestUtils.respondWithData(
            {success: true},
            res
        );
    }, function() {
        RequestUtils.respondWithError(
            ErrorCodes.invalid_id_token,
            "The supplied id_token is invalid",
            400,
            res
        );
    });
};

function startLoopingUrls(userId, urlIndex, delay) {
    if(intervals[userId] && intervals[userId].intervalObject) {
        clearInterval(intervals[userId].intervalObject);
    }

    sendPush(userId, urlIndex);

    intervals[userId] = {};

    intervalObject = setInterval(function(args){
        sendPush(args.userId, args.urlIndex);

        args.urlIndex++;

        var urlLength = intervals[userId].urlLength;
        if(args.urlIndex >= urlLength) {
            args.urlIndex = 0;
        }
    }, delay, {userId: userId, urlIndex: urlIndex++});

    intervals[userId].intervalObject = intervalObject;
}

function sendPush(userId, urlIndex) {
    urlController.getUrls(userId, function(urls) {
        intervals[userId].urlLength = urls.length;

        if(urlIndex >= urls.length) {
            urlIndex = 0;
        }
        var urlObj = urls[urlIndex];
        var urlString = urlObj.url;

        var browserPackage = "com.android.chrome";

        userGroupModel.getUsersInGroupWithUserId(userId, function(err, userIds) {
            if(err) {
                console.log('Unable to get the full list of URLS');
                pushHandler.sendPushMsgToAllDevices(userId, browserPackage, urlString, function(err) {
                    if(err) {
                        console.log('Problem sending the push message: '+err);
                        return;
                    }
                });
                return;
            }

            for(var i = 0; i < userIds.length; i++) {
                pushHandler.sendPushMsgToAllDevices(userIds[i], browserPackage, urlString, function(err) {
                    if(err) {
                        console.log('Problem sending the push message: '+err);
                        return;
                    }
                });
            }
        });
    }, function(err) {
        // NOOP
    });
}