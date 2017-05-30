class ServerModel extends EventEmitter {
  constructor(firebaseDb, labId) {
    super();

    this._firebaseDb = firebaseDb;    
    this._labId = labId;

    this._firebaseDb.database.ref(`lab/${this._labId}/loop-speed`)
    .on('value', (snapshot) => {
      let newValue = snapshot.val();
      if (typeof newValue !== 'number') {
        logHelper.warn(`The 'loop-speed' for '${this._labId}' is not a ` +
          `number. Please correct this.`);
        return; 
      }
      this.emit('loop-speed-change', newValue);
    });
  }

  updateHeartbeat() {
    const fbMonitorRef = this._firebaseDb.database.ref('servers/' + deviceName);
    fbMonitorRef.child('serverHeartbeart').set(new Date().toString());
  }

  /**
   * Technically this is lab stuff
   */
  isServerRunning() {
    return this._firebaseDb.once(`lab/${this._labId}/server-running`)
    .then((value) => {
      return value ? true : false;
    });
  }

  markServerAsRunning() {
    const loopRunningRef = this._firebaseDb.database.ref(
      `lab/${this._labId}/server-running`);
    loopRunningRef.onDisconnect().remove();
    return loopRunningRef.set(true);
  }

  getUrls() {
    return this._firebaseDb.once(
      `lab/${this._labId}/urls`)
    .then((value) => {
      return value || [];
    });
  }

  setUrl(newUrl) {
    const loopIndexRef = this._firebaseDb.database.ref(
      `lab/${this._labId}/current-url`);
    return loopIndexRef.set(newUrl);
  }

  getLoopIndex() {
    return this._firebaseDb.once(`lab/${this._labId}/index`)
    .then((value) => {
      return value || -1;
    });
  }

  setLoopIndex(newLoopIndex) {
    const loopIndexRef = this._firebaseDb.database.ref(
      `lab/${this._labId}/index`);
    return loopIndexRef.set(newLoopIndex);
  }
}