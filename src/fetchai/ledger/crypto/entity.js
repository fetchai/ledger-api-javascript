import { randomBytes } from 'crypto'
import * as secp256k1 from 'secp256k1'
import { ValidationError } from '../errors'

/**
 * An entity is a full private/public key pair.
 *
 * @public
 * @class
 */
export class Entity {

	constructor(private_key_bytes = '') {

		// construct or generate the private key if one is not specified
		if (private_key_bytes) {
			if (secp256k1.privateKeyVerify(private_key_bytes)) {
				this.privKey = private_key_bytes
				this.pubKey = secp256k1.publicKeyCreate(this.privKey, false)
			} else {
				throw new ValidationError(
					'Unable to load private key from input'
				)
			}
		} else {
			do {
				this.privKey = randomBytes(32)
				this.pubKey = secp256k1.publicKeyCreate(this.privKey, false)
			} while (!secp256k1.privateKeyVerify(this.privKey))
		}
	}

	private_key() {
		return this.privKey
	}

	private_key_hex() {
		return this.privKey.toString('hex')
	}

	// get the public key in a uncompressed format
	public_key() {
		return this.pubKey
	}

	public_key_hex() {
		return this.pubKey.toString('hex')
	}

	// sign the message
	sign(extMsgHash) {
		return secp256k1.sign(extMsgHash, this.privKey)
	}

	signature_hex(sigObj) {
		return sigObj.signature.toString('hex')
	}

	// verify the signature
	verify_signature(extMsgHash, sigObj) {
		return secp256k1.verify(extMsgHash, sigObj.signature, this.pubKey)
	}

}