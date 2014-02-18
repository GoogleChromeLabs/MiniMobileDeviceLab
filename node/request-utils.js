var ErrorCodes = require('./error_codes.js');

exports.ensureValidRequest = function(req, res, requiredParams) {
    var missingParams = checkRequiredParams(req.body, requiredParams);
    if(missingParams.length > 0) {
        var missingStrings = '';
        for(var i = 0; i < missingParams.length; i++) {
            missingStrings += missingParams[i];
            if(i + 1 !== missingParams.length) {
                missingStrings += ', ';
            }
        }

        this.respondWithError(
            ErrorCodes.required_param_missing,
            req.url+" requires the "+missingStrings+" parameter to be included with the request",
            400,
            res);

        return false;
    }
    return true;
}

exports.respondWithError = function(errorCode, errorMsg, statusCode, res) {
    var response = {
        error: {
            code: errorCode,
            msg: errorMsg
        }
    };
    sendRequest(response, statusCode, res);  
};

exports.respondWithData = function(data, res) {
    var response = {
        data: data
    };
    sendRequest(response, 200, res);  
};

function sendRequest(response, statusCode, res) {
    var body = JSON.stringify(response);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(body));
    res.statusCode = statusCode;
    res.end(body);
}

function checkRequiredParams(params, requiredParams) {
    var missingFields = [];
    for(var i = 0; i < requiredParams.length; i++) {
        var isSupplied = isValidParam(params[requiredParams[i]]);
        if(!isSupplied) {
            missingFields.push(requiredParams[i]);
        }
    }
    return missingFields;
}

function isValidParam(param) {
    if(typeof param === 'undefined') {
        return false;
    } else if(param === null) {
        return false;
    } else if (param.length === 0) {
        return false;
    } else if(param === 'null') {
        return false;
    }

    return true;
}