import { RunTimeError } from '../errors'

/**
 * Determine the number of bytes required to encode the input value.
 * Artificially limited to max of 8 bytes to be compliant
 *
 * @param  {value} calculate log2 num bytes
 */
// const _calculate_log2_num_bytes = async value => {
// 	for (let log2_num_bytes of Array.from(Array(4).keys())) {
// 		let limit = 1 << ((1 << log2_num_bytes) * 8)
// 		if (value < limit) {
// 			return log2_num_bytes
// 		}
// 		throw new ValidationError(
// 			'Unable to calculate the number of bytes required for this value'
// 		)
// 	}
// }

const _calculate_log2_num_bytes = async value => {
	// Todo: Improve logic
	const data = [256, 65536, 4294967296, 18446744073709551616]
	for (let log2_num_bytes of data) {
		if (value < log2_num_bytes) {
			return data.findIndex(val => val == log2_num_bytes)
		}
	}
	throw new RunTimeError(
		'Unable to calculate the number of bytes required for this value'
	)
}

/**
 * Encode a integer value into a bytes stream
 *
 * @param  {stream} Bytes data
 * @param  {value} The value to be encoded
 */
const encode = async (stream, value) => {
	const is_signed = value < 0
	const abs_value = Math.abs(value)

	if (!is_signed && abs_value <= 0x7) {
		stream.write(new Buffer([abs_value]).toString())
	} else {
		if (is_signed && abs_value <= 0x1f) {
			stream.write(new Buffer([0xe0 | abs_value]).toString())
		} else {
			// determine the number of bytes that will be needed to encode this value
			let log2_num_bytes = await _calculate_log2_num_bytes(abs_value)
			let num_bytes = 1 << log2_num_bytes

			// define the header
			let header
			if (is_signed) {
				header = 0xd0 | (log2_num_bytes & 0xf)
			} else {
				header = 0xc0 | (log2_num_bytes & 0xf)
			}

			let values = ''
			// encode all the parts fot the values
			values += Array.from(Array(num_bytes).keys())
				.reverse()
				.map(value => (abs_value >> (value * 8)) & 0xff)
			stream.write(new Buffer([header] + values).toString())
		}
	}
}

export { encode }
