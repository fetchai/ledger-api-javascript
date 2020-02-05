/// <reference types="node" />
import { Address } from './crypto/address';
import { ContractTxFactory } from './api/contracts';
import { LedgerApi } from './api';
import { Entity } from './crypto/entity';
interface ContractJSONSerialized {
    readonly version: number;
    readonly owner: string;
    readonly source: string;
    readonly nonce: string;
}
interface CreateContractOptions {
    api: ContractsApiLike;
    owner: Entity;
    fee: NumericInput;
    signers?: Array<Entity> | null;
}
interface QueryContractOptions {
    api: ContractsApiLike;
    name: string;
    data: any;
}
interface ActionContractOptions {
    api: ContractsApiLike;
    name: string;
    fee: NumericInput;
    args: MessagePackable;
    signers: Array<Entity> | null;
}
declare type ContractsApiLike = ContractTxFactory | LedgerApi;
export declare class Contract {
    _address: Address;
    _digest: Address;
    _init: any;
    _nonce: Buffer;
    _owner: Address;
    _source: string;
    constructor(source: string, owner: AddressLike, nonce?: Buffer);
    static loads(s: string): Contract;
    static load(fp: string): Contract;
    static api(ContractsApiLike: ContractsApiLike): ContractTxFactory | LedgerApi['contracts'];
    static from_json_object(obj: ContractJSONSerialized): Contract;
    name(): string;
    encoded_source(): string;
    owner(owner?: AddressLike | null): Address;
    digest(): Address;
    source(): string;
    dumps(): string;
    dump(fp: string): void;
    nonce(): string;
    nonce_bytes(): Buffer;
    address(): Address;
    create({ api, owner, fee, signers }: CreateContractOptions): Promise<string>;
    query({ api, name, data }: QueryContractOptions): Promise<any>;
    action({ api, name, fee, args, signers }: ActionContractOptions): Promise<any>;
    to_json_object(): ContractJSONSerialized;
}
export {};
