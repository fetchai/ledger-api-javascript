"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var integer = __importStar(require("./integer"));
var bn_js_1 = require("bn.js");
var encode_bytearray = function (buffer, value) {
    // value in bytes (ascii encoded)
    buffer = integer.encode_integer(buffer, new bn_js_1.BN(value.length));
    return Buffer.concat([buffer, value]);
};
exports.encode_bytearray = encode_bytearray;
var decode_bytearray = function (buffer) {
    var _a;
    var len;
    // value in bytes (ascii encoded);
    _a = __read(integer.decode_integer(buffer), 2), len = _a[0], buffer = _a[1];
    var value = buffer.slice(0, len.toNumber());
    buffer = buffer.slice(len);
    // then return the length of bytes specified in the header
    return [value, buffer];
};
exports.decode_bytearray = decode_bytearray;
//# sourceMappingURL=bytearray.js.map