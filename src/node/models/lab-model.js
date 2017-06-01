const EventEmitter = require('events');

const logHelper = require('../utils/log-helper');

const DEFAULT_LOOP_SPEED_SECS = 10;
const SEGMENT = {
  LABS: 'labs',
  LOOP_SPEED: 'loop-speed-secs',
  SERVER_RUNNING: 'server-running',
  URLS: 'urls',
  CURRENT_URL: 'current-url',
  URL_INDEX: 'url-index',
};

const LOOP_SPEED_CHANGE = 'loop-speed-change';

class LabModel extends EventEmitter {
  constructor(firebaseDb, labId) {
    super();

    this._firebaseDb = firebaseDb;
    this._labId = labId;

    this._firebaseDb.database.ref([
      SEGMENT.LABS, this._labId, SEGMENT.LOOP_SPEED,
    ].join('/'))
    .on('value', (snapshot) => {
      let newValue = snapshot.val();
      if (typeof newValue !== 'number') {
        if (newValue !== null) {
          logHelper.warn(`The '${SEGMENT.LOOP_SPEED}' has changed for ` +
            `'${this._labId}' but is not a number. Please correct this.`);
        }
        return;
      }
      this.emit(LOOP_SPEED_CHANGE, newValue);
    });
  }

  getLoopSpeedSecs() {
    return this._firebaseDb.once([
      SEGMENT.LABS, this._labId, SEGMENT.LOOP_SPEED,
    ].join('/'))
    .then((loopSpeed) => {
      if (typeof loopSpeed !== 'number') {
        if (loopSpeed !== null) {
          logHelper.warn(`The '${SEGMENT.LOOP_SPEED}' for '${this._labId}' ` +
            `is not a  number, using default instead. Please correct this.`);
        }
        return DEFAULT_LOOP_SPEED_SECS;
      }

      return loopSpeed;
    });
  }

  isServerRunning() {
    return this._firebaseDb.once([
      SEGMENT.LABS, this._labId, SEGMENT.SERVER_RUNNING,
    ].join('/'))
    .then((value) => {
      return value ? true : false;
    });
  }

  markServerAsRunning() {
    const loopRunningRef = this._firebaseDb.database.ref([
      SEGMENT.LABS, this._labId, SEGMENT.SERVER_RUNNING,
    ].join('/'));
    loopRunningRef.onDisconnect().remove();
    return loopRunningRef.set(true);
  }

  getUrls() {
    return this._firebaseDb.once([
      SEGMENT.LABS, this._labId, SEGMENT.URLS,
    ].join('/'))
    .then((value) => {
      if (!Array.isArray(value)) {
        if (value !== null) {
          logHelper.warn(`The '${SEGMENT.URLS}' for '${this._labId}' is not ` +
            `an Array. Please correct this.`);
        }
        return [];
      }
      return value;
    });
  }

  setCurrentUrl(newUrl) {
    if (typeof newUrl !== 'string' && newUrl !== null) {
      logHelper.warn(`The '${SEGMENT.CURRENT_URL}' value for ` +
        `'${this._labId}' must be null or a string. Received: ` +
        `'${JSON.stringify(newUrl)}'`);
      return;
    }

    const loopIndexRef = this._firebaseDb.database.ref([
      SEGMENT.LABS, this._labId, SEGMENT.CURRENT_URL,
    ].join('/'));
    return loopIndexRef.set(newUrl);
  }

  getCurrentUrl() {
    return this._firebaseDb.once([
      SEGMENT.LABS, this._labId, SEGMENT.CURRENT_URL,
    ].join('/'))
    .then((value) => {
      if (typeof value !== 'string') {
        if (value !== null) {
          logHelper.warn(`The '${SEGMENT.CURRENT_URL}' value for ` +
            `'${this._labId}' must be a string. Please correct this.`);
        }

        return null;
      }

      return value;
    });
  }

  getUrlIndex() {
    return this._firebaseDb.once([
      SEGMENT.LABS, this._labId, SEGMENT.URL_INDEX,
    ].join('/'))
    .then((value) => {
      if (typeof value !== 'number') {
        if (value !== null) {
          logHelper.warn(`The '${SEGMENT.URL_INDEX}' value for ` +
            `'${this._labId}' must be a numer. Please correct this.`);
        }
        return -1;
      }

      return value;
    });
  }

  setUrlIndex(newLoopIndex) {
    if (typeof newLoopIndex !== 'number' && newLoopIndex !== null) {
      logHelper.warn(`The '${SEGMENT.URL_INDEX}' value for ` +
        `'${this._labId}' must be null or a number. Received: ` +
        `'${JSON.stringify(newLoopIndex)}'`);
      return;
    }

    const loopIndexRef = this._firebaseDb.database.ref([
      SEGMENT.LABS, this._labId, SEGMENT.URL_INDEX,
    ].join('/'));
    return loopIndexRef.set(newLoopIndex);
  }

  static initialiseFirebase(firebaseDb, labId) {
    const refPath = [SEGMENT.LABS, labId].join('/');
    return firebaseDb.once(refPath)
    .then((value) => {
      value = value || {};

      if (!value[SEGMENT.LOOP_SPEED]) {
        value[SEGMENT.LOOP_SPEED] = DEFAULT_LOOP_SPEED_SECS;
      }

      if (!value[SEGMENT.SERVER_RUNNING]) {
        value[SEGMENT.SERVER_RUNNING] = false;
      }

      if (!value[SEGMENT.URLS]) {
        value[SEGMENT.URLS] = {
          0: 'https://developers.google.com/web/',
        };
      }

      if (!value[SEGMENT.CURRENT_URL]) {
        value[SEGMENT.CURRENT_URL] = '';
      }

      if (!value[SEGMENT.URL_INDEX]) {
        value[SEGMENT.URL_INDEX] = -1;
      }

      return firebaseDb.database.ref(refPath).set(value);
    });
  }
}

module.exports = LabModel;
