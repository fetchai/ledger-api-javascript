import * as bs58 from 'bs58'
import {ValidationError} from '../errors'
import {Identity} from './identity'
import {calc_digest} from '../utils'

const BYTE_LENGTH = 32
const CHECKSUM_SIZE = 4
const DISPLAY_BYTE_LENGTH = BYTE_LENGTH + CHECKSUM_SIZE

/**
 * Address creation from identity, bytes and string.
 *
 * @public
 * @class
 */
export class Address {
    private _address: Buffer;
    private _display: string;

    /**
     * @param  {Object|Buffer|String} identity Address object or Buffer or String.
     * @throws {ValidationError} ValidationError on any failures.
     */
    constructor(identity: AddressLike) {
        if (typeof identity === 'string') {
            if (!Address.is_address(identity)) {
                throw new ValidationError('Invalid Address')
            }

            this._address = bs58.decode(identity).slice(0, BYTE_LENGTH)
            this._display = identity
        } else if (identity instanceof Address) {
            this._address = identity._address
            this._display = identity._display
        } else if (identity instanceof Identity) {
            //TODO add unit tests for this block to address
            this._address = calc_digest(identity.public_key_bytes())
            this._display = this.calculate_display(this._address)
        } else if (identity instanceof Buffer) {
            // we don't seem to validate here for buffers ie check checksum is correct!!
            if (Buffer.byteLength(identity) !== BYTE_LENGTH) {
                throw new ValidationError('Incorrect length of binary address')
            }

            this._address = identity
            this._display = this.calculate_display(this._address)
        } else {
            console.log(' cannot build Address from : ' + identity)
            throw new ValidationError('Failed to build Address from input')
        }
    }


    /**
     * Check is string is a  valid address
     *
     * @param b58_address
     * @returns {boolean}
     */
    static is_address(b58_address: string): boolean {
        if (typeof b58_address !== 'string') return false
        const bytes = bs58.decode(b58_address)

        if (Buffer.byteLength(bytes) !== DISPLAY_BYTE_LENGTH) {
            return false
        }
        // split the identity into address and checksum
        const address_raw = bytes.slice(0, BYTE_LENGTH)
        const checksum = bytes.slice(BYTE_LENGTH)
        //calculate the expected checksum
        const expected_checksum = Address.calculate_checksum(address_raw)

        // check the validity of the checksum.
        if (!Buffer.compare(checksum, expected_checksum)) {
            return false
        }
        return true
    }

    static calculate_checksum(address_raw: Buffer): Buffer {
        const digest = calc_digest(address_raw)
        return digest.slice(0, BYTE_LENGTH)
    }

    /**
     * Get address in string
     */
    toString(): string {
        return this._display
    }

    /**
     * Get address in bytes
     */
    toBytes(): Buffer {
        return this._address
    }

    /**
     * //todo convert return type to boolean
     * Check equality of two address
     * @param  {bytes} other Address in bytes
     */
    equals(other: Address): boolean {
        return (Buffer.compare(this.toBytes(), other.toBytes()) === 0)
    }

    /**
     * Get address in hex
     */
    toHex(): string {
        return this._address.toString('hex')
    }

    calculate_display(address_raw: Buffer): string {
        const digest = calc_digest(address_raw)
        const bytes = digest.slice(0, CHECKSUM_SIZE)
        const full = Buffer.concat([address_raw, bytes])
        return bs58.encode(full)
    }
}
