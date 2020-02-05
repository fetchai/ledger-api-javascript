/// <reference types="node" />
declare const encode_bytearray: (buffer: Buffer, value: Buffer) => Buffer;
declare const decode_bytearray: (buffer: Buffer) => Buffer[];
export { encode_bytearray, decode_bytearray };
