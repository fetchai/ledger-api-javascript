/// <reference types="node" />
import { Address } from '../crypto/address';
import { ApiEndpoint } from './common';
interface TxStatusData {
    digest: Buffer;
    status: string;
    exit_code: string;
    charge: number;
    charge_rate: number;
    fee: number;
}
interface TxContentsData {
    digest: Buffer;
    action: string;
    chain_code: string;
    from_address: string;
    contract_address: string;
    valid_from: number;
    valid_until: number;
    charge: number;
    charge_limit: number;
    transfers: Array<string>;
    signatories: string;
    data: string;
}
export declare class TxStatus {
    digest_bytes: Buffer;
    digest_hex: string;
    status: string;
    exit_code: string;
    charge: BN;
    charge_rate: BN;
    fee: BN;
    constructor({ digest, status, exit_code, charge, charge_rate, fee }: TxStatusData);
    get_status(): string;
    get_exit_code(): string;
    successful(): boolean;
    failed(): boolean;
    non_terminal(): boolean;
    get_digest_hex(): string;
    get_digest_bytes(): Buffer;
}
export declare class TxContents {
    digest_bytes: any;
    digest_hex: string;
    action: any;
    chain_code: any;
    from_address: Address;
    contract_address: Address | null;
    valid_from: BN;
    valid_until: BN;
    charge: BN;
    charge_limit: BN;
    transfers: any;
    signatories: any;
    data: any;
    constructor({ digest, action, chain_code, from_address, contract_address, valid_from, valid_until, charge, charge_limit, transfers, signatories, data }: TxContentsData);
    /**
     *Creates a TxContents from a json string or an object
     */
    static from_json(data: any): TxContents;
    /**
     *  Returns the amount of FET transferred to an address by this transaction, if any
     */
    transfers_to(address: AddressLike): BN;
}
export declare class TransactionApi extends ApiEndpoint {
    status(tx_digest: string): Promise<TxStatus>;
    contents(tx_digest: string): Promise<TxContents>;
}
export {};
