const ControllerInterface = require('./controller-interface');
const MMDLError = require('../models/mmdl-error');
const logHelper = require('../utils/log-helper');
const LoopBehavior = require('../models/loop-behavior');

class ServerController extends ControllerInterface {
  constructor(firebaseDb, labName) {
    super(firebaseDb, labName);

    this._loopBehavior = new LoopBehavior(10);
    this._loopBehavior.on('loop-iteration', () => this._onLoopIteration());
  }

  start() {
    return this.isServerRunning()
    .then((isRunning) => {
      if (isRunning) {
        throw new MMDLError('server-already-running');
      }

      return this.isConnected();
    })
    .then((isConnected) => {
      if (!isConnected) {
        throw new MMDLError('not-connected-to-firebase');
      }

      return this.setServerRunning();
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
      this.getLoopIndex(),
      this.getUrls(),
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

      const newLoopIndex = (loopIndex + 1) % urls.length;
      const newUrl = urls[newLoopIndex];
      return Promise.all([
        this.setUrl(newUrl),
        this.setLoopIndex(newLoopIndex),
      ]);
    })
    .catch((err) => {
      logHelper.error('Unexpected error in loop-iteration.', err);
    });
  }

  _startServerHeartbeat() {
    let deviceName = this.getDeviceName();

    const fbMonitorRef = this._firebaseDb.database.ref('servers/' + deviceName);
    fbMonitorRef.child('serverHeartbeart').set(new Date().toString());
    setInterval(function() {
      fbMonitorRef.child('serverHeartbeart').set(new Date().toString());
    }, 90 * 1000);
  }

  isServerRunning() {
    return this._firebaseDb.once(`lab/${this._labName}/server-running`)
    .then((value) => {
      return value ? true : false;
    });
  }

  setServerRunning() {
    const loopRunningRef = this._firebaseDb.database.ref(
      `lab/${this._labName}/server-running`);
    loopRunningRef.onDisconnect().remove();
    return loopRunningRef.set(true);
  }

  isConnected() {
    return this._firebaseDb.once('.info/connected');
  }

  getUrls() {
    return this._firebaseDb.once(
      `lab/${this._labName}/urls`)
    .then((value) => {
      return value || [];
    });
  }

  setUrl(newUrl) {
    const loopIndexRef = this._firebaseDb.database.ref(
      `lab/${this._labName}/current-url`);
    return loopIndexRef.set(newUrl);
  }

  setLoopIndex(newLoopIndex) {
    const loopIndexRef = this._firebaseDb.database.ref(
      `lab/${this._labName}/index`);
    return loopIndexRef.set(newLoopIndex);
  }

  getLoopIndex() {
    return this._firebaseDb.once(`lab/${this._labName}/index`)
    .then((value) => {
      return value || 0;
    });
  }
}

module.exports = ServerController;
