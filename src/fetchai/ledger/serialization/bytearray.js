import * as integer from './integer'

const encode = (buffer, value) => {
	// value in bytes (ascii encoded)
	buffer = integer.encode(buffer, value.length);
	return Buffer.concat([buffer, value])
}

export { encode }
