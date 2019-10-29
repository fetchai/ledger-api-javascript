import * as integer from './integer'

const encode = (buffer, value) => {
    // value in bytes (ascii encoded)
    buffer = integer.encode(buffer, value.length);
    return Buffer.concat([buffer, value])
}

const decode = (container) => {
    // value in bytes (ascii encoded);
    const len = integer.decode(container);
    const value = container.buffer.slice(0, len);
    container.buffer = container.buffer.slice(len);
    // then return the length of bytes specified in the header
    return value;
}

export {encode, decode}
