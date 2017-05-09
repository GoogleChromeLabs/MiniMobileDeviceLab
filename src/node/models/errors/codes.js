module.exports = {
  'no-config-file': {
    message: `You must define a config file in the CLI to use MMDL.`,
  },
  'cant-read-config-file': {
    message: (extras = {}) => {
      return `Unable to read config file at: '${extras.configPath}'.`;
    },
  },
  'required-config-value-missing': {
    message: (extras = {}) => {
      return `The required config value '${extras.key}' was not found ` +
        `or invalid in your config file. Current value is '${extras.value}'.`;
    },
  },
  'no-service-account-file': {
    message: `You must define a serice account private key file in the CLI ` +
      `to use MMDL.`,
  },
  'cant-read-service-account-file': {
    message: (extras = {}) => {
      return `Unable to read service account private key file at: ` +
        `'${extras.serviceAccountPath}'.`;
    },
  },
  'server-already-running': {
    message: `The Device Lab server is already running.`,
  },
  'server-controller-no-firebase-db': {
    message: `You must supply an instance of the FirebaseDBSingleton to the ` +
      `ServerController constructor.`,
  },
};
