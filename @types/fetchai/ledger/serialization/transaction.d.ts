/// <reference types="node" />
import { Entity } from '../crypto/entity';
import { Transaction } from '../transaction';
declare const encode_payload: (payload: Transaction) => Buffer;
declare const encode_multisig_transaction: (payload: Transaction, signatures: any) => Buffer;
declare const encode_transaction: (payload: Transaction, signers: Entity[]) => Buffer;
declare type PayloadTuple = [Transaction, Buffer];
declare const decode_payload: (buffer: Buffer) => PayloadTuple;
declare type DECODE_TUPLE = [boolean, Transaction];
declare const decode_transaction: (buffer: Buffer) => DECODE_TUPLE;
export { encode_transaction, decode_transaction, decode_payload, encode_multisig_transaction, encode_payload };
