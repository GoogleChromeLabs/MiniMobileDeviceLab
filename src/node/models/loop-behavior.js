const EventEmitter = require('events');

const logHelper = require('../utils/log-helper');

class LoopBehavior extends EventEmitter {
  constructor() {
    super();

    this._running = false;
    this._loopDuration = null;
    this._loopTimeoutId = null;
  }

  changeSpeedSecs(durationInSeconds) {
    if (typeof durationInSeconds !== 'number' || durationInSeconds <= 0) {
      throw new Error('LoopBehavior.changeSpeed() expected a number ' +
        'greater than zero.');
    }

    this._loopDuration = durationInSeconds * 1000;

    if (this._running) {
      this._onLoop();
    }
  }

  startLoop() {
    if (typeof this._loopDuration !== 'number') {
      throw new Error('LoopBehavior.startLoop() called before the speed was ' +
        'set.');
    }

    this._running = true;
    if (this._loopTimeoutId) {
      logHelper.warn('startLoop called when already looping.');
      return;
    }

    this._onLoop();
  }

  stopLoop() {
    this._running = false;
    if (this._loopTimeoutId) {
      clearTimeout(this._loopTimeoutId);
    }
    this._loopTimeoutId = null;
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
