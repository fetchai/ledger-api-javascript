import * as integer from './integer'

const encode = (buffer, value) => {
    // value in bytes (ascii encoded)
    buffer = integer.encode(buffer, value.length);
    return Buffer.concat([buffer, value])
}

const decode = (buffer) => {
    // value in bytes (ascii encoded);
    const len = integer.decode(buffer);
    const value = buffer.slice(0, len);
    buffer = buffer.slice(len);
    // then return the length of bytes specified in the header
    return [value, buffer];
}

export {encode, decode}
