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
var address_1 = require("../../fetchai/ledger/crypto/address");
var identity_1 = require("../../fetchai/ledger/crypto/identity");
var bs58 = __importStar(require("bs58"));
var errors_1 = require("../../fetchai/ledger/errors");
var helpers_1 = require("../utils/helpers");
describe(':Address', function () {
    test('test construction from string', function () {
        // generate a random 32 byte buffer
        var digest = helpers_1.calc_digest(Buffer.from('rand'));
        var bs58_encoded = bs58.encode(digest);
        var _a = __read(helpers_1.calc_address(bs58_encoded), 2), expected_address_bytes = _a[0], expected_display = _a[1];
        var address = new address_1.Address(expected_display);
        expect(address.toBytes()).toMatchObject(expected_address_bytes);
        expect(address.toString()).toBe(expected_display);
    });
    test('test construction from bytes', function () {
        var digest = helpers_1.calc_digest(Buffer.from('rand'));
        var bs58_encoded = bs58.encode(digest);
        var _a = __read(helpers_1.calc_address(bs58_encoded), 1), expected_address_bytes = _a[0];
        var address = new address_1.Address(expected_address_bytes);
        expect(address.toBytes()).toMatchObject(expected_address_bytes);
    });
    test('test construction from address', function () {
        var digest = helpers_1.calc_digest(Buffer.from('rand'));
        var bs58_encoded = bs58.encode(digest);
        var _a = __read(helpers_1.calc_address(bs58_encoded), 1), expected_address_bytes = _a[0];
        var address1 = new address_1.Address(expected_address_bytes);
        var address2 = new address_1.Address(address1);
        expect(address2.toBytes()).toMatchObject(expected_address_bytes);
    });
    test('test invalid length bytes', function () {
        var digest = helpers_1.calc_digest(Buffer.from('rand'));
        var invalid_address = Buffer.concat([digest, digest]);
        expect(function () {
            new address_1.Address(invalid_address);
        }).toThrow(errors_1.ValidationError);
    });
    test('test invalid length string on is_address', function () {
        var invalid_string = Buffer.from('rand');
        var bs58_encoded = bs58.encode(invalid_string);
        var valid = address_1.Address.is_address(bs58_encoded);
        expect(valid).toBe(false);
    });
    test('test invalid length string', function () {
        var invalid_string = Buffer.from('rand');
        var bs58_encoded = bs58.encode(invalid_string);
        expect(function () {
            new address_1.Address(bs58_encoded);
        }).toThrow(errors_1.ValidationError);
    });
    test('test invalid type', function () {
        expect(function () {
            new address_1.Address("99");
        }).toThrow(errors_1.ValidationError);
    });
    // test is_address
    test('test invalid type is_address', function () {
        var valid = address_1.Address.is_address("99");
        expect(valid).toBe(false);
    });
    test('test valid display string with is_address', function () {
        var valid = address_1.Address.is_address('nLYsNsbFGDgcGJa3e7xn2V82fnpaGZVSuJUHCkeY9Cm6SfEyG');
        expect(valid).toBe(true);
    });
    test('test invalid valid display string with is_address', function () {
        var valid = address_1.Address.is_address('nLYssssNsbFGDgcGJa3e7xn2V82fnpaGZVSuJUHCkeY9Cm6SfEyG');
        expect(valid).toBe(false);
    });
    test('test hex display', function () {
        var digest = helpers_1.calc_digest(Buffer.from('rand'));
        var bs58_encoded = bs58.encode(digest);
        var _a = __read(helpers_1.calc_address(bs58_encoded), 1), expected_address_bytes = _a[0];
        var address = new address_1.Address(expected_address_bytes);
        var address_bytes = address.toBytes();
        var hex_address = address_bytes.toString('hex');
        var actual = address.toHex();
        expect(actual).toBe(hex_address);
    });
    test('test invalid display', function () {
        var digest = helpers_1.calc_digest(Buffer.from('rand'));
        var bs58_encoded = bs58.encode(digest);
        var _a = __read(helpers_1.calc_address(bs58_encoded), 2), expected_display = _a[1];
        var address = new address_1.Address(expected_display);
        var address_bytes = address.toBytes();
        var invalid_checksum = Buffer.from('1134');
        var display = Buffer.concat([address_bytes, invalid_checksum]);
        var bs58invalid = bs58.encode(display);
        expect(function () {
            new address_1.Address(Buffer.from(bs58invalid));
        }).toThrow(errors_1.ValidationError);
    });
    test('test hardcoded addresses', function () {
        var identity1 = new identity_1.Identity(Buffer.from('11f2b9a49c76fdaee79b9f470594b51c09299ef4294ea9cf545be4d9d303cc0d28013a21e085a0a1f68bae3f203c375fae182bc69f994290224b563b43388183', 'hex'));
        var expected_display = 'nLYsNsbFGDgcGJa3e7xn2V82fnpaGZVSuJUHCkeY9Cm6SfEyG';
        var address1 = new address_1.Address(expected_display);
        var address2 = new address_1.Address(identity1);
        var address1_bytes = address1.toBytes();
        var address2_bytes = address2.toBytes();
        var expected_raw_address = '66f17ebc835641521877ef171e0275e0ce923b02b3cbf1965e59fe950277a582';
        expect(address1_bytes.toString('hex')).toBe(expected_raw_address);
        expect(address2_bytes.toString('hex')).toBe(expected_raw_address);
        expect(address1.toString()).toBe(expected_display);
        expect(address2.toString()).toBe(expected_display);
    });
});
//# sourceMappingURL=test_address.js.map