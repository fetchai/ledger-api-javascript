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
var integer = __importStar(require("../../../fetchai/ledger/serialization/integer"));
var bn_js_1 = require("bn.js");
describe(':Integer', function () {
    // encode tests
    test('test small unsigned encode', function () {
        var buffer = Buffer.from('');
        var encoded = integer.encode_integer(buffer, new bn_js_1.BN(4));
        expect(encoded.toString('hex')).toBe('04');
    });
    test('test small signed encode', function () {
        var buffer = Buffer.from('');
        var encoded = integer.encode_integer(buffer, new bn_js_1.BN(-4));
        expect(encoded.toString('hex')).toBe('e4');
    });
    test('test 1byte unsigned encode', function () {
        var buffer = Buffer.from('');
        var encoded = integer.encode_integer(buffer, new bn_js_1.BN(0x80));
        expect(encoded.toString('hex')).toBe('c080');
    });
    test('test 2byte unsigned encode', function () {
        var buffer = Buffer.from('');
        var encoded = integer.encode_integer(buffer, new bn_js_1.BN(0xEDEF));
        expect(encoded.toString('hex')).toBe('c1edef');
    });
    test('test 4byte unsigned encode', function () {
        var buffer = Buffer.from('');
        var encoded = integer.encode_integer(buffer, new bn_js_1.BN(0xEDEFABCD));
        expect(encoded.toString('hex')).toBe('c2edefabcd');
    });
    test('test 8byte unsigned encode', function () {
        var buffer = Buffer.from('');
        var eight_byte = new bn_js_1.BN('EDEFABCD01234567', 16);
        var encoded = integer.encode_integer(buffer, eight_byte);
        var expected_buffer = Buffer.from('c3edefabcd01234567', 'hex');
        expect(encoded).toMatchObject(expected_buffer);
    });
    test('test 1byte signed encode', function () {
        var buffer = Buffer.from('');
        var encoded = integer.encode_integer(buffer, new bn_js_1.BN(-0x80));
        expect(encoded.toString('hex')).toBe('d080');
    });
    test('test 2byte signed encode', function () {
        var buffer = Buffer.from('');
        var encoded = integer.encode_integer(buffer, new bn_js_1.BN(-0xEDEF));
        expect(encoded.toString('hex')).toBe('d1edef');
    });
    test('test 4byte signed encode', function () {
        var buffer = Buffer.from('');
        var encoded = integer.encode_integer(buffer, new bn_js_1.BN(-0xEDEFABCD));
        expect(encoded.toString('hex')).toBe('d2edefabcd');
    });
    test('test 8byte signed encode', function () {
        var buffer = Buffer.from('');
        var eight_byte = new bn_js_1.BN('-EDEFABCD01234567', 16);
        var encoded = integer.encode_integer(buffer, eight_byte);
        var expected_buffer = Buffer.from('D3EDEFABCD01234567', 'hex');
        expect(encoded).toMatchObject(expected_buffer);
    });
    // start decode tests
    test('test small unsigned decode', function () {
        var buff = Buffer.from('04', 'hex');
        var _a = __read(integer.decode_integer(buff), 2), decoded = _a[0], buffer = _a[1];
        var reference = new bn_js_1.BN(4);
        var comparison = decoded.cmp(reference);
        expect(comparison).toBe(0);
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
    test('test small signed decode', function () {
        var buff = Buffer.from('E4', 'hex');
        var _a = __read(integer.decode_integer(buff), 2), decoded = _a[0], buffer = _a[1];
        var reference = new bn_js_1.BN(-4);
        var comparison = decoded.cmp(reference);
        expect(comparison).toBe(0);
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
    test('test 1byte unsigned decode', function () {
        var buff = Buffer.from('C080', 'hex');
        var _a = __read(integer.decode_integer(buff), 2), decoded = _a[0], buffer = _a[1];
        var reference = new bn_js_1.BN('80', 16);
        var comparison = decoded.cmp(reference);
        expect(comparison).toBe(0);
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
    test('test 2byte unsigned decode', function () {
        var buff = Buffer.from('C1EDEF', 'hex');
        var _a = __read(integer.decode_integer(buff), 2), decoded = _a[0], buffer = _a[1];
        var reference = new bn_js_1.BN('EDEF', 16);
        var comparison = decoded.cmp(reference);
        expect(comparison).toBe(0);
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
    test('test 4byte unsigned decode', function () {
        var buff = Buffer.from('C2EDEFABCD', 'hex');
        var _a = __read(integer.decode_integer(buff), 2), decoded = _a[0], buffer = _a[1];
        var reference = new bn_js_1.BN('EDEFABCD', 16);
        var comparison = decoded.cmp(reference);
        expect(comparison).toBe(0);
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
    test('test 8byte unsigned decode', function () {
        var buff = Buffer.from('C3EDEFABCD01234567', 'hex');
        var _a = __read(integer.decode_integer(buff), 2), decoded = _a[0], buffer = _a[1];
        var reference = new bn_js_1.BN('EDEFABCD01234567', 16);
        expect(reference.toArrayLike(Buffer, 'be')).toMatchObject(decoded.toArrayLike(Buffer, 'be'));
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
    test('test 1byte signed decode', function () {
        var _a = __read(integer.decode_integer(Buffer.from('D080', 'hex')), 2), decoded = _a[0], buffer = _a[1];
        var reference = new bn_js_1.BN('-80', 16);
        var comparison = decoded.cmp(reference);
        expect(comparison).toBe(0);
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
    test('test 2byte signed decode', function () {
        var _a = __read(integer.decode_integer(Buffer.from('D1EDEF', 'hex')), 2), decoded = _a[0], buffer = _a[1];
        var reference = new bn_js_1.BN('-EDEF', 16);
        var comparison = decoded.cmp(reference);
        expect(comparison).toBe(0);
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
    test('test 4byte signed decode', function () {
        var _a = __read(integer.decode_integer(Buffer.from('D1EDEF', 'hex')), 2), decoded = _a[0], buffer = _a[1];
        var reference = new bn_js_1.BN('-EDEF', 16);
        var comparison = decoded.cmp(reference);
        expect(comparison).toBe(0);
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
    test('test 8byte signed decode', function () {
        var buff = Buffer.from('D3EDEFABCD01234567', 'hex');
        var _a = __read(integer.decode_integer(buff), 2), decoded = _a[0], buffer = _a[1];
        var reference = new bn_js_1.BN('-EDEFABCD01234567', 16);
        var comparison = decoded.cmp(reference);
        expect(comparison).toBe(0);
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
});
//# sourceMappingURL=test_integer.js.map