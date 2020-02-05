import { ContractsApi } from './contracts';
import { ServerApi } from './server';
import { TokenApi } from './token';
import { TransactionApi, TxStatus } from './tx';
/**
 * This class for all ledger APIs.
 *
 * @public
 * @class
 */
export declare class LedgerApi {
    tokens: TokenApi;
    contracts: ContractsApi;
    tx: TransactionApi;
    server: ServerApi;
    /**
     * @param  {Boolean} host ledger host.
     * @param  {Boolean} port ledger port.
     * @param  {Boolean} network server name.
     */
    constructor(host: string, port: number);
    static from_network_name(host: string, port: number): Promise<true>;
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
    sync(txs: Array<TxStatus | string> | string, timeout?: number, hold_state_sec?: number, extend_success_status?: Array<string>): Promise<true | Array<TxStatus>>;
    poll(txs: Array<string | TxStatus>): Promise<Array<TxStatus>>;
}
