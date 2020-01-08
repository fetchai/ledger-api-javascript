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
var address = __importStar(require("../../../fetchai/ledger/serialization/address"));
var address_1 = require("../../../fetchai/ledger/crypto/address");
var helpers_1 = require("../../utils/helpers");
describe(':Address', function () {
    test('test encode', function () {
        var ref_address = helpers_1.dummy_address();
        var buf = Buffer.from('');
        var encoded = address.encode_address(buf, ref_address);
        var expected = ref_address.toBytes();
        expect(Buffer.byteLength(expected)).toBe(Buffer.byteLength(encoded));
        expect(expected.toString('hex')).toBe(encoded.toString('hex'));
    });
    test('test decode', function () {
        var ref_address = helpers_1.dummy_address();
        var _a = __read(address.decode_address(ref_address.toBytes()), 2), address_obj = _a[0], buffer = _a[1];
        var expected = ref_address.toBytes();
        var address_bytes = address_obj.toBytes();
        expect(address_obj).toBeInstanceOf(address_1.Address);
        expect(address_bytes.toString('hex')).toBe(expected.toString('hex'));
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
});
//# sourceMappingURL=test_address.js.map