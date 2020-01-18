import * as secp256k1 from 'secp256k1'
import {ValidationError} from '../errors'

/**
 * An identity is the public half of a private / public key pair.
 *
 * @public
 * @class
 */
export class Identity {
    public pub_key: Buffer;

    /**
     * @param  {Object|Buffer} pub_key Identity object or Buffer
     * @throws {ValidationError} ValidationError if invalid public key or unable to load public key from input
     */
    constructor(pub_key: Buffer | Uint8Array | Identity) {
        if (pub_key instanceof Identity) {
            this.pub_key = pub_key.public_key()
        } else if (pub_key instanceof Buffer) {
            this.pub_key = pub_key;
            if (!secp256k1.publicKeyVerify(this.prefixed_public_key())) {
                throw new ValidationError('invalid public key')
            }
        } else {
            throw new ValidationError('Failed')
        }
    }

    static from_base64(private_key_base64: string): Identity {
        const private_key_bytes = Buffer.from(private_key_base64, 'base64');
        return new Identity(private_key_bytes)
    }

    static from_hex(public_key_hex: string): Identity {
        const public_key_bytes = Buffer.from(public_key_hex, 'hex');
        return new Identity(public_key_bytes)
    }

    /**
     * Get public key with 04 prefix.
     */
    prefixed_public_key(): Buffer {
        return Buffer.concat([Buffer.from('04', 'hex'), this.pub_key])
    }

    /**
     * Get base64 encoded public key.
     */
    public_key_base64(): string {
        return this.pub_key.toString('base64')
    }

    /**
     * Get the public key in bytes(Buffer).
     */
    public_key(): Buffer {
        return this.pub_key
    }

    /**
     * Get the public key hex.
     */
    public_key_hex(): string {
        return this.pub_key.toString('hex')
    }

    /**
     * Get the public key in bytes(Buffer).
     */
    public_key_bytes(): Buffer {
        return this.pub_key
    }

    /**
     * Verify the signature.
     * @param  {String} message Message which wants to verify
     * @param  {String} signature Signature
     * @returns signature is valid or not
     */
    verify(message: Buffer, signature: Buffer): boolean {
        return secp256k1.verify(message, signature, this.prefixed_public_key())
    }
}
