import * as integer from './integer'
import  {BN} from 'bn.js'

const encode = (buffer, value) => {
	// value in bytes (ascii encoded)
	buffer = integer.encode(buffer,new BN(value.length))
	return Buffer.concat([buffer, value])
}

const decode = (container) => {
	// value in bytes (ascii encoded);
	const len = integer.decode(container)
	const value = container.buffer.slice(0, len.toNumber())
	container.buffer = container.buffer.slice(len)
	// then return the length of bytes specified in the header
	return value
}

export {encode, decode}
