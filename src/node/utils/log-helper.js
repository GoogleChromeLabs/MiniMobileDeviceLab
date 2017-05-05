const chalk = require('chalk');

const MMDLError = require('../models/mmdl-error');

/* eslint-disable no-console */

class LogHelper {
  log(...args) {
    console.log(chalk.dim('[Info]'), ...args);
  }

  warn(...args) {
    console.warn(chalk.yellow('[Warn]'), ...args);
  }

  error(...args) {
    if (args[0] instanceof MMDLError) {
      const error = args.splice(0, 1)[0];
      console.error(`${chalk.red('[Error]')} ${chalk.red(error.message)}` +
        ` ${chalk.gray('(' + error.code + ')')}`);
      if (error.stack) {
        console.error(`${chalk.red('[Error] Stack Trace -')}`, error.stack);
      }
      if (args.length > 0) {
        console.error(`${chalk.red('[Error]')}`, args);
      }
    } else {
      console.error(chalk.red('[Error]'), ...args);
    }
  }
}

module.exports = new LogHelper();
