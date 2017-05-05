const getErrorDetails = require('../utils/error-details');
const errorCodes = require('./errors/codes.js');

class MMDLError extends Error {
  constructor(errorCode, extra = {}) {
    super();

    Error.captureStackTrace(this, this.constructor);

    this.name = errorCode;
    if (extra) {
      this.extra = extra;
    }

    // Handle the scenario where the template string should be shared
    const errorDetails = errorCodes[errorCode];
    if (errorDetails) {
      if (typeof errorDetails.message === 'function') {
        this.message = errorDetails.message(extra);
      } else {
        this.message = errorDetails.message;
      }
    } else {
      this.message = errorCode;
    }
  }
}

module.exports = MMDLError;
