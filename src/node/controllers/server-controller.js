const ControllerInterface = require('./controller-interface');
const MMDLError = require('../models/mmdl-error');
const logHelper = require('../utils/log-helper');
const LoopBehavior = require('../models/loop-behavior');
const ServerModel = require('../models/server-model');

class ServerController extends ControllerInterface {
  constructor(firebaseDb, labId) {
    super(firebaseDb, labId);

    logHelper.log(`Starting '${labId}' server....`);

    this._loopBehavior = new LoopBehavior();
    this._loopBehavior.on('loop-iteration', () => this._onLoopIteration());

    this._serverModel = new ServerModel(firebaseDb, labId);
    this._serverModel.on('loop-speed-change', (newValue) => {
      logHelper.log(`Changing loop-speed to '${newValue}'`);
      this._loopBehavior.changeSpeed(newValue);
    });
  }

  start() {
    logHelper.log(`Checking if '${this._labId}' is already running....`);
    return this._serverModel.isServerRunning()
    .then((isRunning) => {
      if (isRunning) {
        throw new MMDLError('server-already-running');
      }

      logHelper.log(`Marking '${this._labId}' as running....`);
      return this._serverModel.markServerAsRunning();
    })
    .then(() => {
      logHelper.log(`Starting server heartbeat....`);
      return this._startServerHeartbeat();
    })
    .then(() => {
      logHelper.log('Starting server loop...');
      this._loopBehavior.startLoop();
    });
  }

  stop() {
    this._loopBehavior.stopLooping();
  }

  _onLoopIteration() {
    logHelper.log('Starting new loop iteration');

    return Promise.all([
      this._serverModel.getLoopIndex(),
      this._serverModel.getUrls(),
    ])
    .then((results) => {
      let loopIndex = results[0];
      const urls = results[1];

      logHelper.log(`    Current loopIndex: ${loopIndex}`);
      logHelper.log(`    Current URL count: ${urls.length}`);

      if (urls.length === 0) {
        logHelper.warn('No URLs to loop over.');
        return;
      }

      if (loopIndex >= urls.length) {
        loopIndex = 0;
      }

      const newLoopIndex = (loopIndex + 1) % urls.length;
      const newUrl = urls[newLoopIndex];

      logHelper.log(`    New loopIndex: ${newLoopIndex}`);
      logHelper.log(`    New URL count: ${newUrl}`);

      return Promise.all([
        this._serverModel.setUrl(newUrl),
        this._serverModel.setLoopIndex(newLoopIndex),
      ]);
    })
    .catch((err) => {
      logHelper.error('Unexpected error in loop-iteration.', err);
    });
  }

  _startServerHeartbeat() {
    let deviceName = this.getDeviceName();

    this._serverModel.updateHeartbeat();
    setInterval(function() {
      this._serverModel.updateHeartbeat();
    }, 90 * 1000);
  }
}

module.exports = ServerController;
