/// <reference types="node" />
import { Address } from '../crypto/address';
import { ApiEndpoint, TransactionFactory } from './common';
import { Contract } from '../contract';
import { PREFIX } from '../utils';
import { LedgerApi } from './init';
import { Entity } from '../crypto/entity';
import { Transaction } from '../transaction';
import { ServerApi } from './server';
declare type Tuple = [boolean, any];
interface CreateContractsOptions {
    owner: Entity;
    contract: Contract;
    fee: BN;
    signers: Array<Entity> | null;
    shard_mask: BitVectorLike;
}
interface QueryContractsOptions {
    contract_owner: Address;
    query: string;
    data: any;
}
interface ActionContractsOptions {
    contract_address: Address;
    action: string;
    fee: BN;
    from_address: Address;
    args: MessagePackable;
    signers: Array<Entity>;
    shard_mask: BitVectorLike;
}
interface JsonPayload {
    [key: string]: JsonPrimitive | JsonPayload;
}
/**
 * This class for all Tokens APIs.
 *
 * @public
 * @class
 */
export declare class ContractsApi extends ApiEndpoint {
    /**
     *
     * @param {String} HOST Ledger host.
     * @param {String} PORT Ledger port.
     */
    constructor(host: string, port: number, api?: LedgerApi);
    static _is_primitive(test: unknown): boolean;
    /**
     * Create contract
     * @param {Object} owner Entity object
     * @param {Number} fee fee associated with the contract creation.
     * @param {String} contract contract
     * @param {Object} [shard_mask=null] BitVector object
     */
    create({ owner, contract, fee, signers, shard_mask }: CreateContractsOptions): Promise<any | null>;
    /**
     * Query on contract
     * @param {Object} contract_owner Address object
     * @param {String} query query string
     * @param {JSON} data json payload
     */
    query({ contract_owner, query, data }: QueryContractsOptions): Promise<Tuple>;
    /**
     * Action on ledger/contract
     * @param {Object} contract_digest Address class object
     * @param {Object} contract_address Address class object
     * @param {String} action action
     * @param {Number} fee fee associated with the action.
     * @param {Object} from_address from address
     * @param {Array} signers Entity list
     * @param {*} args arguments
     * @param {Object} shard_mask BitVector object
     */
    action({ contract_address, action, fee, from_address, args, signers, shard_mask }: ActionContractsOptions): Promise<any>;
    _encode_json_payload(data: any): JsonPayload;
    isJSON(o: unknown): boolean;
    post_tx_json(tx_data: Buffer): Promise<any | null>;
}
export declare class ContractTxFactory extends TransactionFactory {
    api: LedgerApi;
    prefix: PREFIX;
    constructor(api: LedgerApi);
    /**
     * Replicate server interface for fetching number of lanes
     *
     * @returns {*}
     */
    server(): ServerApi;
    /**
     * Replicate setting of validity period using server
     *
     * @param tx
     * @param validity_period
     */
    set_validity_period(tx: Transaction, validity_period?: number | null): Promise<BN>;
    action({ contract_address, action, fee, from_address, args, signers, shard_mask }: ActionContractsOptions): Promise<Transaction>;
    create({ owner, contract, fee, signers, shard_mask }: CreateContractsOptions): Promise<Transaction>;
}
export {};
