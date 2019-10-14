import * as integer from './integer'

const encode = async (stream, value) => {
	await integer.encode(stream, value.length)
	stream.write(new Buffer(value).toString())
}

export { encode }
