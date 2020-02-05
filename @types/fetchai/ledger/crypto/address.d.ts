/// <reference types="node" />
/**
 * Address creation from identity, bytes and string.
 *
 * @public
 * @class
 */
export declare class Address {
    private _address;
    private _display;
    /**
     * @param  {Object|Buffer|String} identity Address object or Buffer or String.
     * @throws {ValidationError} ValidationError on any failures.
     */
    constructor(identity: AddressLike);
    /**
     * Check is string is a  valid address
     *
     * @param b58_address
     * @returns {boolean}
     */
    static is_address(b58_address: string): boolean;
    static calculate_checksum(address_raw: Buffer): Buffer;
    /**
     * Get address in string
     */
    toString(): string;
    /**
     * Get address in bytes
     */
    toBytes(): Buffer;
    /**
     * //todo convert return type to boolean
     * Check equality of two address
     * @param  {bytes} other Address in bytes
     */
    equals(other: Address): number;
    /**
     * Get address in hex
     */
    toHex(): string;
    calculate_display(address_raw: Buffer): string;
}
