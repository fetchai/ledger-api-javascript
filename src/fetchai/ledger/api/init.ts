import * as semver from 'semver'
import {__compatible__} from '../init'
import {ApiError} from '../errors/apiError'
import {ContractsApi} from './contracts'
import {IncompatibleLedgerVersionError} from '../errors'
import {ServerApi} from './server'
import {TokenApi} from './token'
import {TransactionApi, TxStatus} from './tx'

const DEFAULT_TIMEOUT = 120

interface WaitingTransactionItem {
     time: number,
      tx_status: TxStatus,
}

/**
 * This class for all ledger APIs.
 *
 * @public
 * @class
 */
export class LedgerApi {
	public tokens: TokenApi;
	public contracts: ContractsApi;
	public tx: TransactionApi;
	public server: ServerApi;

    /**
     * @param  {Boolean} host ledger host.
     * @param  {Boolean} port ledger port.
     * @param  {Boolean} network server name.
     */
    constructor(host, port) {
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
     */
    async sync(txs: Array<TxStatus | string> | string, timeout: number = DEFAULT_TIMEOUT, hold_state_sec: number = 0, extend_success_status: Array<string> = []) {

        if (!Array.isArray(txs) && typeof txs !== "string") {
            throw new TypeError('Unknown argument type')
        }

        if (!Array.isArray(txs)) {
            txs = [txs]
        }
        let limit = timeout*1000

        const failed : Array<TxStatus> = []
        // successful transactions are out in this waiting array, and then if they remain successful
        // for a time period equal to hold_state_sec they are removed and considered successful. This is
        // because certain transactions can change from successful to not, so we revert if this occurs.
        const waiting : Array<WaitingTransactionItem> = []

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
                // we poll all of the digests.

                    txs = await this.poll(txs as Array<TxStatus | string>)

                for (let i = 0; i < txs.length; i++) {

                    // if failed we push into array of failed and go to next one.
                    if ((txs[i] as TxStatus).failed()) {
                        failed.push(txs[i] as TxStatus)
                        txs.splice(i, 1)
                        i--
                        continue
                    }


                    if ((txs[i] as TxStatus).non_terminal()) {
                        // if a transaction reverts its status to a non-terminal state within hold time then revert.
                        let index = waiting.findIndex(item => (Date.now() - item.time) < hold_state_sec && item.tx_status.get_digest_hex() === (txs[i] as TxStatus).get_digest_hex())

                        if (index !== -1) {
                            waiting.splice(index, 1)
                        }
                    }

                    if ((txs[i] as TxStatus).successful() || extend_success_status.includes((txs[i]as TxStatus).get_status())) {
                        let index = waiting.findIndex(item => {
                            const x = Date.now() - item.time
                            return x > hold_state_sec && item.tx_status.get_digest_hex() === (txs[i] as TxStatus).get_digest_hex()
                        })

                        if (index !== -1) {
                            // splice it out of the array if successful
                            txs.splice(i, 1)
                            i--
                        } else {
                            // check if it is currently waiting for hold time to elapse.
                            let index = waiting.findIndex(item => ((txs[i] as TxStatus).get_digest_hex() === item.tx_status.get_digest_hex()))
                            if (index === -1) waiting.push({time: Date.now(), tx_status: txs[i] as TxStatus})

                        }
                    }

                }

                let elapsed_time = Date.now() - start

                if (elapsed_time >= limit) {
                    clearInterval(loop)
                    // and return all those which still have not.
                    return reject(failed.concat(txs as Array<TxStatus>))
                }
            }, 100)
        })
        return asyncTimerPromise
    }


    async poll(txs: Array<string | TxStatus> ) : Promise<Array<TxStatus>> {
        let tx_status
        const res = []

        for (let i = 0; i < txs.length; i++) {
            try {
                if (txs[i] instanceof TxStatus) {
                    tx_status = await this.tx.status((txs[i] as TxStatus).get_digest_hex())
                } else {
                    tx_status = await this.tx.status(txs[i] as string)
                }
                res.push(tx_status)
            } catch (e) {
                if (!(e instanceof ApiError)) {
                    // if wedon't fail whole thing then we must push it into it to keep arrays same length.
                    // this needs looking at and asking eds opinion for future direction.
                    throw e
                }
            }
        }
        return res
    }


    static async from_network_name(host: string, port: number) {
        const api = new LedgerApi(host, port)
        const server_version = await api.server.version()
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