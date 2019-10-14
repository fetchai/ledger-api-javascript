const encode = async (stream, address) => {
	stream.write(new Buffer(address).toString())
}

export { encode }
