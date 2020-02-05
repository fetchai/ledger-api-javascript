/// <reference types="node" />
import { Address } from '../../fetchai/ledger/crypto/address';
import { Entity } from '../../fetchai/ledger/crypto/entity';
import { Identity } from '../../fetchai/ledger/crypto/identity';
export declare const LOCAL_HOST = "127.0.0.1";
export declare const DEFAULT_PORT = 8000;
export declare const RAND_FP = "/path/to/file";
export declare const PASSWORD = "Password!12345";
export declare const _PRIVATE_KEYS: string[];
export declare const ENTITIES: Entity[];
export declare const ADDRESSES: Address[];
export declare const IDENTITIES: Identity[];
export declare function calc_digest(address_raw: BinaryLike): Buffer;
export declare function calc_address(address_raw: BinaryLike): Array<Buffer | string>;
export declare function dummy_address(): Address;
export declare function equals(x: any, y: any): boolean;
