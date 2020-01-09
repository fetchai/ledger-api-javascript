"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../errors");
var bn_js_1 = require("bn.js");
var LOGS = [];
LOGS.push(new bn_js_1.BN(256));
LOGS.push(new bn_js_1.BN(65536));
LOGS.push(new bn_js_1.BN(4294967296));
// over 53 bit number therefore must be passed as hex to BN
LOGS.push(new bn_js_1.BN(Buffer.from('FFFFFFFFFFFF9DDB99A168BD2A000000', 'hex')));
/**
 * Determine the number of bytes required to encode the input value.
 * Artificially limited to max of 8 bytes to be compliant
 *
 * @param  {value} calculate log2 num bytes as BN.js object
 */
var _calculate_log2_num_bytes = function (value) {
    for (var i = 0; i < LOGS.length; i++) {
        if (value.cmp(LOGS[i]) === -1)
            return i;
    }
    throw new errors_1.RunTimeError('Unable to calculate the number of bytes required for this value');
};
/**
 * Encode a integer value into a bytes buffer
 *
 * @param  {buffer} Bytes data
 * @param  {value} The value to be encoded as a BN.js object
 */
var encode_integer = function (buffer, value) {
    var is_signed = value.isNeg();
    var abs_value = value.abs();
    if (!is_signed && abs_value.lten(127)) {
        return Buffer.concat([buffer, Buffer.from([abs_value.toNumber()])]);
    }
    else {
        if (is_signed && abs_value.lten(31)) {
            return Buffer.concat([buffer, Buffer.from([0xE0 | abs_value.toNumber()])]);
        }
        else {
            var log2_num_bytes = _calculate_log2_num_bytes(abs_value);
            var num_bytes = new bn_js_1.BN(1).shln(log2_num_bytes);
            var val = (is_signed) ? new bn_js_1.BN(0xd0) : new bn_js_1.BN(0xc0);
            var header = val.or(new bn_js_1.BN(log2_num_bytes).and(new bn_js_1.BN(0xF))).toNumber();
            //   encode all the parts fot the values
            var values = Array.from(Array(num_bytes.toNumber()).keys())
                .reverse()
                .map(function (value) { return abs_value.shrn(value * 8).and(new bn_js_1.BN(0xFF)).toArrayLike(Buffer, 'be'); });
            return Buffer.concat([buffer, Buffer.concat([Buffer.from([header]), Buffer.concat(values)])]);
        }
    }
};
exports.encode_integer = encode_integer;
var decode_integer = function (buffer) {
    var header = buffer.slice(0, 1);
    buffer = buffer.slice(1);
    var header_integer = header.readUIntBE(0, 1);
    if ((header_integer & 0x80) === 0) {
        return [new bn_js_1.BN(header_integer & 0x7F), buffer];
    }
    var type = (header_integer & 0x60) >> 5;
    if (type === 3) {
        var decoded = -(header_integer & 0x1f);
        return [new bn_js_1.BN(decoded), buffer];
    }
    if (type === 2) {
        var signed_flag = Boolean(header_integer & 0x10);
        var log2_value_length = header_integer & 0x0F;
        var value_length = 1 << log2_value_length;
        var slice = buffer.slice(0, value_length);
        var value = new bn_js_1.BN(slice);
        buffer = buffer.slice(value_length);
        if (signed_flag) {
            value = value.neg();
        }
        return [value, buffer];
    }
};
exports.decode_integer = decode_integer;
//# sourceMappingURL=integer.js.map