const encode = async (stream, address) => {
	// address is in hex format
	return Buffer.concat([stream, new Buffer(address, 'hex')])
}

export { encode }
