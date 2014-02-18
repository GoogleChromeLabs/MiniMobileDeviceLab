var dbHelper = require('./db-helper');
var RequestUtils = require('./request-utils.js');
var gplusController = require('./gplus-controller.js');
var ErrorCodes = require('./error_codes.js');

var PLATFORM_ID_ANDROID = 0;

exports.pushUrl = function(req, res) {
    var requiredParams = [
        'id_token',
        'url',
        'device_params'
    ];
    if(!RequestUtils.ensureValidRequest(req, res, requiredParams)) {
        return;
    }

    gplusController.getUserId(req.body.id_token, function (userId) {
        // Success Callback

        var deviceParams = req.body.device_params;
        var deviceIds = '';
        for(var i = 0; i < deviceParams.length; i++) {
            var params = deviceParams[i];
            deviceIds += params.id;
            if(i+1 != deviceParams.length) {
                deviceIds += ',';
            }
        }

        dbHelper.openDb(function(dbConnection) {
            dbConnection.query('SELECT cloud_msg_id, platform_id FROM devices WHERE user_id = ? AND id IN ('+deviceIds+')', [userId], 
                function (err, result) {
                        if (err) {
                            RequestUtils.respondWithError(
                                ErrorCodes.database_error,
                                "Unable to send push messages due to a database error",
                                400,
                                res
                            );
                            return;
                        }
                        
                        console.log('result = ', JSON.stringify(result));

                        for(var i = 0; i < result.length; i++) {
                            var cloudMsgId = result[i].cloud_msg_id;
                            var platformId = result[i].platform_id;

                            switch(parseInt(platformId)) {
                                case PLATFORM_ID_ANDROID:

                                break;
                            }
                        }

                        RequestUtils.respondWithData(null, res);
                        //successCb(result);
                    });
        }, function(err) {
            errorCb(err);
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