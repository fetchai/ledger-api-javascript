import {ValidationError} from '../errors'
import {BN} from 'bn.js'


/**
 * If input is Big Number, integer (within bounds of safe integer size) or BigInt instance converts it to BN
 * else throws error.
 * @param num
 * @returns {BN}
 */``
const convert_number = (num: NumericInput): BN => {
    // currently only support BN.js or number
    if (typeof num !== 'number' && !BN.isBN(num) && typeof num !== 'bigint') {
        throw new ValidationError(`${num} is must be instance of BN.js or an Integer`)
    }

    if (typeof num === 'number' && !Number.isSafeInteger(num)) {
        throw new ValidationError(` ${num} is not a safe integer number (<53 bits), please use an integer or instance of BN.js for numbers > 53 bits`)
    }

    return (typeof num === 'bigint') ? new BN((num as BigInt).toString(16), 'hex') : new BN(num)
}

export {convert_number}
