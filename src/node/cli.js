// Read in a config file
//     OR
// No file, ask for details?

class MMDLCLI {
  argv(meowOutput) {
    if (!meowOutput.flags.config) {
      throw new MMDLError('no-config-file');
    }
    console.log(meowOutput);
  }
}

module.exports = MMDLCLI;
