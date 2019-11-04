import {RunTimeError} from '../errors/runTimeError'
import {ApiError} from '../errors/apiError'
import {TokenApi} from './token'
import {TransactionApi} from './tx'

export class LedgerApi {

    //TODO add third param , network = false
    constructor(host = false, port = false) {
        this.tokens = new TokenApi(host, port)
        this.tx = new TransactionApi(host, port)
    }

    /*
	* this does not block event loop, but waits sync for return of executed
	* digest using a timeout, wrapped in a promise that resolves when we get executed status in response, or
    * rejects if timeouts.
	 */
    async sync(txs, timeout = false) {
        const limit = (timeout === false) ? 120000 : timeout * 1000
        if (!Array.isArray(txs) || !txs.length) {
            throw new TypeError('Unknown argument type')
        }
        const asyncTimerPromise = new Promise((resolve) => {
            const start = Date.now()
            let loop = async () => {
                if (txs.length === 0) return resolve(true)
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
                    // delete when tested.
                    let t
                    const text = txs.reduce(t, f => t + ' , ' + f.name.substring(6))
                    throw new RunTimeError('Timeout exceeded waiting for txs:' + text)
                }
                setTimeout(loop, 1)
            }
            loop()
        })
        return asyncTimerPromise
    }

    async _poll(digest) {
        let status = await this.tx.status(digest)
        return /Executed|Submitted/.test(status)
    }
}
