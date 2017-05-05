const expect = require('chai').expect;

const MMDLError = require('../../src/node/models/mmdl-error');
const errorCodes = require('../../src/node/models/errors/codes');

describe('Test MMDLError', function() {
  it('should construct an empty error', function() {
    new MMDLError();
  });

  it('should construct with an invalid error code', function() {
    new MMDLError('1234-doesnt-exist-5678');
  });

  it('should construct with a valid code', function() {
    const error = new MMDLError('no-config-file');
    expect(error.name).to.equal('MMDLError');
    expect(error.code).to.equal('no-config-file');
    expect(error.message).to.equal(errorCodes['no-config-file'].message);
  });

  it('should construct with a valid code and function', function() {
    const error = new MMDLError('cant-read-config-file');
    expect(error.name).to.equal('MMDLError');
    expect(error.code).to.equal('cant-read-config-file');
    expect(error.message).to.equal(
      errorCodes['cant-read-config-file'].message());
  });

  it('should construct with a valid code and function with args', function() {
    const extras = {
      configPath: './example/test.json',
    };
    const error = new MMDLError('cant-read-config-file', extras);
    expect(error.name).to.equal('MMDLError');
    expect(error.code).to.equal('cant-read-config-file');
    expect(error.message).to.equal(
      errorCodes['cant-read-config-file'].message(extras)
    );
  });
});
