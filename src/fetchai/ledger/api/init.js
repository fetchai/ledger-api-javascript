import * as semver from 'semver'
import {__compatible__} from '../init'
import {ApiError} from '../errors/apiError'
import {ContractsApi} from './contracts'
import {IncompatibleLedgerVersionError, ValidationError} from '../errors'
import {RunTimeError} from '../errors/runTimeError'
import {ServerApi} from './server'
import {TokenApi} from './token'
import {TransactionApi, TxStatus} from './tx'
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

    /**
     *  Sync the ledger.
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
    async sync(txs, timeout = false, hold_state_sec = 0, extend_success_status = []) {
        if (!Array.isArray(txs)) {
            txs = [txs]
        }
        const limit = timeout === false ? DEFAULT_TIMEOUT : timeout * 1000
        if (!Array.isArray(txs) || !txs.length) {
            throw new TypeError('Unknown argument type')
        }

        const failed = []
        // successful transactions are out in this waiting array, and then if they remain successful
        // for a time period equal to hold_state_sec they are removed and considered successful. This is
        // because certain transactions can change from successful to not, so we revert if this occurs.
        const waiting = []

        const asyncTimerPromise = new Promise((resolve, reject) => {

            const start = Date.now()

            const loop = setInterval(async () => {
                if (txs.length === 0) {
                    clearInterval(loop)

                    if (failed.length) {
                        return reject(failed)
                    } else {
                        return resolve(true)
                    }


                }
                let successful_tx;
                // we poll all of the digests.
                //debugger;
                txs = await this.poll(txs)

                for (let i = 0; i < txs.length; i++) {

                    // if failed we push into array of failed and go to next one.
                    if (txs[i].failed()) {
                        failed.push(txs[i])
                        txs.splice(i, 1)
                        i--
                        continue;
                    }


                    if (txs[i].non_terminal()) {
                        // if a transaction reverts its status to a non-terminal state within hold time then revert.
                        let index = waiting.findIndex(item => (Date.now - item.time) < hold_state_sec && item.tx_status.get_digest_hex() === txs[i].get_digest_hex())

                        if (index !== -1) {
                            waiting.splice(index, 1)
                        }
                    }

                    if (txs[i].successful() || extend_success_status.includes(txs[i].get_status())) {
                        let index = waiting.findIndex(item => {
                            const x = Date.now() - item.time;
                            return x > hold_state_sec && item.tx_status.get_digest_hex() === txs[i].get_digest_hex()
                        })

                        if (index !== -1) {
                            // splice it out of the array if successful
                            txs.splice(i, 1)
                            i--;
                        } else {
                            // check if it is currently waiting for hold time to elapse.
                            let index = waiting.findIndex(item => {

                                let x = item.tx_status.get_digest_hex();
                                return txs[i].get_digest_hex() === x
                            })
                            if (index === -1) {
                                waiting.push({time: Date.now(), tx_status: txs[i]})
                            }
                        }
                    }

                }

                let elapsed_time = Date.now() - start

                if (elapsed_time >= limit) {
                    // and return all those which still have not.
                    failed.concat(txs)
                    return reject(failed)
                    // throw new RunTimeError('Timeout exceeded waiting for txs')
                }
            }, 100)
        })
        return asyncTimerPromise
    }

    async poll(txs) {
        let tx_status;
        const res = [];

        for (let i = 0; i < txs.length; i++) {
            try {
                if (txs[i] instanceof TxStatus) {
                    tx_status = await this.tx.status(txs[i].get_digest_hex());
                } else {
                    tx_status = await this.tx.status(txs[i].txs[0]);
                }
                res.push(tx_status);
            } catch (e) {
// if wedon't fail whole thing then we must push it into it to keep arrays same length.
                if (!(e instanceof ApiError)) {
                    throw e
                }
            }
        }
        return res;
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
