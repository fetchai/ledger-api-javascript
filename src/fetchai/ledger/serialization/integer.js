import { RunTimeError } from '../errors'
import { NotImplementedError } from '../errors'
import { ValidationError } from '../errors'

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

const _calculate_log2_num_bytes = value => {
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
 * Encode a integer value into a bytes buffer
 *
 * @param  {buffer} Bytes data
 * @param  {value} The value to be encoded
 */
const encode = (buffer, value) => {
	const is_signed = value < 0
	const abs_value = Math.abs(value)

	if (!is_signed && abs_value <= 0x7f) {
		return Buffer.concat([buffer, Buffer.from([abs_value])])
	} else {
		if (is_signed && abs_value <= 0x1f) {
			return Buffer.concat([buffer, Buffer.from([0xe0 | abs_value])])
		} else {
			// determine the number of bytes that will be needed to encode this value
			let log2_num_bytes = _calculate_log2_num_bytes(abs_value)
			let num_bytes = 1 << log2_num_bytes

			// define the header
			let header
			if (is_signed) {
				header = 0xd0 | (log2_num_bytes & 0xf)
			} else {
				header = 0xc0 | (log2_num_bytes & 0xf)
			}

			// encode all the parts fot the values
			let values = Array.from(Array(num_bytes).keys())
				.reverse()
				.map(value => (abs_value >> (value * 8)) & 0xff)
			return Buffer.concat([
				buffer,
				Buffer.concat([Buffer.from([header]), Buffer.from(values)])
			])
		}
	}
}

const decode = buffer => {
	if (buffer.length === 0) {
		throw new ValidationError('Incorrect value being decoded')
	}

	const header = buffer.slice(0, 1)
	buffer = buffer.slice(1)
	const header_integer = header.readUIntBE(0, 1)

	if ((header_integer & 0x80) == 0) {
		return header_integer & 0x7f
	}

	const type = (header_integer & 0x60) >> 5
	if (type === 3) {
		const ret = -(header_integer & 0x1f)
		return ret
	}

	if (type === 2) {
		const signed_flag = Boolean(header_integer & 0x10)
		const log2_value_length = header_integer & 0x0f
		const value_length = 1 << log2_value_length
		let value

		if (value_length > 6) {
			throw new NotImplementedError(
				'8 Byte support is not yet implemented in this Javascript SDK'
			)
		}

		value = buffer.readUIntBE(0, value_length)
		if (signed_flag) {
			value = -value
		}
		return value
	}
}

export { encode, decode }
