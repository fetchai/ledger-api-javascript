import * as integer from './integer'
import {BN} from 'bn.js'

const encode_bytearray = (buffer, value) => {
    // value in bytes (ascii encoded)
    buffer = integer.encode_integer(buffer, new BN(value.length))
    return Buffer.concat([buffer, value])
}

const decode_bytearray = (buffer) => {
    let len;
    // value in bytes (ascii encoded);
    [len, buffer] = integer.decode_integer(buffer)
    const value = buffer.slice(0, len.toNumber())
    buffer = buffer.slice(len)
    // then return the length of bytes specified in the header
    return [value, buffer]
}

export {encode_bytearray, decode_bytearray}
