const path = require('path');
const logHelper = require('./utils/log-helper');
const MMDLError = require('./models/mmdl-error');
const getFirebaseDb = require('./models/firebase-db-singleton');
const ServerController = require('./controllers/server-controller');
const ClientController = require('./controllers/client-controller');

class MMDLCLI {
  argv(meowOutput) {
    if (typeof meowOutput.flags.config !== 'string') {
      throw new MMDLError('no-config-file');
    }
    if (typeof meowOutput.flags.serviceAccount !== 'string') {
      throw new MMDLError('no-service-account-file');
    }
    if (typeof meowOutput.flags.labName !== 'string') {
      throw new MMDLError('no-lab-name');
    }

    const config = this._loadConfigFile(meowOutput.flags.config);
    const serviceAccount = this._loadServiceAccountFile(
      meowOutput.flags.serviceAccount);
    this._validateConfig(config);

    let firebaseDb = getFirebaseDb(config, serviceAccount);
    if (meowOutput.flags.server) {
      let serverController = new ServerController(
        firebaseDb, meowOutput.flags.labName);
      return serverController.start();
    } else {
      let clientController = new ClientController(
        firebaseDb, meowOutput.flags.labName);
      return clientController.start();
    }
  }

  _loadConfigFile(configPath) {
    logHelper.log(`Reading config from: `,
        path.relative(process.cwd(), configPath));

    if (!path.isAbsolute(configPath)) {
      configPath = path.join(process.cwd(), configPath);
    }

    try {
      return require(configPath);
    } catch (err) {
      if (err.name === 'SyntaxError') {
        throw err;
      } else {
        throw new MMDLError('cant-read-config-file', {
          configPath,
          originalError: err,
        });
      }
    }
  }

  _validateConfig(config = {}) {
    const keys = ['apiKey', 'authDomain', 'databaseURL'];
    keys.forEach((key) => {
      const value = config[key];
      if(typeof value !== 'string' || value.length === 0) {
        throw new MMDLError('required-config-value-missing', {
          key,
          value,
        });
      }
    });
  }

  _loadServiceAccountFile(serviceAccountPath) {
    logHelper.log(`Reading service account private key from: `,
        path.relative(process.cwd(), serviceAccountPath));

    if (!path.isAbsolute(serviceAccountPath)) {
      serviceAccountPath = path.join(process.cwd(), serviceAccountPath);
    }

    try {
      return require(serviceAccountPath);
    } catch (err) {
      if (err.name === 'SyntaxError') {
        throw err;
      } else {
        throw new MMDLError('cant-read-service-account-file', {
          serviceAccountPath,
          originalError: err,
        });
      }
    }
  }
}

module.exports = MMDLCLI;
