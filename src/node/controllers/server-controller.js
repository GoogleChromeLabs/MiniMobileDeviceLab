const ControllerInterface = require('./controller-interface');
const MMDLError = require('../models/mmdl-error');
const logHelper = require('../utils/log-helper');
const LoopBehavior = require('../models/loop-behavior');

const DEFAULT_LOOP_SPEED_SECS = 10;

class ServerController extends ControllerInterface {
  constructor(firebaseDb, labName) {
    super(firebaseDb, labName);

    logHelper.log(`Starting '${labName}' server....`);

    this._loopBehavior = new LoopBehavior(DEFAULT_LOOP_SPEED_SECS);
    this._loopBehavior.on('loop-iteration', () => this._onLoopIteration());
  }

  start() {
    logHelper.log(`Checking if '${this._labName}' is already running....`);
    return this.isServerRunning()
    .then((isRunning) => {
      if (isRunning) {
        throw new MMDLError('server-already-running');
      }

      logHelper.log(`Checking if device is connected to Firebase....`);
      return this.isConnected();
    })
    .then((isConnected) => {
      if (!isConnected) {
        throw new MMDLError('not-connected-to-firebase');
      }

      logHelper.log(`Telling Firebase server is now running....`);
      return this.setServerRunning();
    })
    .then(() => {
      logHelper.log(`Starting server heartbeat....`);
      return this._startServerHeartbeat();
    })
    .then(() => {
      logHelper.log('Starting server loop...');
      this._firebaseDb.database.ref(`lab/${this._labName}/loop-speed`)
      .on('value', (snapshot) => {
        let newValue = snapshot.val();
        if (typeof newValue !== 'number') {
          logHelper.warn(`The 'loop-speed' for '${this._labName}' is not a ` +
            `number. Please correct this.`);
          newValue = DEFAULT_LOOP_SPEED_SECS;
        } else {
          logHelper.log(`Changing loop-speed to '${newValue}'`);
        }

        this._loopBehavior.changeSpeed(newValue);
      });
      this._loopBehavior.startLoop();
    });
  }

  stop() {
    this._loopBehavior.stopLooping();
  }

  _onLoopIteration() {
    logHelper.log('Starting new loop iteration');

    return Promise.all([
      this.getLoopIndex(),
      this.getUrls(),
    ])
    .then((results) => {
      let loopIndex = results[0];
      const urls = results[1];

      logHelper.log(`    loopIndex: ${loopIndex}`);
      logHelper.log(`    url count: ${urls.length}`);

      if (urls.length === 0) {
        logHelper.warn('No URLs to loop over.');
        return;
      }

      if (loopIndex >= urls.length) {
        loopIndex = 0;
      }

      const newLoopIndex = (loopIndex + 1) % urls.length;
      const newUrl = urls[newLoopIndex];

      logHelper.log(`    newLoopIndex: ${newLoopIndex}`);
      logHelper.log(`    newUrl: ${newUrl}`);

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
