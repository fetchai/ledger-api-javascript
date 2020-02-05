/// <reference types="node" />
import { PREFIX } from '../utils';
import { LedgerApi } from './init';
import { Transaction } from '../transaction';
declare type Tuple = [boolean, Record<string, any>];
/**
 *
 */
export declare class ApiEndpoint {
    _protocol: string;
    prefix: PREFIX;
    _host: string;
    _port: number;
    readonly DEFAULT_BLOCK_VALIDITY_PERIOD = 100;
    parent_api: LedgerApi;
    constructor(host: string, port: number, api: LedgerApi);
    protocol(): string;
    host(): string;
    port(): number;
    /**
     * request to ledger
     *
     * @public
     * @method
     * @param  {endpoint} endpoint of the url.
     * @param  {data} data for request body.
     * @param  {prefix} prefix of the url.
     */
    post_json(endpoint: string, data?: {}, prefix?: string): Promise<Tuple>;
    create_skeleton_tx(fee: number, validity_period?: number | null): Promise<Transaction>;
    /**
     *Appends signatures to a transaction and submits it, returning the transaction digest
     *
     * @param tx    A pre-assembled transaction
     * @param signatures    signers signatures
     * @returns {Promise<*>}    The digest of the submitted transaction
     */
    submit_signed_tx(tx: Transaction, signatures: any): Promise<any>;
    set_validity_period(tx: Transaction, validity_period?: number | null): Promise<BN>;
    current_block_number(): Promise<number>;
    _get_json(path: string, data: any): Promise<any>;
    /**
     * Submits a transaction to the a ledger endpoint
     *
     * @param tx_data
     * @param endpoint
     * @returns {Promise<null|*>} Promise resolves to the hexadecimal digest of the submitted transaction
     */
    post_tx_json(tx_data: Buffer, endpoint: string): Promise<any | null>;
}
export declare class TransactionFactory {
    static create_skeleton_tx(fee: BN): Transaction;
    static create_action_tx(fee: NumericInput, from: AddressLike, action: string, prefix: string, shard_mask?: BitVectorLike): Transaction;
    static encode_msgpack_payload(args: MessagePackable): Uint8Array;
}
export {};
