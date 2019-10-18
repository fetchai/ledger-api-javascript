import * as secp256k1 from 'secp256k1'
import {ValidationError} from "../errors";

export class Identity {

    constructor(pub_key) {
        if (pub_key instanceof Identity) {
            this.pub_key = pub_key.public_key();
        } else if (pub_key instanceof Buffer) {
            if (!secp256k1.publicKeyVerify(pub_key)) {
                throw new ValidationError('invalid public key');
            }
            this.pub_key = pub_key;
        } else {
            throw new ValidationError('Failed');
        }
    }

    public_key() {
        return this.pub_key;
    }

    public_key_hex() {
        return this.pub_key.toString('hex');
    }

    public_key_bytes() {
        return this.pub_key;
    }

    verify(message, signature) {
        return secp256k1.verify(message, signature, this.pub_key);

    }

    static from_base64(private_key_base64) {
        const private_key_bytes = Buffer.from(private_key_base64, 'base64');
        return new Identity(private_key_bytes);
    }

    static from_hex(private_key_hex) {
        const private_key_bytes = Buffer.from(private_key_hex, 'hex');
        return new Identity(private_key_bytes);
    }
}
