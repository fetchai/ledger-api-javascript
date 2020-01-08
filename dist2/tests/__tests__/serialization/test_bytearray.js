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
var bytearray = __importStar(require("../../../fetchai/ledger/serialization/bytearray"));
describe(':Bytearray', function () {
    test('test encode', function () {
        var data = Buffer.from('3E8', 'hex');
        var buf = Buffer.from('');
        var encoded = bytearray.encode_bytearray(buf, data);
        expect(encoded.toString('hex')).toBe('013e');
    });
    test('test decode', function () {
        var data = Buffer.from('0A00010203040506070809', 'hex');
        var _a = __read(bytearray.decode_bytearray(data), 2), decoded = _a[0], buffer = _a[1];
        expect(decoded.toString('hex')).toBe('00010203040506070809');
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
});
//# sourceMappingURL=test_bytearray.js.map