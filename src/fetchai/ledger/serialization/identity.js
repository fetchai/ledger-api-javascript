// *******************************
// ********** Constants **********
// *******************************
const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY = 0x04
// const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY_LEN = 64

const encode = async(stream, value) => {
	stream.write(new Buffer([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]).toString())
	stream.write(new Buffer(value.public_key_bytes()).toString())
}

export {encode}
