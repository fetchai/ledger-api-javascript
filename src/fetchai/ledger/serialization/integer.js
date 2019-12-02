import {RunTimeError, ValidationError} from '../errors'
import {BN} from 'bn.js'


const LOGS = []
LOGS.push(new BN(256))
LOGS.push(new BN(65536))
LOGS.push(new BN(4294967296))
// over 53 bit number therefore must be passed as hex to BN
LOGS.push(new BN(Buffer.from('FFFFFFFFFFFF9DDB99A168BD2A000000', 'hex')))

/**
 * Determine the number of bytes required to encode the input value.
 * Artificially limited to max of 8 bytes to be compliant
 *
 * @param  {value} calculate log2 num bytes as BN.js object
 */
const _calculate_log2_num_bytes = value => {

    for (let i = 0; i < LOGS.length; i++) {
        if (value.cmp(LOGS[i]) === -1) return i
    }
    throw new RunTimeError(
        'Unable to calculate the number of bytes required for this value'
    )
}

/**
 * Encode a integer value into a bytes buffer
 *
 * @param  {buffer} Bytes data
 * @param  {value} The value to be encoded as a BN.js object
 */
const encode_integer = (buffer, value) => {

    if (!BN.isBN(value)) {
        throw new ValidationError('value to encode must be BN.js object')
    }

    const is_signed = value.isNeg()
    const abs_value = value.abs()

    if (!is_signed && abs_value.lten(127)) {
        return Buffer.concat([buffer, Buffer.from([abs_value.toNumber()])])
    } else {
        if (is_signed && abs_value.lten(31)) {
            return Buffer.concat([buffer, Buffer.from([0xE0 | abs_value.toNumber()])])
        } else {
            const log2_num_bytes = _calculate_log2_num_bytes(abs_value)
            const num_bytes = new BN(1).shln(log2_num_bytes)
            const val = (is_signed) ? new BN(0xd0) : new BN(0xc0)
            const header = val.or(new BN(log2_num_bytes).and(new BN(0xF))).toNumber()

            //   encode all the parts fot the values
            let values = Array.from(Array(num_bytes.toNumber()).keys())
                .reverse()
                .map(value => abs_value.shrn(value * 8).and(new BN(0xFF)).toArrayLike(Buffer, 'be'))
            return Buffer.concat([buffer, Buffer.concat([Buffer.from([header]), Buffer.concat(values)])])
        }
    }
}


const decode_integer = (buffer) => {

    if (buffer.length === 0) {
        throw new ValidationError('Incorrect value being decoded')
    }

    const header = buffer.slice(0, 1)
    buffer = buffer.slice(1)
    const header_integer = header.readUIntBE(0, 1)

    if ((header_integer & 0x80) === 0) {
        return [new BN(header_integer & 0x7F), buffer]
    }

    const type = (header_integer & 0x60) >> 5
    if (type === 3) {
        const decoded = -(header_integer & 0x1f)
        return [new BN(decoded), buffer]
    }

    if (type === 2) {
        const signed_flag = Boolean(header_integer & 0x10)
        const log2_value_length = header_integer & 0x0F
        const value_length = 1 << log2_value_length
        let slice = buffer.slice(0, value_length)
        let value = new BN(slice)
        buffer = buffer.slice(value_length)

        if (signed_flag) {
            value = value.neg()
        }
        return [value, buffer]
    }
}

export {encode_integer, decode_integer}
