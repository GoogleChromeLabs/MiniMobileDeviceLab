(function() {
  var Auth, Promise, forge, fs, pkg, program;

  fs = require('fs');

  program = require('commander');

  Promise = require('bluebird');

  forge = require('node-forge');

  pkg = require('../package');

  Auth = require('./adb/auth');

  Promise.longStackTraces();

  program.version(pkg.version);

  program.command('pubkey-convert <file>').option('-f, --format <format>', 'format (pem or openssh)', String, 'pem').description('Converts an ADB-generated public key into PEM format.').action(function(file, options) {
    return Auth.parsePublicKey(fs.readFileSync(file)).then(function(key) {
      switch (options.format.toLowerCase()) {
        case 'pem':
          return console.log(forge.pki.publicKeyToPem(key).trim());
        case 'openssh':
          return console.log(forge.ssh.publicKeyToOpenSSH(key, 'adbkey').trim());
        default:
          console.error("Unsupported format '" + options.format + "'");
          return process.exit(1);
      }
    });
  });

  program.command('pubkey-fingerprint <file>').description('Outputs the fingerprint of an ADB-generated public key.').action(function(file) {
    return Auth.parsePublicKey(fs.readFileSync(file)).then(function(key) {
      return console.log('%s %s', key.fingerprint, key.comment);
    });
  });

  program.parse(process.argv);

}).call(this);
