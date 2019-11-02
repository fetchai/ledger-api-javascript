import {RunTimeError} from '../errors'
import {NotImplementedError} from "../errors";
import {ValidationError} from "../errors";
import  {BN} from "bn.js";
import assert from 'assert'
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
    let data  = [];
    data.push(new BN(256));
    data.push(new BN(65536));
    data.push(new BN(4294967296));
    // data.push(new BN(10000000000000000, 16));
   // const eight_byte = Buffer.from('10000000000000000', 'hex');
    //data.push(new BN(eight_byte));
    const eight_byte2 = Buffer.from('FFFFFFFFFFFF9DDB99A168BD2A000000', 'hex');
     data.push(new BN(eight_byte2));

   // const data = [new BN(256), new BN(65536), new BN(4294967296), new BN(18446744073709551616)]
   // for (let log2_num_bytes of data) {
    for(let i =0; i < data.length; i++){
        if(value.cmp(data[i]) === -1) return i;
    }
    debugger;
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
    let is_signed = value < 0


    let abs_value;
    if(BN.isBN(value)){
        debugger;
        is_signed = value.isNeg();
        var i = parseInt(buffer.toString("hex"), 16);
         abs_value = Math.abs(i)
    } else {
         abs_value = Math.abs(value)
    }



    if (!BN.isBN(value) && !is_signed && abs_value <= 0x7f) {
        return Buffer.concat([buffer, new Buffer([abs_value])])
    } else {
        if (!BN.isBN(value) && is_signed && abs_value <= 0x1F) {
            return Buffer.concat([buffer, new Buffer([0xE0 | abs_value])])
        } else {
            // determine the number of bytes that will be needed to encode this value
           // let log2_num_byteso = _calculate_log2_num_byteso(abs_value)
           //  let num_byteso = 1 << log2_num_byteso
           //
           //  // define the header
           //  let headero
           //  if (is_signed) {
           //      headero = 0xd0 | (log2_num_byteso & 0xF)
           //  } else {
           //      headero = 0xc0 | (log2_num_byteso & 0xF)
           //  }

            //  const val_buffer = value + ""
               let abs_buffer = new BN(value).abs();
            let log2_num_bytes = _calculate_log2_num_bytes(abs_buffer)
            let one = new BN(1);
            let num_bytes = one.shln(log2_num_bytes);

// assert(num_byteso === num_bytes.toNumber());
            // define the header
            let header, temp, temp9;
            if (is_signed) {
                temp9 = new BN(0xd0);
            } else {
                 temp9 = new BN(0xc0);
                }

            var log2_num_bytes_BN = new BN(log2_num_bytes);
                const temp1 = new BN(0xF)
                temp = log2_num_bytes_BN.and(temp1)

                header = temp9.or(temp);
               // assert(headero === header.toNumber());
                header = header.toNumber();

                num_bytes = num_bytes.toNumber();

                const abs_buffer2 = new BN(value).abs()

          //   encode all the parts fot the values
            let values = Array.from(Array(num_bytes).keys())
                .reverse()
             .map(value => {
                    const res = value*8;
                    const resx = abs_buffer2.shrn(res)
                     const res3 = resx.and(new BN(0xFF))
                    return res3.toBuffer();
                   //  (abs_value >> (value * 8)) & 0xFF
                })

              var buf99 = Buffer.concat(values);

                //.map(value => (abs_value >> (value * 8)) & 0xFF)
            return Buffer.concat([buffer, Buffer.concat([new Buffer([header]), buf99])])
        }
    }
}

/**
 *
 * container is an object containing the buffer allowing pass by reference of the buffer.
 *
 * { buffer: Buffer }
 *
 */
const decode = (container) => {

    if (container.buffer.length === 0) {
        throw new ValidationError('Incorrect value being decoded');
    }

    const header = container.buffer.slice(0, 1);
    container.buffer = container.buffer.slice(1);
    const header_integer = header.readUIntBE(0, 1);

    if ((header_integer & 0x80) == 0) {
        return header_integer & 0x7F;
    }

    const type = (header_integer & 0x60) >> 5;
    if (type === 3) {
        const ret = -(header_integer & 0x1f);
        return ret;
    }

    if (type === 2) {
        const signed_flag = Boolean(header_integer & 0x10);
        const log2_value_length = header_integer & 0x0F;
        const value_length = 1 << log2_value_length;
        let shift, value, byte_value, slice;



       //  value = container.buffer.readUIntBE(0, value_length);
        let temp = container.buffer.slice(0, value_length)
        value = new BN(temp);
        container.buffer = container.buffer.slice(value_length);
        if (signed_flag) {
            //value = -value;
            value = value.neg();
           //let q = new BN(value);
        }
        if(value_length > 6){
            return value;
        } else
        return value.toNumber();
    }
};

export {encode, decode}
