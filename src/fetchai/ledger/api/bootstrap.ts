import axios from 'axios'
import {IncompatibleLedgerVersionError, NetworkUnavailableError, RunTimeError} from '../errors'
import * as semver from 'semver'
import {__version__} from '../init'

type Tuple = [string, number];
type AddressTuple = [string, string, number];


//todo ask fitzgerald if patch is number. or test oneself then remove.
interface ServerListItem {
    readonly name: string;
    readonly  versions: string;
    readonly patch: number;
    readonly build: string;
    readonly prerelease: string;
}

export class Bootstrap {

    static async list_servers(active = true): Promise<Array<ServerListItem>> {
        //Gets list of (active) servers from bootstrap network
        const params = (active) ? {'active': 1} : {}

        let resp
        try {
            resp = await axios({
                method: 'get',
                url: 'https://bootstrap.fetch.ai/networks/',
                params: params
            })
        } catch (error) {
            throw new NetworkUnavailableError('Failed to get network status from bootstrap')
        }

        if (200 !== resp.status) {
            throw new NetworkUnavailableError('Failed to get network status from bootstrap')
        }

        return resp.data
    }

    static is_server_valid(server_list: Array<ServerListItem>, network: string): boolean {

        const available_servers = server_list.map(a => a.name)
        // Check requested server is on list
        if (!available_servers.includes(network)) {
            throw new NetworkUnavailableError(`Requested server not present on network: ${network}`)
        }

        let server_details

        for (let i = 0; i < server_list.length; i++) {
            if (typeof server_list[i]['name'] !== 'undefined' && server_list[i]['name'] === network) {
                server_details = server_list[i]
                break
            }
        }
        let invalid_flag = false

        if (server_details['versions'] !== '*') {
            const version_constraints = server_details['versions'].split(',')
            //todo are these noew needed with the interface
            if (typeof server_details['prerelease'] !== 'undefined') invalid_flag = true
            if (typeof server_details['build'] !== 'undefined') invalid_flag = true
            if (typeof server_details['patch'] !== 'undefined' && server_details['patch'] !== 0) invalid_flag = true
            if (!semver.satisfies(semver.coerce(__version__), version_constraints.join(' '))) invalid_flag = true
            if (invalid_flag) {
                throw new IncompatibleLedgerVersionError(`Requested network does not support required version\n
                                            Required version: ${semver.coerce(__version__)}\nNetwork supports: ${version_constraints.join(' ')}`
                )
            }
        }
        return true
    }

    static async get_ledger_address(network: string): Promise<string> {
        // Request server endpoints
        const params = {'network': network}

        let endpoints_response
        try {
            endpoints_response = await axios({
                method: 'get',
                url: 'https://bootstrap.fetch.ai/endpoints',
                params: params
            })
        } catch (error) {
            throw new NetworkUnavailableError('Failed to get network endpoint from bootstrap')
        }

        if (200 !== endpoints_response.status) {
            throw new NetworkUnavailableError('Failed to get network status from bootstrap, incorrect status code received')
        }

        if (typeof endpoints_response.data[0].address === 'undefined') {
            throw new RunTimeError('Ledger endpoint missing address')
        }

        return endpoints_response.data[0].address
    }

    /**
     *Splits a url into a protocol, host name and port
     * @param address
     */
    static split_address(address: string): AddressTuple {
        let protocol, port

        if (address.includes('://')) {
            [protocol, address] = address.split('://')
        } else {
            protocol = 'http'
        }
        if (address.includes(':')) {
            [address, port] = address.split(':')
            port = parseInt(port)
        } else {
            port = (protocol == 'https') ? 443 : 8000
        }

        return [protocol, address, port]
    }


    /**
     * Queries bootstrap for the requested network and returns connection details
     * @param network
     */


    static async server_from_name(network: string): Promise<Tuple> {
        //Get list of active servers
        const server_list = await Bootstrap.list_servers(true)
        // Check requested network exists and supports our ledger version
        Bootstrap.is_server_valid(server_list, network)
        // Get address of network ledger
        const ledger_address = await Bootstrap.get_ledger_address(network)
        // Check if address contains a port
        const [protocol, host, port] = Bootstrap.split_address(ledger_address)
        return [`${protocol}://${host}`, port]
    }
}
