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
var identity = __importStar(require("../../../fetchai/ledger/serialization/identity"));
var entity_1 = require("../../../fetchai/ledger/crypto/entity");
var UNCOMPRESSED_SCEP256K1_PUBLIC_KEY = 0x04;
describe(':Identity', function () {
    test('test encode', function () {
        var entity = new entity_1.Entity();
        var buffer = Buffer.from('');
        var ref = Buffer.concat([buffer, Buffer.from([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]), entity.public_key_bytes()]);
        var bytes = entity.public_key_bytes();
        var encoded = identity.encode_identity(buffer, bytes);
        var buffer2 = Buffer.from(''); // think I can use same buffer as above refactor out when passing tests.
        var encoded_2 = identity.encode_identity(buffer2, bytes);
        // testing the passed in buffer
        expect(Buffer.byteLength(ref)).toBe(Buffer.byteLength(encoded));
        expect(ref.toString('hex')).toBe(encoded.toString('hex'));
        // testing the passed in entity.
        expect(Buffer.byteLength(ref)).toBe(Buffer.byteLength(encoded_2));
        expect(ref.toString('hex')).toBe(encoded_2.toString('hex'));
    });
    test('test decode', function () {
        var entity = new entity_1.Entity();
        var buf = Buffer.from('');
        var ref = Buffer.concat([buf, Buffer.from([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]), entity.public_key_bytes()]);
        var _a = __read(identity.decode_identity(ref), 2), decoded = _a[0], buffer = _a[1];
        var bytes = entity.public_key_bytes();
        expect(decoded.public_key_bytes().toString('hex')).toBe(bytes.toString('hex'));
        expect(Buffer.byteLength(buffer)).toBe(0);
    });
});
//# sourceMappingURL=test_identity.js.map