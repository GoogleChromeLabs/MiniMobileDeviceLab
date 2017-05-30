const EventEmitter = require('events');

const logHelper = require('../utils/log-helper');

const DEFAULT_LOOP_SPEED_SECS = 10;

class LoopBehavior extends EventEmitter {
  constructor(labId) {
    super();

    this._running = false;
    this._loopDuration = DEFAULT_LOOP_SPEED_SECS * 1000;
    this._loopTimeoutId = null;
  }

  changeSpeed(durationInSeconds) {
    this._loopDuration = durationInSeconds * 1000;

    if (this._running) {
      this._onLoop();
    }
  }

  startLoop() {
    this._running = true;
    if (this._loopTimeoutId) {
      logHelper.warn('startLoop called when already looping.');
      return;
    }

    this._onLoop();
  }

  stopLooping() {
    this._running = false;
    if (this._loopTimeoutId) {
      clearTimeout(this._loopTimeoutId);
    }
  }

  _onLoop() {
    if (this._loopTimeoutId) {
      clearTimeout(this._loopTimeoutId);
    }

    this._loopTimeoutId = setTimeout(() => {
      if (!this._running) {
        return;
      }

      this.emit('loop-iteration');

      this._onLoop();
    }, this._loopDuration);
  }
}

module.exports = LoopBehavior;
