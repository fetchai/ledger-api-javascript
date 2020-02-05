/// <reference types="node" />
import { BitVector } from './bitvector';
import { Address } from './crypto/address';
import { Entity } from './crypto';
declare type PayloadTuple = [Transaction, Buffer];
interface TransferItem {
    readonly address: string;
    readonly amount: BN;
}
/**
 * This class for Transactions related operations
 *
 * @public
 * @class
 */
export declare class Transaction {
    _from: string | Address;
    _transfers: Array<TransferItem>;
    _valid_from: BN;
    _valid_until: BN;
    _charge_rate: BN;
    _charge_limit: BN;
    _contract_address: string | Address;
    _counter: BN;
    _chain_code: string;
    _shard_mask: BitVector;
    _action: string;
    _metadata: any;
    _data: string;
    _signers: any;
    static from_payload(payload: Buffer): PayloadTuple;
    static from_encoded(encoded_transaction: Buffer): Transaction | null;
    static decode_partial(buffer: Buffer): Transaction;
    from_address(address?: AddressLike | null): Address | string;
    transfers(): Array<TransferItem>;
    valid_from(block_number?: BN | null): BN;
    valid_until(block_number?: BN | null): BN;
    charge_rate(charge?: BN | null): BN;
    charge_limit(limit?: BN | null): BN;
    contract_address(): string | Address;
    counter(counter?: BN | null): BN;
    chain_code(): string;
    action(action?: string | null): string;
    shard_mask(): BitVector;
    data(data?: any): string;
    compare(other: Transaction): boolean;
    payload(): Buffer;
    signers(): any;
    add_transfer(address: AddressLike, amount: BN): void;
    target_contract(address: AddressLike, mask: BitVectorLike): void;
    target_chain_code(chain_code_id: string | number, mask: number | BitVector): void;
    synergetic_data_submission(is_submission?: boolean): boolean;
    add_signer(signer: string): void;
    sign(signer: Entity): void;
    merge_signatures(tx2: Transaction): void | null;
    encode_partial(): Buffer;
}
export {};
