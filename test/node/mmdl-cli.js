const expect = require('chai').expect;
const path = require('path');

const CLI = require('../../src/node/cli');

const EXAMPLE_CONFIG = {
  'apiKey': 'example-api-key',
  'authDomain': 'example-auth-domain.firebaseapp.com',
  'databaseURL': 'example-db-url.firebaseio.com',
};

describe('Test MMDL CLI', function() {
  it('should on no config', function() {
    expect(function() {
      const cli = new CLI();
      cli.argv({flags: {}});
    }).to.throw().property('code', 'no-config-file');
  });

  it('should throw error on non-existant config', function() {
    expect(function() {
      const cli = new CLI();
      cli.argv({flags: {
        'config': path.join(__dirname, '../static/no-file-here.json'),
        'serviceAccount': path.join(__dirname, '../static/no-file-here.json'),
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

  it('should handle no config values for validation', function() {
    expect(function() {
      const cli = new CLI();
      cli._validateConfig();
    }).to.throw().property('code', 'required-config-value-missing');
  });

  it('should handle empty config values for validation', function() {
    expect(function() {
      const cli = new CLI();
      cli._validateConfig({});
    }).to.throw().property('code', 'required-config-value-missing');
  });

  it('should handle nonsense config values for validation', function() {
    expect(function() {
      const cli = new CLI();
      cli._validateConfig({
        'apiKey': true,
        'authDomain': true,
        'databaseURL': true,
      });
    }).to.throw().property('code', 'required-config-value-missing');
  });

  it('should handle empty string config values for validation', function() {
    expect(function() {
      const cli = new CLI();
      cli._validateConfig({
        'apiKey': '',
        'authDomain': '',
        'databaseURL': '',
      });
    }).to.throw().property('code', 'required-config-value-missing');
  });

  it('should throw on missing key for validation', function() {
    expect(function() {
      const cli = new CLI();
      cli._validateConfig({
        'apiKey': 'example-api-key',
        'authDomain': 'example-auth-domain.firebaseapp.com',
        'databasURL': 'example-db-url.firebaseio.com',
      });
    }).to.throw().property('code', 'required-config-value-missing');
  });

  it('should handle empty string config values for validation', function() {
    expect(function() {
      const cli = new CLI();
      cli._validateConfig({
        'apiKey': 'example-api-key',
        'authDomain': 'example-auth-domain.firebaseapp.com',
        'databaseURL': 'example-db-url.firebaseio.com',
      });
    }).to.not.throw();
  });

  it('should handle no service account input', function() {
    expect(function() {
      const cli = new CLI();
      cli.argv({flags: {
        'config': './test/static/example-config.json',
      }});
    }).to.throw().property('code', 'no-service-account-file');
  });

  it('should handle bad service account input', function() {
    expect(function() {
      const cli = new CLI();
      cli.argv({flags: {
        'config': './test/static/example-config.json',
        'serviceAccount': path.join(__dirname, '../static/no-file-here.json'),
      }});
    }).to.throw().property('code', 'cant-read-service-account-file');
  });

  it('should load valid full path service account file', function() {
    const cli = new CLI();
    const config = cli._loadServiceAccountFile(
      path.join(__dirname, '../static/example-config.json')
    );
    expect(config).to.deep.equal(EXAMPLE_CONFIG);
  });

  it('should throw for valid path but malformed service account file',
    function() {
    expect(function() {
      const cli = new CLI();
      cli._loadServiceAccountFile(
        path.join(__dirname, '../static/malformed-config.json')
      );
    }).to.throw().property('name', 'SyntaxError');
  });

  it('should load valid relative path service account file', function() {
    const cli = new CLI();
    // Assume the CWD is the root of the project.
    const config = cli._loadServiceAccountFile(
      './test/static/example-config.json'
    );
    expect(config).to.deep.equal(EXAMPLE_CONFIG);
  });
});
