const ControllerInterface = require('./controller-interface');
const MMDLError = require('../models/mmdl-error');
const logHelper = require('../utils/log-helper');
const LoopBehavior = require('../models/loop-behavior');
const LabModel = require('../models/lab-model');

class ServerController extends ControllerInterface {
  constructor(firebaseDb, labId) {
    super(firebaseDb, labId, 'server');

    logHelper.log(`Starting '${labId}' server....`);

    this._debug = false;
    this._loopBehavior = new LoopBehavior();
    this._loopBehavior.on('loop-iteration', () => this._onLoopIteration());

    this._labModel = new LabModel(firebaseDb, labId);
    this._labModel.on('loop-speed-change', (newValue) => {
      logHelper.log(`Changing loop-speed to '${newValue}'`);
      this._loopBehavior.changeSpeedSecs(newValue);
    });
  }

  start() {
    logHelper.log(`Checking if '${this._labId}' is already running....`);
    return super.start()
    .then(() => {
      return this._labModel.isServerRunning();
    })
    .then((isRunning) => {
      if (isRunning) {
        throw new MMDLError('server-already-running');
      }

      logHelper.log(`Marking '${this._labId}' as running....`);
      return this._labModel.markServerAsRunning();
    })
    .then(() => {
      return this._labModel.getLoopSpeedSecs();
    })
    .then((loopSpeedSecs) => {
      this._loopBehavior.changeSpeedSecs(loopSpeedSecs);

      logHelper.log('Starting server loop...');
      this._loopBehavior.startLoop();
    });
  }

  stop() {
    this._loopBehavior.stopLoop();
  }

  _onLoopIteration() {
    logHelper.log('Changing URL...');

    return Promise.all([
      this._labModel.getUrlIndex(),
      this._labModel.getUrls(),
    ])
    .then((results) => {
      let urlIndex = results[0];
      const urls = results[1];

      if (this._debug) {
        logHelper.log(`    Current urlIndex: ${urlIndex}`);
        logHelper.log(`    Current URL count: ${urls.length}`);
      }

      if (urls.length === 0) {
        if (this._debug) {
          logHelper.warn('No URLs to loop over.');
        }
        return;
      }

      if (urlIndex >= urls.length) {
        urlIndex = 0;
      }

      const newUrlIndex = (urlIndex + 1) % urls.length;
      const newUrl = urls[newUrlIndex];

      if (this._debug) {
        logHelper.log(`    New urlIndex: ${newUrlIndex}`);
        logHelper.log(`    New URL count: ${newUrl}`);
      }

      return Promise.all([
        this._labModel.setCurrentUrl(newUrl),
        this._labModel.setUrlIndex(newUrlIndex),
      ]);
    })
    .catch((err) => {
      logHelper.error('Unexpected error in loop-iteration.', err);
    });
  }
}

module.exports = ServerController;
