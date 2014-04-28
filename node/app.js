var PORT = 3000;

var pkg = require('./package.json');
var express = require('express');
var deviceHandler = require('./device-handler.js');
var pushHandler = require('./push-handler.js');

var app = express();

// Parse Post Data
app.use(express.json());
app.use(express.urlencoded());

// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // Pass to next layer of middleware
    next();
});

// TODO: Return a valid JSON error for error handling
/**app.use(function(err, req, res, next){
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
});**/

// TODO: Include a catch all - no api fix up

app.post('/devices/get', deviceHandler.get);

app.post('/devices/add', deviceHandler.add);

app.post('/device/delete', deviceHandler.remove);

app.post('/device/edit', deviceHandler.edit);

app.post('/push/url', pushHandler.pushUrl);

// A simple handler that returns backend version.
// Used for health checks and such.
app.get('/version', function(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send(pkg.version);
});

app.listen(PORT);
console.log('Listening on port '+PORT);
