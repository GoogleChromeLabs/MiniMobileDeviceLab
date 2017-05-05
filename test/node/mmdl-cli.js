const expect = require('chai').expect;
const path = require('path');

const CLI = require('../../src/node/cli');

const EXAMPLE_CONFIG = {
  urls: [
    'https://developers.google.com/web/',
    'https://google.com/',
  ],
};

describe('Test MMDL CLI', function() {
  it('should on no config', function() {
    expect(function() {
      const cli = new CLI();
      cli.argv({flags: {}});
    }).to.throw().property('code', 'no-config-file');
  });

  it('should on non-existant config', function() {
    expect(function() {
      const cli = new CLI();
      cli.argv({flags: {
        'config': path.join(__dirname, '../static/no-file-here.json'),
      }});
    }).to.throw().property('code', 'cant-read-config-file');
  });

  it('should load valid full path config file', function() {
    const cli = new CLI();
    const config = cli._loadConfigFile(
      path.join(__dirname, '../static/example-config.json')
    );
    expect(config).to.deep.equal(EXAMPLE_CONFIG);
  });

  it('should throw for valid path but malformed config file', function() {
    expect(function() {
      const cli = new CLI();
      cli._loadConfigFile(
        path.join(__dirname, '../static/malformed-config.json')
      );
    }).to.throw().property('name', 'SyntaxError');
  });

  it('should load valid relative path config file', function() {
    const cli = new CLI();
    // Assume the CWD is the root of the project.
    const config = cli._loadConfigFile(
      './test/static/example-config.json'
    );
    expect(config).to.deep.equal(EXAMPLE_CONFIG);
  });
});
