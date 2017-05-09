const os = require('os');

const MMDLError = require('../models/mmdl-error');
const logHelper = require('../utils/log-helper');

class ServerController {
  constructor(firebaseDb) {
    this._firebaseDb = firebaseDb;
  }

  start() {
    return this._firebaseDb.isServerRunning()
    .then((isRunning) => {
      if (isRunning) {
        throw new MMDLError('server-already-running');
      }

      // TODO: Start server loop
      logHelper.log('Starting Device Lab Server.');
      return this._firebaseDb.isConnected();
    })
    .then((isConnected) => {
      if (!isConnected) {
        throw new MMDLError('not-connected-to-firebase');
      }

      return this._firebaseDb.setLoopRunning();
    })
    .then(() => {
      return this._startServerHeartbeat();
    })
    .then(() => {
      return this._beginLoop();
    });
  }

  _beginLoop() {
    logHelper.log('Starting Loop');
  }

  _startServerHeartbeat() {
    let deviceName = os.hostname();
    if (deviceName.indexOf('.') >= 0) {
      deviceName = deviceName.substring(0, deviceName.indexOf('.'));
    }

    const fbMonitorRef = this._firebaseDb.database.ref('monitor/' + deviceName);
    fbMonitorRef.child('serverHeartbeart').set(new Date().toString());
    setInterval(function() {
      fbMonitorRef.child('serverHeartbeart').set(new Date().toString());
    }, 90 * 1000);
  }
}

module.exports = ServerController;
