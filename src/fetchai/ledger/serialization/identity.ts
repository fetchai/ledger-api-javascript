import {Identity} from '../crypto/identity'
import {ValidationError} from '../errors'

const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY = 0x04
const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY_LEN = 64

type Tuple = [Identity, Buffer];

const encode_identity = (buffer: Buffer, value: Identity | Buffer): Buffer => {
    if (value instanceof Identity) {
        return Buffer.concat([buffer, Buffer.from([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]), value.public_key()])
    } else {
        return Buffer.concat([buffer, Buffer.from([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]), value])
    }
}

const decode_identity = (buffer: Buffer): Tuple => {
    const header = buffer.slice(0, 1)
    const hex = parseInt(header.toString('hex'))

    if (hex !== UNCOMPRESSED_SCEP256K1_PUBLIC_KEY) {
        throw new ValidationError('Unsupported identity type')
    }
    // we add one to this value because our key is longer by one, and
    // one because we start our slice ignoring the first.
    const len = UNCOMPRESSED_SCEP256K1_PUBLIC_KEY_LEN + 1
    const ret = buffer.slice(1, len)
    buffer = buffer.slice(len)
    return [new Identity(ret), buffer]
}

export {encode_identity, decode_identity}
