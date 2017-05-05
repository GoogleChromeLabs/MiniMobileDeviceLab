const path = require('path');
const logHelper = require('./utils/log-helper');
const MMDLError = require('./models/mmdl-error');
// Read in a config file
//     OR
// No file, ask for details?

class MMDLCLI {
  argv(meowOutput) {
    if (typeof meowOutput.flags.config !== 'string') {
      throw new MMDLError('no-config-file');
    }

    const config = this._loadConfigFile(meowOutput.flags.config);
    logHelper.log(config);
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
}

module.exports = MMDLCLI;
