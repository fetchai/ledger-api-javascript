/// <reference types="node" />
import { Identity } from '../crypto/identity';
declare type Tuple = [Identity, Buffer];
declare const encode_identity: (buffer: Buffer, value: Buffer | Identity) => Buffer;
declare const decode_identity: (buffer: Buffer) => Tuple;
export { encode_identity, decode_identity };
