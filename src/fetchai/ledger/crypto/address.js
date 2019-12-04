import * as bs58 from 'bs58'
import {ValidationError} from '../errors'
import {createHash} from 'crypto'
import {Identity} from './identity'

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
    /**
     * @param  {Object|Buffer|String} identity Address object or Buffer or String.
     * @throws {ValidationError} ValidationError on any failures.
     */
    constructor(identity) {
        if (identity instanceof Address) {
            this._address = identity._address
            this._display = identity._display
        } else if (identity instanceof Identity) {
            //TODO add unit tests for this block to address
            this._address = this._digest(identity.public_key_bytes())
            this._display = this._calculate_display(this._address)
        } else if (identity instanceof Buffer) {
            if (Buffer.byteLength(identity) !== BYTE_LENGTH) {
                throw new ValidationError('Incorrect length of binary address')
            }

            this._address = identity
            this._display = this._calculate_display(this._address)
        } else if (typeof identity === 'string') {
            const bytes = bs58.decode(identity)

            if (Buffer.byteLength(bytes) !== DISPLAY_BYTE_LENGTH) {
                throw new ValidationError(
                    'Unable to parse address, incorrect size'
                )
            }

            // split the identity into address and checksum
            const address_raw = bytes.slice(0, BYTE_LENGTH)
            const checksum = bytes.slice(BYTE_LENGTH)
            //calculate the expected checksum
            const expected_checksum = this._calculate_checksum(address_raw)

            if (!Buffer.compare(checksum, expected_checksum)) {
                throw new ValidationError('Invalid checksum')
            }

            this._address = address_raw
            this._display = identity
        } else {
            throw new ValidationError('Failed to build identity from input')
        }
    }

    /**
     * Get address in string
     */
    toString() {
        return this._display
    }

    /**
     * Get address in bytes
     */
    toBytes() {
        return this._address
    }

    /**
     * Check equality of two address
     * @param  {bytes} other Address in bytes
     */
    equals(other) {
        return Buffer.compare(this.toBytes(), other.toBytes())
    }

    /**
     * Get address in hex
     */
    toHex() {
        return this._address.toString('hex')
    }

    _digest(address_raw) {
        const hash_func = createHash('sha256')
        hash_func.update(address_raw, 'utf')
        return Buffer.from(hash_func.digest())
    }

    _calculate_checksum(address_raw) {
        const digest = this._digest(address_raw)
        return digest.slice(0, BYTE_LENGTH)
    }

    _calculate_display(address_raw) {
        const digest = this._digest(address_raw)
        const bytes = digest.slice(0, CHECKSUM_SIZE)
        const full = Buffer.concat([address_raw, bytes])
        return bs58.encode(full)
    }
}
