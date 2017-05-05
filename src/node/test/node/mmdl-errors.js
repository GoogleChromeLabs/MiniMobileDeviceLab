describe('Test MMDLError', function() {
  it('should construct an empty error', function() {
    new MMDLError();
  });

  it('should construct with an invalid error code', function() {
    new MMDLError('1234-doesnt-exist-5678');
  });

  it('should construct with a valid code', function() {
    new MMDLError('no-config-file');
  });
});
