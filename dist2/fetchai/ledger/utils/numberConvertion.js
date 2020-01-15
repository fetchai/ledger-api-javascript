"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../errors");
var bn_js_1 = require("bn.js");
/**
 * If number is not Big Number instance converts to BN, or throws if int passed is too large or small throw.
 *
 * @param num
 * @returns {BN}
 */
var convert_number = function (num) {
    // currently only support BN.js or number
    if (typeof num !== 'number' && !bn_js_1.BN.isBN(num)) {
        throw new errors_1.ValidationError(num + " is must be instance of BN.js or an Integer");
    }
    if (typeof num === 'number' && !Number.isSafeInteger(num)) {
        throw new errors_1.ValidationError(" " + num + " is not a safe integer number (<53 bits), please use an integer or instance of BN.js for numbers > 53 bits");
    }
    return new bn_js_1.BN(num);
};
exports.convert_number = convert_number;
//# sourceMappingURL=numberConvertion.js.map