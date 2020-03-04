import * as semver from "semver";
import { __compatible__ } from "../init";
import { ContractsApi } from "./contracts";
import {IncompatibleLedgerVersionError, RunTimeError} from "../errors";
import { ServerApi } from "./server";
import { TokenApi } from "./token";
import { TransactionApi, TxStatus } from "./tx";
import {Transaction} from "../transaction";
import {Bootstrap} from "./bootstrap";

const DEFAULT_TIMEOUT = 120;

interface WaitingTransactionItem {
    time: number;
    tx_status: TxStatus;
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
    constructor(host: string, port: number) {
        this.tokens = new TokenApi(host, port, this);
        this.contracts = new ContractsApi(host, port, this);
        this.tx = new TransactionApi(host, port, this);
        this.server = new ServerApi(host, port, this);
    }

    /**
     * Get a Ledger API Object from network name eg 'mainnet'
     *
     * @throws IncompatibleLedgerVersionError if this SDK is not of a compatible version with Ledger SDK
     * @param network
     */
    static async from_network_name(network): Promise<LedgerApi>
    {
        const [host, port] = await Bootstrap.server_from_name(network)
        await LedgerApi.check_version_compatibility(host, port)
        return new LedgerApi(host, port);
    }

    /**
     * Checks that the SDK is itself of a compatible version with the Ledger it is connecting to,
     *
     * @param host
     * @param port
     */
    static async check_version_compatibility(host: string, port: number): Promise<void> {
        const api = new LedgerApi(host, port);
        const server_version = await api.server.version();
        if (
            !semver.satisfies(
                semver.coerce(server_version),
                __compatible__.join(" ")
            )
        ) {
            throw new IncompatibleLedgerVersionError(`Ledger version running on server is not compatible with this API  \n
                                                 Server version: ${server_version} \nExpected version: ${__compatible__.join(",")}`);
        }
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
    async sync(
        txs: Array<TxStatus | string> | string,
        timeout: number = DEFAULT_TIMEOUT,
        hold_state_sec = 0,
        extend_success_status: Array<string> = []
    ): Promise<true | Array<TxStatus>> {
        if (!Array.isArray(txs) && typeof txs !== "string") {
            throw new TypeError("Unknown argument type");
        }

        if (!Array.isArray(txs)) {
            txs = [txs];
        }
        const limit = timeout * 1000;

        const failed: Array<TxStatus> = [];
        // successful transactions are out in this waiting array, and then if they remain successful
        // for a time period equal to hold_state_sec they are removed and considered successful. This is
        // because certain transactions can change from successful to not, so we revert if this occurs.
        const waiting: Array<WaitingTransactionItem> = [];

        const asyncTimerPromise = new Promise<true | Array<TxStatus>>(
            (resolve, reject) => {
                const start = Date.now();

                const loop = setInterval(async () => {
                    if (txs.length === 0) {
                        clearInterval(loop);

                        if (failed.length) {
                            return reject(failed);
                        } else {
                            return resolve(true);
                        }
                    }
                    // we poll all of the digests.
                    txs = await this.poll(txs as Array<TxStatus | string>);

                    for (let i = 0; i < txs.length; i++) {
                        // if failed we push into array of failed and go to next one.
                        if ((txs[i] as TxStatus).failed()) {
                            failed.push(txs[i] as TxStatus);
                            txs.splice(i, 1);
                            i--;
                            continue;
                        }

                        if ((txs[i] as TxStatus).non_terminal()) {
                            // if a transaction reverts its status to a non-terminal state within hold time then revert.
                            const index = waiting.findIndex(
                                item =>
                                    Date.now() - item.time < hold_state_sec &&
                                    item.tx_status.get_digest_hex() ===
                                        (txs[i] as TxStatus).get_digest_hex()
                            );

                            if (index !== -1) {
                                waiting.splice(index, 1);
                            }
                        }

                        if (
                            (txs[i] as TxStatus).successful() ||
                            extend_success_status.includes(
                                (txs[i] as TxStatus).get_status()
                            )
                        ) {
                            const index = waiting.findIndex(item => {
                                const x = Date.now() - item.time;
                                return (
                                    x > hold_state_sec &&
                                    item.tx_status.get_digest_hex() ===
                                        (txs[i] as TxStatus).get_digest_hex()
                                );
                            });

                            if (index !== -1) {
                                // splice it out of the array if successful
                                txs.splice(i, 1);
                                i--;
                            } else {
                                // check if it is currently waiting for hold time to elapse.
                                const index = waiting.findIndex(
                                    item =>
                                        (txs[
                                            i
                                        ] as TxStatus).get_digest_hex() ===
                                        item.tx_status.get_digest_hex()
                                );
                                if (index === -1)
                                    waiting.push({
                                        time: Date.now(),
                                        tx_status: txs[i] as TxStatus
                                    });
                            }
                        }
                    }

                    const elapsed_time = Date.now() - start;

                    if (elapsed_time >= limit) {
                        clearInterval(loop);
                        // and return all those which still have not.
                        return reject(failed.concat(txs as Array<TxStatus>));
                    }
                }, 100);
            }
        );
        return asyncTimerPromise;
    }

    async submit_signed_tx(tx: Transaction): Promise<any> {
        if(!tx.is_valid())
            throw new RunTimeError('Signed transaction failed validation checks')

        return this.tokens.submit_signed_tx(tx)
    }

    async set_validity_period(tx: Transaction, period: number | null = null): Promise<void> {
        await this.tokens.set_validity_period(tx, period)
        return
    }


    async poll(txs: Array<string | TxStatus>): Promise<Array<TxStatus>> {
        let tx_status;
        const res = [];
        let digest: string;

        for (let i = 0; i < txs.length; i++) {
            digest =
                    txs[i] instanceof TxStatus
                        ? (txs[i] as TxStatus).get_digest_hex()
                        : (txs[i] as string);
            try {
                tx_status = await this.tx.status(digest);
                res.push(tx_status);
            } catch (e) {
                //todo delete when we have this worked.
                res.push(
                    new TxStatus({
                        digest: Buffer.from(digest, "hex"),
                        status: "FAILED",
                        error_message: e.errors
                    })
                );
            }
        }
        return res;
    }
}
