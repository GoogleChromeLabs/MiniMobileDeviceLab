module.exports = {
  'no-config-file': {
    message: `You must define a config file in the CLI to use MMDL.`,
  },
  'cant-read-config-file': {
    message: (extras = {}) => {
      return `Unable to read config file at: '${extras.configPath}'.`;
    },
  },
};
