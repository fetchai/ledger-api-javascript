// *******************************
// ********** Constants **********
// *******************************
const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY = 0x04
// const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY_LEN = 64

const encode = (buffer, value) => {
	// value in bytes
	return Buffer.concat([buffer, new Buffer([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]), value])
}

export {encode}
