const EventEmitter = require('events');

const logHelper = require('../utils/log-helper');

class LoopBehavior extends EventEmitter {
  constructor(durationInSeconds) {
    super();

    this._running = false;
    this._loopDuration = durationInSeconds * 1000;
    this._loopTimeoutId = null;
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
