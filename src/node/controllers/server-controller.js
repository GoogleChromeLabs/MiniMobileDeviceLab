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
      return this._beginLoop();
    });
  }

  _beginLoop() {
    return this._firebaseDb.isConnected()
    .then((isConnected) => {
      if (!isConnected) {
        throw new MMDLError('not-connected-to-firebase');
      }

      return this._firebaseDb.setLoopRunning();
    });

    /** var deviceName = os.hostname();
    if (deviceName.indexOf('.') >= 0) {
      deviceName = deviceName.substring(0, deviceName.indexOf('.'));
    }
    var fbMonitor = firebase.child('monitor/' + deviceName);
    fbMonitor.child('serverHeartbeart').set(Date.now());
    setInterval(function() {
      fbMonitor.child('serverHeartbeart').set(Date.now());
    }, 90 * 1000); **/
  }
}

module.exports = ServerController;
