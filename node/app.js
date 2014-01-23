var PORT = 3000;

var gplusController = require('./gplus-controller.js');
var express = require('express');
var app = express();

// Parse Post Data
app.use(express.json());
app.use(express.urlencoded());

// TODO: Return a valid JSON error for error handling
app.use(function(err, req, res, next){
    console.error(err.stack);
    
    var response = {
        error: {
            code: "unknown_error",
            msg: "This request caused an unknown error on the server."
        }
    };

    // TODO: Set the Status Code

    var body = JSON.stringify(response);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(body));
    res.end(body);
});

// TODO: Include a catch all - no api fix up

app.get('/devices/get', function(req, res){
    console.log('/devices/get GET Request');

    var response = {
        error: {
            code: "incorrect_request_type",
            msg: "/devices/get/ is only accessible with a POST request."
        }
    };

    var body = JSON.stringify(response);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(body));
    res.end(body);
});

app.post('/devices/get', function(req, res){
    console.log('/devices/get POST Request');

    var response;
    var missingParams = checkRequiredParams(req, [
        'id_token'
        ]);
    if(missingParams.length > 0) {
        var missingStrings = '';
        for(var i = 0; i < missingParams.length; i++) {
            missingStrings += missingParams[i];
            if(i + 1 !== missingParams.length) {
                missingStrings += ', ';
            }
        }

        response = {
            error: {
                code: "required_param_missing",
                msg: "/devices/register/ requires the "+missingStrings+" parameter to be included with the request"
            }
        };
    } else {
        var idToken = req.body.id_token;

        response = idToken;

        var userId = gplusController.getUserId(idToken);

        //if(gplusController.isValidUserId(userId)) {
        if(true) {
            // Return Devices
            response = {
                deviceGroups: [
                    {
                        platformName: 'android',
                        platformId: 0,
                        devices: [
                            {
                                device_id: 20456,
                                device_name: 'Nexus 5',
                                device_nickname: 'Matt\'s Nexus 5' 
                            },
                            {
                                device_id: 49583,
                                device_name: 'Nexus One',
                                device_nickname: 'Office Nexus One' 
                            }
                        ]
                    },
                    {
                        platformName: 'ios',
                        platformId: 1,
                        devices: [
                            {
                                device_id: 3452234,
                                device_name: 'iPhone 5S',
                                device_nickname: 'Matt\'s iPhone 5S' 
                            },
                            {
                                device_id: 124553,
                                device_name: 'iPad 2',
                                device_nickname: 'Office iPad 2' 
                            }
                        ]
                    }
                ]
            };
        } else {
            // Invalid ID_TOKEN
            response = {
                error: {
                    code: "invalid_id_token",
                    msg: "The supplied id_token is invalid"
                }
            };
        }
    }

    var body = JSON.stringify(response);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(body));
    res.end(body);
});

app.get('/devices/register', function(req, res){
    console.log('/devices/register GET Request');

    var response = {
        error: {
            code: "incorrect_request_type",
            msg: "/devices/get/ is only accessible with a POST request."
        }
    };

    var body = JSON.stringify(response);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(body));
    res.end(body);
});

app.post('/devices/register', function(req, res){
    console.log('/devices/register POST Request');

    var response;
    var missingParams = checkRequiredParams(req, [
        'id_token',
        'device_id',
        'gcm_id',
        'device_name',
        'device_nickname',
        'platform_id',
        'platform_version'
        ]);
    if(missingParams.length > 0) {
        var missingStrings = '';
        for(var i = 0; i < missingParams.length; i++) {
            missingStrings += missingParams[i];
            if(i + 1 !== missingParams.length) {
                missingStrings += ', ';
            }
        }

        response = {
            error: {
                code: "required_param_missing",
                msg: "/devices/register/ requires the "+missingStrings+" parameter to be included with the request"
            }
        };
    } else {
        var idToken = req.body.id_token;
        var deviceId = parseInt(req.body.device_id);
        var gcmId = req.body.gcm_id;
        var deviceName = req.body.device_name;
        var deviceNickname = req.body.device_nickname;
        var platformId = req.body.platform_id;
        var platformVersion = req.body.platform_version;

        // TODO: Sort out how
        var userId = 'Temp'; //;gplusController.getUserId();

        //if(gplusController.isValidUserId(userId)) {
        if(true) {
            var device = {
                deviceId: deviceId,
                gcmId: gcmId,
                name: deviceName,
                nickname: deviceNickname,
                platformId: platformId,
                platformVersion: platformVersion
            };
            //var isRegistered = devicesController.registerDevice(device);
            var isRegistered = true;
            if(isRegistered) {
                // Device registered
                response = {
                    data: {
                        deviceId: deviceId
                    }
                };
            } else {
                // Failed to register
                response = {
                    error: {
                        code: "failed_to_register",
                        msg: "Failed to register device"
                    }
                };
            }
        } else {
            // Invalid ID_TOKEN
            response = {
                error: {
                    code: "invalid_id_token",
                    msg: "The supplied id_token is invalid"
                }
            };
        }
    }

    var body = JSON.stringify(response);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(body));
    res.end(body);
});

function checkRequiredParams(req, requiredParams) {
    var missingFields = [];
    for(var i = 0; i < requiredParams.length; i++) {
        var isSupplied = isValidParam(req.body[requiredParams[i]]);
        if(!isSupplied) {
            missingFields.push(requiredParams[i]);
        }
    }
    return missingFields;
}

function isValidParam(param) {
    console.log('isValidParam = '+param);
    if(typeof param === 'undefined') {
        return false;
    } else if(param === null) {
        return false;
    } else if (param.length === 0){
        return false;
    }
    return true;
}

app.listen(PORT);
console.log('Listening on port '+PORT);