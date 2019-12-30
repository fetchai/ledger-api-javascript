import {Bootstrap} from '../fetchai/ledger/api'

// We provide several publicly available servers via our bootstrap network.
const SERVER_NAME = 'delta'
// todo: explain active var
const ACTIVE = true;


async function main() {
    let host,
        port,
        server,
        server_list;
    try {
        // Get a list of the names of available servers on the Bootstrap network
        server_list = await Bootstrap.list_servers(ACTIVE)
    } catch (e) {
        console.log(`Unable to list servers: ${e}`);
    }

    if (server_list) {
        log_servers(server_list)
    }

    try {
        /* From a named server we can then determine a host and port it can be connected to via,
        which is needed by our LedgerAPI class and interact with the ledger via this SDK. */
        [host, port] = await Bootstrap.server_from_name(SERVER_NAME)
    } catch (e) {
        console.log(`Unable to find find server ${SERVER_NAME} having encontered error: ${e}`);
    }

    if (server) {
        console.log(`\n Server ${SERVER_NAME} is available at host: ${host} and port: ${port}`)
    }
}

function log_servers(server_list) {
    const available_servers = server_list
        .map(a => a.name)
        .reduce((accumulator, current, index, array) => {
            let seperator = (index === array.length - 1) ? " and " : ", ";
            return accumulator + seperator + current
        })
    console.log("The following servers are available: " + available_servers);
}

main()
