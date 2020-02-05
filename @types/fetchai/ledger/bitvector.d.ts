/// <reference types="node" />
/**
 * This class for bitVector related operations
 *
 * @public
 * @class
 */
export declare class BitVector {
    _size: number;
    _byte_size: number;
    _buffer: Buffer;
    constructor(size?: BitVectorLike);
    static from_indices(indices: Array<number>, size: number): BitVector;
    static from_bytes(data: Buffer, bit_size: number): BitVector;
    static from_hex_string(hex_data: string): BitVector;
    __len__(): number;
    __bytes__(): Buffer;
    instance_bytes(): Buffer;
    byte_length(): number;
    get(bit: number): number;
    set(bit: number, value: number): void;
    as_binary(): string;
    as_hex(): string;
}
