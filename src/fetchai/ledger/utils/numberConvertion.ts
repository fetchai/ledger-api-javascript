import {ValidationError} from "../errors";
import {BN} from 'bn.js'


/**
 * If number is not Big Number instance converts to BN, or throws if int passed is too large or small throw.
 *
 * @param num
 * @returns {BN}
 */
const convert_number = (num: NumericInput) => {
    // currently only support BN.js or number
    if (typeof num !== 'number' && !BN.isBN(num)) {
        throw new ValidationError(`${num} is must be instance of BN.js or an Integer`)
    }

    if (typeof num === 'number' && !Number.isSafeInteger(num)) {
        throw new ValidationError(` ${num} is not a safe number (<53 bits), please use an instance of BN.js`)
    }

    return new BN(num)
}

export {convert_number}
