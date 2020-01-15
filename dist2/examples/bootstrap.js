"use strict";

var _api = require("../fetchai/ledger/api");

const SERVER_NAME = 'delta'; // todo: explain active var

const ACTIVE = true;

async function main() {
  let host, port, server_list;

  try {
    /**
     * Get a list of the names of available servers on the Bootstrap network.
     * The Bootstrap network is a way of finding public nodes on the network to connect to.
     */
    server_list = await _api.Bootstrap.list_servers(ACTIVE);
  } catch (e) {
    throw new Error(`Unable to list servers: ${e}`);
  }

  log_servers(server_list);

  try {
    /**
    * From a named server we can then determine the host and port by which it can be connected to.
     **/
    [host, port] = await _api.Bootstrap.server_from_name(SERVER_NAME);
  } catch (e) {
    throw new Error(`Unable to find find server ${SERVER_NAME} having encountered error: ${e}`);
  }

  console.log(`\n Server ${SERVER_NAME} is available at host: ${host} and port: ${port}`);
}

function log_servers(server_list) {
  const available_servers = server_list.map(a => a.name).reduce((accumulator, current, index, array) => {
    let separator = index === array.length - 1 ? ' and ' : ', ';
    return accumulator + separator + current;
  });
  console.log('The following servers are available: ' + available_servers);
}

main();