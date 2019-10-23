import * as bs58 from 'bs58'
import {ValidationError} from '../errors'
import {createHash} from 'crypto' // Node.js

const BYTE_LENGTH = 32
const CHECKSUM_SIZE = 4
const DISPLAY_BYTE_LENGTH = BYTE_LENGTH + CHECKSUM_SIZE

export class Address {

	constructor(identity) {

		if (identity instanceof Address) {
			this._address = identity._address
			this._display = identity._display

		} else if (identity instanceof Buffer) {
			if (Buffer.byteLength(identity) !== BYTE_LENGTH) {
				throw new ValidationError('Incorrect length of binary address')
			}

			this._address = identity
			this._display = this._calculate_display(this._address);
	        console.log("display length js ::: " + this._display.length);

		} else if (typeof identity === 'string') {
			const bytes = bs58.decode(identity)

			if (Buffer.byteLength(bytes) !== DISPLAY_BYTE_LENGTH) {
				throw new ValidationError('Unable to parse address, incorrect size')
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

	toString() {
		return this._display
	}

	toBytes() {
		return this._address
	}

	equals(other) {
		return (Buffer.compare(this.toBytes(), other.toBytes()))
	}

	toHex() {
		return this._address.toString('hex')
	}

	_digest(address_raw) {
		const hash_func = createHash('sha256')
		hash_func.update(address_raw)
		return hash_func.digest()
	}

	_calculate_checksum(address_raw) {
		const digest = this._digest(address_raw)
		return digest.slice(0, BYTE_LENGTH)
	}

	_calculate_display(address_raw) {
		const digest = this._digest(address_raw)
		const bytes = digest.slice(0, CHECKSUM_SIZE)
		const full = Buffer.concat([digest, bytes])
		return bs58.encode(full)
	}
}
