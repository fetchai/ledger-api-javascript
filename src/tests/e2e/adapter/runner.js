'use strict';

const execSync = require('child_process').execSync;

// defaults to run in node
const config = {
  browser: false,
};

let debug = "";

const argv = process.argv.slice(0, 2);
// Naive argv parsing
process.argv
  .reduce((cmd, arg) => {
    if (cmd) {
      config[cmd] = arg;
      return;
    }

    if (arg.startsWith('--')) {
      const sub = arg.substring('--'.length);
        if (sub === 'browser') {
          config.browser = true;
          console.log("config.browser = true;");
          return;
        } else if (sub === 'node') {
            config.browser = false;
            console.log("config.browser = false;");
          return;
        } else if(sub === "debug")
            debug = ":debug"
        return sub;
      }
    argv.push(arg)
  });
// Store configuration on env
process.env.__CONFIGURATION = JSON.stringify(config);

process.argv = argv;
console.log(JSON.stringify(argv))

 const output = execSync(`npm run singleTest${debug} src/tests/__tests__/serialization/test_transaction.js`, { encoding: 'utf-8' });
