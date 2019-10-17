import * as integer from './integer'

const encode = async (stream, value) => {
	// value in bytes (ascii encoded)
	stream = await integer.encode(stream, value.length)
	return Buffer.concat([stream, value])
}

export { encode }
