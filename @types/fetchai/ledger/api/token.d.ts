import { PREFIX } from '../utils';
import { ApiEndpoint, TransactionFactory } from './common';
import { Entity } from '../crypto/entity';
import { Transaction } from '../transaction';
import { Deed } from '../crypto/deed';
import { LedgerApi } from './init';
/**
 * This class for all Tokens APIs.
 *
 * @public
 * @class
 */
export declare class TokenApi extends ApiEndpoint {
    /**
     * Create new TokenApi object with host and port.
     * @constructor
     * @param {String} host ledger host
     * @param {Number} port ledger port
     */
    constructor(host: string, port: number, api: LedgerApi);
    /**
     * Query the balance for a given address from the remote node.
     * @async
     * @method
     * @param {Object} address base64 encoded string containing the address of the node.
     * @returns {Number} The balance value retried.
     * @throws {ApiError} ApiError on any failures.
     */
    balance(address: AddressLike): Promise<BN>;
    /**
     *
     * @param address
     * @returns {Promise<BN|BN.props>}
     */
    stake(address: AddressLike): Promise<BN>;
    /**
     * Query the stake on cooldown for a given address from the remote node
     *
     * @param address  The base58 encoded string containing the address of the node
     * @returns {Promise<void>}
     */
    stake_cooldown(address: AddressLike): Promise<any>;
    /**
     * Sets the deed for a multi-sig account
     *
     * @param entity The entity object to create deed for
     * @param deed The deed to set
     * @param signatories The entities that will sign this action
     * @param allow_no_amend if true will not be able to ammend deed
     * @returns {Promise<*>} The digest of the submitted transaction
     */
    deed(entity: Entity, deed: Deed, signatories?: Entity[] | null, allow_no_amend?: boolean): Promise<any | null>;
    /**
     * Transfers FET from one account to another account.
     *
     * @param {Object} entity Entity bytes of the private key of the source address.
     * @param {Object} to to bytes of the targeted address to send funds to.
     * @param {Number} amount amount of funds being transferred.
     * @param {Number} fee fee associated with the transfer.
     * @returns The digest of the submitted transaction.
     * @throws {ApiError} ApiError on any failures.
     */
    transfer(entity: Entity, to: AddressLike, amount: NumericInput, fee: NumericInput, signatories?: Entity[] | null): Promise<any | null>;
    /**
     * Stakes a specific amount of
     *
     * @param entity The entity object that desires to stake
     * @param amount The amount to stake
     * @param fee
     */
    add_stake(entity: Entity, amount: NumericInput, fee: NumericInput): Promise<any | null>;
    /**
     * Destakes a specific amount of tokens from a staking miner. This will put the tokens in a cool down period
     *
     * @param entity The entity object that desires to destake
     * @param amount The amount of tokens to destake
     * @param fee
     * @returns {Promise<*>} The digest of the submitted transaction
     */
    de_stake(entity: Entity, amount: NumericInput, fee: NumericInput): Promise<any | null>;
    /**
     * Collect all stakes that have reached the end of the cooldown period
     *
     * @param entity The entity object that desires to collect
     * @param fee
     * @returns {Promise<*>}
     */
    collect_stake(entity: Entity, fee: NumericInput): Promise<any | null>;
}
export declare class TokenTxFactory extends TransactionFactory {
    prefix: PREFIX;
    constructor();
    static deed(entity: Entity, deed: Deed, signatories?: Array<Entity> | null, allow_no_amend?: boolean): Transaction;
    static transfer(entity: Entity, to: AddressLike, amount: NumericInput, fee: NumericInput, signatories?: Array<Entity> | null): Transaction;
    static add_stake(entity: Entity, amount: BN, fee: BN, signatories?: Entity[] | null): Transaction;
    static de_stake(entity: Entity, amount: BN, fee: BN, signatories?: Entity[] | null): Transaction;
    static collect_stake(entity: Entity, fee: BN, signatories?: Entity[] | null): Transaction;
}
