import * as fetchai_ledger_api from '../src/fetchai/ledger/index'
declare module "fetchai_ledger_api";

export class Address {
    constructor(Identity);

    equals(identity: Address): void;

    toBytes(): any;

    toHex(): string;

    toString(): string;

}

export class ApiEndpoint {
    constructor(host: string, port: string);

    create_skeleton_tx(fee: number, validity_period: number): Transaction;

    host(): string;

    port(): number;

    protocol(): string;

}

export class BitVector {
    constructor(size: BitVector | number);

    as_binary(): void;

    as_hex(): any;

    byte_length(): number;

    get(bit: number): number;

    instance_bytes(): string | any;

    set(bit: number, value: number): void;

    static from_bytes(data: any, bit_size:number): void;

    static from_hex_string(hex_data:string): void;

}

export class Contract {
    constructor(source: any, owner: any, nonce?: any);

    action(api: ApiEndpoint, name: string, fee: number, signers: Array<Entity>, args: Array<any>): void;

    address(): Address;

    create(api: ApiEndpoint, owner: any, fee: number): void;

    digest(): any;

    dump(fp): void;

    dumps(): string;

    encoded_source(): string;

    name(): string;

    nonce(): string;

    nonce_bytes(): any;

    owner(owner?: any): Address;

    query(api: ApiEndpoint, name: string, data: any): void;

    source(): void;

    static load(fp: string): void;

    static loads(s: string): void;
}

export class Entity {
    constructor(private_key_bytes?: any);

    private_key(): any;

    private_key_hex(): string;

    public_key_hex(): string;

    sign(extMsgHash: string): object;

    signature_hex(sigObj: object): string;

    static from_base64(private_key_base64: string): Entity;

    static from_hex(private_key_hex: string): Entity;

    static load(fp: string): void;

    static loads(s: string): void;

}

export class Identity {
    constructor(pub_key: Identity | any);

    prefixed_public_key(): any;

    public_key(): any;

    public_key_base64(): string;

    public_key_bytes(): any;

    public_key_hex(): string;

    verify(message: any, signature: any): void;

    static from_base64(private_key_base64: string): Identity;

    static from_hex(private_key_hex: string): void;

}

export class LedgerApi {
    constructor(host: false | string, port: false | string, network: false | string);

    sync(txs: string | Array<string>, timeout: number | boolean): void;

    static from_network_name(host: string, port: string): boolean;
}

export class TokenApi {
    constructor(host: string, port: string);

    balance(address: any): number;

    transfer(entity: Entity, to: any, amount: number, fee: number): void;

    wealth(entity: Entity, amount: number): void;

}

export class Transaction {
    constructor();

    action(data?: string): string;

    add_signer(signer: string): void;

    add_transfer(address: any, amount: number): void;

    chain_code(): string;

    charge_limit(limit?: import("bn.js").BN | null): import("bn.js").BN;

    charge_rate(charge_rate?: import("bn.js").BN | null): import("bn.js").BN;

    contract_address(): string;

    contract_digest(): string | Address;

    counter(counter?: import("bn.js").BN | null): void;

    data(data?: string): string;

    from_address(address?: any): Address | string;

    set_transfer(address: any, amount?: import("bn.js").BN): void;

    shard_mask(): BitVector;

    signers(): object;

    synergetic_data_submission(is_submission?: boolean): boolean;

    target_chain_code(chain_code_id: string | number, mask: BitVector | number): void;

    target_contract(digest: string | Address, address: any, mask: BitVector | number): void;

    transfers(): object;

    valid_from(block_number?: import("bn.js").BN | null): import("bn.js").BN;

    valid_until(block_number?: import("bn.js").BN | null): import("bn.js").BN;

}

export class TransactionApi {
    constructor(host: string, port: string);

    contents(tx_digest: any): void;

    status(tx_digest: any): void;

}

export class TxContents {
    constructor(digest: any, action: string, chain_code: string, from_address: string, contract_digest: string, contract_address: string, valid_from: number, valid_until: number, charge: number, charge_limit: number, transfers: any, signatories: any, data: string);

    transfers_to(address: Address | string): import("bn.js").BN;

    static from_json(data: string | object): TxContents;

}

export class TxStatus {
    constructor(digest: any, status: number, exit_code: number, charge: number, charge_rate: number, fee: number);

    digest_bytes(): any;

    digest_hex(): string;

    failed(): boolean;

    successful(): boolean;

}

export const MULTIPLE_INITS: string;

export const NO_INIT: string;

export const SIMPLE_CONTRACT: string;

export const TRANSFER_CONTRACT: string;

export function ApiError(message?: string): void;

export function Bootstrap(...args: any[]): any;

export function IncompatibleLedgerVersionError(message?: string): void;

export function NetworkUnavailableError(message?: string): void;

export function NotImplementedError(message?: string): void;

export function RunTimeError(message?: string): void;

export function ValidationError(message?: string): void;

export function decode_address(buffer: any): any;

export function decode_bytearray(buffer: any): any;

export function decode_identity(buffer: any): any;

export function decode_integer(buffer: any): any;

export function decode_transaction(buffer: any): any;

export function encode_address(buffer: any, address: any): any;

export function encode_bytearray(buffer: any, value: any): any;

export function encode_identity(buffer: any, value: any): any;

export function encode_integer(buffer: any, value: any): any;

export function encode_transaction(payload: any, signers: any): any;

export function setLogger(_logger: any): void;

export namespace ApiError {
    const prepareStackTrace: any;

    const stackTraceLimit: number;

    function captureStackTrace(p0: any, p1: any): any;

}

export namespace Bootstrap {
    function get_ledger_address(...args: any[]): void;

    function is_server_valid(server_list: Array<string>, network: string): void;

    function list_servers(active?: boolean): void;

    function server_from_name(network: string): void;

    function split_address(address: string): void;
}

export namespace IncompatibleLedgerVersionError {
    const prepareStackTrace: any;

    const stackTraceLimit: number;

    function captureStackTrace(p0: any, p1: any): any;

}

export namespace NetworkUnavailableError {
    const prepareStackTrace: any;

    const stackTraceLimit: number;

    function captureStackTrace(p0: any, p1: any): any;

}

export namespace NotImplementedError {
    const prepareStackTrace: any;

    const stackTraceLimit: number;

    function captureStackTrace(p0: any, p1: any): any;

}

export namespace RunTimeError {
    const prepareStackTrace: any;

    const stackTraceLimit: number;

    function captureStackTrace(p0: any, p1: any): any;

}

export namespace ValidationError {
    const prepareStackTrace: any;

    const stackTraceLimit: number;

    function captureStackTrace(p0: any, p1: any): any;

}

export namespace logger {
    function info(): void;

}

