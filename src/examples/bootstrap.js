import {Bootstrap} from '../fetchai/ledger/api'

// We provide several publicly available servers via our bootstrap network.
const SERVER_NAME = 'delta'
// todo: explain active var
const ACTIVE = true


async function main() {
    let host,
        port,
        server_list

    try {
        /**
         * Get a list of the names of available servers on the Bootstrap network
         * The Bootstrap network is a way on finding public nodes on the network to connect to.
         */
        server_list = await Bootstrap.list_servers(ACTIVE)
    } catch (e) {
        throw new Error(`Unable to list servers: ${e}`)
    }

    log_servers(server_list)

    try {
        /**
        * From a named server we can then determine a host and port it can be connected to via,
         * which is needed by our LedgerAPI class and interact with the ledger via this SDK.
         **/
        [host, port] = await Bootstrap.server_from_name(SERVER_NAME)
    } catch (e) {
        throw new Error(`Unable to find find server ${SERVER_NAME} having encountered error: ${e}`)
    }
    console.log(`\n Server ${SERVER_NAME} is available at host: ${host} and port: ${port}`)

}

/**
 * Log a list of the available servers.
 *
 * @param server_list
 */
function log_servers(server_list) {
    const available_servers = server_list
        .map(a => a.name)
        .reduce((accumulator, current, index, array) => {
            let separator = (index === array.length - 1) ? ' and ' : ', '
            return accumulator + separator + current
        })
    console.log('The following servers are available: ' + available_servers)
}

main()
