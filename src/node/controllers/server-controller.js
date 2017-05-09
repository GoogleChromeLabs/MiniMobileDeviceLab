const os = require('os');

const MMDLError = require('../models/mmdl-error');
const logHelper = require('../utils/log-helper');
const LoopBehavior = require('../models/loop-behavior');

class ServerController {
  constructor(firebaseDb) {
    if (!firebaseDb) {
      throw new MMDLError('server-controller-no-firebase-db');
    }
    this._firebaseDb = firebaseDb;
    this._loopBehavior = new LoopBehavior();
    this._loopBehavior.on('loop-iteration', () => this._onLoopIteration());
  }

  start() {
    return this._firebaseDb.isServerRunning()
    .then((isRunning) => {
      if (isRunning) {
        throw new MMDLError('server-already-running');
      }

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
      logHelper.log('Starting Device Lab Server.');
      this._loopBehavior.startLoop();
    });
  }

  stop() {
    this._loopBehavior.stopLooping();
  }

  _onLoopIteration() {
    return Promise.all([
      this._firebaseDb.getLoopIndex(),
      this._firebaseDb.getUrls(),
    ])
    .then((results) => {
      let loopIndex = results[0];
      const urls = results[1];

      if (urls.length === 0) {
        logHelper.warn('No URLs to loop over.');
        return;
      }

      if (loopIndex >= urls.length) {
        loopIndex = 0;
      }

      return this._showUrl(urls[loopIndex])
      .then(() => {
        loopIndex = (loopIndex + 1) % urls.length;
        return this._firebaseDb.setLoopIndex(loopIndex);
      });
    })
    .catch((err) => {
      logHelper.error('Unexpected error in loop-iteration.', err);
    });
  }

  _showUrl(url) {

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
