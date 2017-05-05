const errorCodes = require('./errors/codes.js');

class MMDLError extends Error {
  constructor(errorCode, extra = {}) {
    super();

    // Forces node to use MMDLError when printing stack trace.
    Object.defineProperty(this, 'name', {
      value: `MMDLError`,
    });

    Error.captureStackTrace(this, this.constructor);

    // Log helper will print out the error code.
    this.code = errorCode;

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
