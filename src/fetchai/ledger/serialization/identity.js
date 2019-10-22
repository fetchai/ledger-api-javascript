import {Identity} from '../crypto/identity.js'
// *******************************
// ********** Constants **********
// *******************************
const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY = 0x04
//*** IMPORTANT ****/////
const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY_LEN = 64;

const encode = (buffer, value) => {
    if (value instanceof Identity) {
        return Buffer.concat([buffer, new Buffer([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]), Identity.public_key_bytes])
    } else {
        return Buffer.concat([buffer, new Buffer([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]), value])
    }
}

const decode = (buffer) => {
    const header = buffer.slice(0, 1);
    const hex = parseInt(header.toString('hex'));

    if (hex !== UNCOMPRESSED_SCEP256K1_PUBLIC_KEY) {
        throw new ValidationError('Unsupported identity type');
    }
    // we add one to this value because our key is longer by one, and
    // one because we start our slice ignoring the first.
    const len = UNCOMPRESSED_SCEP256K1_PUBLIC_KEY_LEN + 2;
    return buffer.slice(1, len);
}

export {encode, decode}
