import * as integer from './integer'
import {BN} from 'bn.js'

const encode = (buffer, value) => {
    // value in bytes (ascii encoded)
    buffer = integer.encode(buffer, new BN(value.length))
    return Buffer.concat([buffer, value])
}

const decode = (buffer) => {
    let len;
    // value in bytes (ascii encoded);
    [len, buffer] = integer.decode(buffer)
    const value = buffer.slice(0, len.toNumber())
    buffer = buffer.slice(len)
    // then return the length of bytes specified in the header
    return [value, buffer]
}
const DECODEBYTE = decode
const ENCODEBYTE = encode

export {encode, decode, DECODEBYTE, ENCODEBYTE}
