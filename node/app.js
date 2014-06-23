var PORT = 3000;

var pkg = require('./package.json');
var express = require('express');
var deviceController = require('./device-controller.js');
var urlController = require('./url-controller.js');
var pushController = require('./push-controller.js');
var loopHandler = require('./loop-handler.js');

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

app.post('/api/devices/get', deviceController.get);

app.post('/api/devices/add', deviceController.add);

app.post('/api/device/delete', deviceController.remove);

app.post('/api/device/edit', deviceController.edit);

app.post('/api/push/url', pushController.pushUrl);

app.post('/api/urls/get', urlController.get);

app.post('/api/urls/add', urlController.add);

app.post('/api/urls/delete', urlController.remove);

app.post('/api/urls/update', urlController.edit);

app.post('/api/urls/loopcontrol', loopHandler.control);

app.post('/api/urls/loopstate', loopHandler.state);

// A simple handler that returns backend version.
// Used for health checks and such.
app.get('/api/version', function(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send(pkg.version);
});

app.listen(PORT);
console.log('Listening on port '+PORT);

loopHandler.initialised();
console.log('Initialised loops');