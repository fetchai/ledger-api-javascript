/// <reference types="node" />
import { Address } from '../../../fetchai/ledger/crypto/address';
declare type Tuple = [Address, Buffer];
declare const encode_address: (buffer: Buffer, address: string | Address) => Buffer;
declare const decode_address: (buffer: Buffer) => Tuple;
export { encode_address, decode_address };
