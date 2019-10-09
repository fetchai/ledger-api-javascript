import { randomBytes } from 'crypto'
import { secp256k1 } from 'secp256k1'

/**
 * An entity is a full private/public key pair.
 *
 * @public
 * @class
 */
class Entity {
	constructor(private_key_bytes = '') {
		// construct or generate the private key if one is not specified
		if (private_key_bytes) {
			console.log('Generating public and private key for account')
		} else {
			do {
				this.privKey = randomBytes(32)
			} while (!secp256k1.privateKeyVerify(this.privKey))
		}
	}
}
