import * as semver from 'semver'
import {__compatible__} from '../init'
import {ApiError} from '../errors/apiError'
import {ContractsApi} from './contracts'
import {IncompatibleLedgerVersionError, ValidationError} from '../errors'
import {RunTimeError} from '../errors/runTimeError'
import {ServerApi} from './server'
import {TokenApi} from './token'
import {TransactionApi} from './tx'
import {Bootstrap} from './bootstrap'

const DEFAULT_TIMEOUT = 120000

/**
 * This class for all ledger APIs.
 *
 * @public
 * @class
 */
export class LedgerApi {
    /**
     * @param  {Boolean} host ledger host.
     * @param  {Boolean} port ledger port.
     * @param  {Boolean} network server name.
     */
    constructor(host = false, port = false, network = false) {
        if (network) {
            if (host !== false || port !== false) {
                throw new ValidationError(
                    'Specify either a server name, or a host & port'
                )
            }
            [host, port] = Bootstrap.server_from_name(network)
        } else if (host === false || port === false) {
            throw new ValidationError(
                'Must specify either a server name, or a host & port'
            )
        }
        this.tokens = new TokenApi(host, port, this)
        this.contracts = new ContractsApi(host, port, this)
        this.tx = new TransactionApi(host, port, this)
        this.server = new ServerApi(host, port, this)
    }

    /** Sync the ledger.
     * this does not block event loop, but waits sync for return of executed
     * digest using a timeout, wrapped in a promise that resolves when we get executed status in response, or
     * rejects if timeouts.
     * @async
     * @method
     * @param  {String} txs transactions string.
     * @param  {Boolean} [timeout=false] units seconds.
     * @returns {Promise} return asyncTimerPromise.
     * @throws {TypeError|RunTimeError} TypeError or RunTimeError on any failures.
     */
    async sync(txs, timeout = false) {
        if (typeof txs === 'string') {
            txs = [txs]
        }
        const limit = timeout === false ? DEFAULT_TIMEOUT : timeout * 1000
        if (!Array.isArray(txs) || !txs.length) {
            throw new TypeError('Unknown argument type')
        }
        const asyncTimerPromise = new Promise(resolve => {
            const start = Date.now()

            const loop = setInterval(async () => {
                if (txs.length === 0) {
                    clearInterval(loop)
                    return resolve(true)
                }
                let res
                for (let i = 0; i < txs.length; i++) {
                    try {
                        res = await this._poll(txs[i].txs[0])
                    } catch (e) {
                        if (!(e instanceof ApiError)) {
                            throw e
                        }
                    }
                    // we expect failed requests to return null, or throw an ApiError
                    if (res === true) {
                        txs.splice(i, 1)
                        i--
                    }
                }
                let elapsed_time = Date.now() - start

                if (elapsed_time >= limit) {
                    throw new RunTimeError('Timeout exceeded waiting for txs')
                }
            }, 100)
        })
        return asyncTimerPromise
    }

    async _poll(digest) {
        let status = await this.tx.status(digest)

        if(status.status === "Fatal Error") debugger;

        console.log('status is', status.status)
        return /Executed|Submitted/.test(status.status)
    }

    static async from_network_name(host, port) {
        const server = new ServerApi(host, port)
        const server_version = await server.version()
        if (
            !semver.satisfies(
                semver.coerce(server_version),
                __compatible__.join(' ')
            )
        ) {
            throw new IncompatibleLedgerVersionError(`Ledger version running on server is not compatible with this API  \n
                                                 Server version: ${server_version} \nExpected version: ${__compatible__.join(
    ','
)}`)
        }
        return true
    }
}
