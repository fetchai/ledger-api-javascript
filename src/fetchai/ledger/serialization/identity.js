// *******************************
// ********** Constants **********
// *******************************
const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY = 0x04
// const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY_LEN = 64

const encode = async(stream, value) => {
	// value in bytes
	stream = Buffer.concat([stream, new Buffer([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY])])
	return Buffer.concat([stream, value])
}

export {encode}
