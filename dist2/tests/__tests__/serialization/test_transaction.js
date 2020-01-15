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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var transaction_1 = require("../../../fetchai/ledger/transaction");
var bitvector_1 = require("../../../fetchai/ledger/bitvector");
var identity_1 = require("../../../fetchai/ledger/crypto/identity");
var transaction_2 = require("../../../fetchai/ledger/serialization/transaction");
var bytearray = __importStar(require("../../../fetchai/ledger/serialization/bytearray"));
var errors_1 = require("../../../fetchai/ledger/errors");
var bn_js_1 = require("bn.js");
var helpers_1 = require("../../utils/helpers");
var _calculate_integer_stream_size = function (len) {
    if (len < 0x80) {
        return 1;
    }
    else if (len < 0x100) {
        return 2;
    }
    else if (len < 0x1000) {
        return 4;
    }
    else {
        return 8;
    }
};
var EXPECTED_SIGNATURE_BYTE_LEN = 64;
var EXPECTED_SIGNATURE_LENGTH_FIELD_LEN = 1;
var EXPECTED_SERIAL_SIGNATURE_LENGTH = EXPECTED_SIGNATURE_BYTE_LEN + EXPECTED_SIGNATURE_LENGTH_FIELD_LEN;
describe(':Transaction', function () {
    test('test simple decode transaction ', function () {
        var EXPECTED_PAYLOAD = 'a1640000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d44235130ac5aab442e39f9aa27118956695229212dd2f1ab5b714e9f6bd581511c1010000000001020304050607080418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
        var payload = new transaction_1.Transaction();
        payload.from_address(helpers_1.IDENTITIES[0]);
        payload.add_transfer(helpers_1.IDENTITIES[1], new bn_js_1.BN(256));
        payload.add_signer(helpers_1.IDENTITIES[0].public_key_hex());
        payload.counter(new bn_js_1.BN('0102030405060708', 'hex'));
        debugger;
        var transaction_bytes = transaction_2.encode_transaction(payload, [helpers_1.ENTITIES[0]]);
        assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
        var _a = __read(transaction_2.decode_transaction(transaction_bytes), 2), success = _a[0], tx = _a[1];
        expect(success).toBe(true);
        assertTxAreEqual(payload, tx);
    });
    test('test multiple transfers ', function () {
        var EXPECTED_PAYLOAD = 'a1660000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d4014235130ac5aab442e39f9aa27118956695229212dd2f1ab5b714e9f6bd581511c1010020f478c7f74b50c187bf9a8836f382bd62977baeeaf19625608e7e912aa60098c10200da2e9c3191e3768d1c59ea43f6318367ed9b21e6974f46a60d0dd8976740af6dc2000186a000000000000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
        var payload = new transaction_1.Transaction();
        payload.from_address(helpers_1.IDENTITIES[0]);
        payload.add_transfer(helpers_1.IDENTITIES[1], new bn_js_1.BN(256));
        payload.add_transfer(helpers_1.IDENTITIES[2], new bn_js_1.BN(512));
        payload.add_transfer(helpers_1.IDENTITIES[3], new bn_js_1.BN(100000));
        payload.add_signer(helpers_1.IDENTITIES[0].public_key_hex());
        payload.counter(new bn_js_1.BN(new Buffer(8).fill(0)));
        var transaction_bytes = transaction_2.encode_transaction(payload, [helpers_1.ENTITIES[0]]);
        assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
        var _a = __read(transaction_2.decode_transaction(transaction_bytes), 2), success = _a[0], tx = _a[1];
        expect(success).toBe(true);
        assertTxAreEqual(payload, tx);
    });
});
test('test synergetic_data_submission', function () {
    debugger;
    var EXPECTED_PAYLOAD = 'a160c000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d4c1271001c3000000e8d4a5100080e6672a9d98da667e5dc25b2bca8acf9644a7ac0797f01cb5968abf39de011df204646174610f7b2276616c7565223a20313233347d00000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    var payload = new transaction_1.Transaction();
    payload.from_address(helpers_1.IDENTITIES[0]);
    payload.valid_until(new bn_js_1.BN(10000));
    payload.target_contract(helpers_1.IDENTITIES[4], new bitvector_1.BitVector());
    payload.charge_rate(new bn_js_1.BN(1));
    payload.charge_limit(new bn_js_1.BN(1000000000000));
    payload.action('data');
    payload.synergetic_data_submission(true);
    payload.data('{"value": 1234}');
    payload.add_signer(helpers_1.IDENTITIES[0].public_key_hex());
    payload.counter(new bn_js_1.BN(new Buffer(8).fill(0)));
    var transaction_bytes = transaction_2.encode_transaction(payload, [helpers_1.ENTITIES[0]]);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    // attempt to decode a transaction from the generated bytes
    var _a = __read(transaction_2.decode_transaction(transaction_bytes), 2), success = _a[0], tx = _a[1];
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx);
});
test('test chain code', function () {
    var EXPECTED_PAYLOAD = 'a1608000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d400c103e8c2000f4240800b666f6f2e6261722e62617a066c61756e636802676f00000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    var payload = new transaction_1.Transaction();
    payload.from_address(helpers_1.IDENTITIES[0]);
    payload.add_signer(helpers_1.IDENTITIES[0].public_key_hex());
    payload.charge_rate(new bn_js_1.BN(1000));
    payload.charge_limit(new bn_js_1.BN(1000000));
    payload.target_chain_code('foo.bar.baz', new bitvector_1.BitVector());
    payload.action('launch');
    payload.data('go');
    payload.counter(new bn_js_1.BN(new Buffer(8).fill(0)));
    var transaction_bytes = transaction_2.encode_transaction(payload, [helpers_1.ENTITIES[0]]);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    var _a = __read(transaction_2.decode_transaction(transaction_bytes), 2), success = _a[0], tx = _a[1];
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx);
});
test('test smart contract', function () {
    var EXPECTED_PAYLOAD = 'a1604000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d400c103e8c2000f424080e6672a9d98da667e5dc25b2bca8acf9644a7ac0797f01cb5968abf39de011df2066c61756e636802676f00000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    var payload = new transaction_1.Transaction();
    payload.from_address(helpers_1.IDENTITIES[0]);
    payload.add_signer(helpers_1.IDENTITIES[0].public_key_hex());
    payload.charge_rate(new bn_js_1.BN(1000));
    payload.charge_limit(new bn_js_1.BN(1000000));
    payload.target_contract(helpers_1.IDENTITIES[4], new bitvector_1.BitVector());
    payload.action('launch');
    payload.data('go');
    payload.counter(new bn_js_1.BN(new Buffer(8).fill(0)));
    var transaction_bytes = transaction_2.encode_transaction(payload, [helpers_1.ENTITIES[0]]);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    var _a = __read(transaction_2.decode_transaction(transaction_bytes), 2), success = _a[0], tx = _a[1];
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx);
});
test('test validity ranges', function () {
    var EXPECTED_PAYLOAD = 'a1670000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d4024235130ac5aab442e39f9aa27118956695229212dd2f1ab5b714e9f6bd581511c103e820f478c7f74b50c187bf9a8836f382bd62977baeeaf19625608e7e912aa60098c103e8da2e9c3191e3768d1c59ea43f6318367ed9b21e6974f46a60d0dd8976740af6dc103e8e6672a9d98da667e5dc25b2bca8acf9644a7ac0797f01cb5968abf39de011df2c103e864c0c8c103e8c2000f424000000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    var payload = new transaction_1.Transaction();
    payload.from_address(helpers_1.IDENTITIES[0]);
    payload.add_transfer(helpers_1.IDENTITIES[1], new bn_js_1.BN(1000));
    payload.add_transfer(helpers_1.IDENTITIES[2], new bn_js_1.BN(1000));
    payload.add_transfer(helpers_1.IDENTITIES[3], new bn_js_1.BN(1000));
    payload.add_transfer(helpers_1.IDENTITIES[4], new bn_js_1.BN(1000));
    payload.add_signer(helpers_1.IDENTITIES[0].public_key_hex());
    payload.charge_rate(new bn_js_1.BN(1000));
    payload.charge_limit(new bn_js_1.BN(1000000));
    payload.valid_from(new bn_js_1.BN(100));
    payload.valid_until(new bn_js_1.BN(200));
    payload.counter(new bn_js_1.BN(new Buffer(8).fill(0)));
    var transaction_bytes = transaction_2.encode_transaction(payload, [helpers_1.ENTITIES[0]]);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    var _a = __read(transaction_2.decode_transaction(transaction_bytes), 2), success = _a[0], tx = _a[1];
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx);
});
test('test contract with 2bit shard mask', function () {
    var EXPECTED_PAYLOAD = 'a1618000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d464c0c8c103e8c2000f4240010b666f6f2e6261722e62617a066c61756e63680000000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    var mask = new bitvector_1.BitVector(2);
    mask.set(0, 1);
    var payload = new transaction_1.Transaction();
    payload.from_address(helpers_1.IDENTITIES[0]);
    payload.add_signer(helpers_1.IDENTITIES[0].public_key_hex());
    payload.charge_rate(new bn_js_1.BN(1000));
    payload.charge_limit(new bn_js_1.BN(1000000));
    payload.valid_from(new bn_js_1.BN(100));
    payload.valid_until(new bn_js_1.BN(200));
    payload.target_chain_code('foo.bar.baz', mask);
    payload.action('launch');
    payload.counter(new bn_js_1.BN(new Buffer(8).fill(0)));
    var transaction_bytes = transaction_2.encode_transaction(payload, [helpers_1.ENTITIES[0]]);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    var _a = __read(transaction_2.decode_transaction(transaction_bytes), 2), success = _a[0], tx = _a[1];
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx);
});
test('test contract with 4bit shard mask', function () {
    var EXPECTED_PAYLOAD = 'a1618000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d464c0c8c103e8c2000f42401c0b666f6f2e6261722e62617a066c61756e63680000000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    var mask = new bitvector_1.BitVector(4);
    mask.set(3, 1);
    mask.set(2, 1);
    var payload = new transaction_1.Transaction();
    payload.from_address(helpers_1.IDENTITIES[0]);
    payload.add_signer(helpers_1.IDENTITIES[0].public_key_hex());
    payload.charge_rate(new bn_js_1.BN(1000));
    payload.charge_limit(new bn_js_1.BN(1000000));
    payload.valid_from(new bn_js_1.BN(100));
    payload.valid_until(new bn_js_1.BN(200));
    payload.target_chain_code('foo.bar.baz', mask);
    payload.action('launch');
    payload.counter(new bn_js_1.BN(new Buffer(8).fill(0)));
    var transaction_bytes = transaction_2.encode_transaction(payload, [helpers_1.ENTITIES[0]]);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    var _a = __read(transaction_2.decode_transaction(transaction_bytes), 2), success = _a[0], tx = _a[1];
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx);
});
test('test contract with large shard mask', function () {
    // const EXPECTED_PAYLOAD = 'a12180532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d464c0c8c103e8c2000f424041eaab0b666f6f2e6261722e62617a066c61756e6368000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c'
    var EXPECTED_PAYLOAD = 'a1618000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d464c0c8c103e8c2000f424041eaab0b666f6f2e6261722e62617a066c61756e63680000000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    var mask = new bitvector_1.BitVector(16);
    mask.set(15, 1);
    mask.set(14, 1);
    mask.set(13, 1);
    mask.set(11, 1);
    mask.set(9, 1);
    mask.set(7, 1);
    mask.set(5, 1);
    mask.set(3, 1);
    mask.set(1, 1);
    mask.set(0, 1);
    var payload = new transaction_1.Transaction();
    payload.from_address(helpers_1.IDENTITIES[0]);
    payload.add_signer(helpers_1.IDENTITIES[0].public_key_hex());
    payload.charge_rate(new bn_js_1.BN(1000));
    payload.charge_limit(new bn_js_1.BN(1000000));
    payload.valid_from(new bn_js_1.BN(100));
    payload.valid_until(new bn_js_1.BN(200));
    payload.target_chain_code('foo.bar.baz', mask);
    payload.action('launch');
    payload.counter(new bn_js_1.BN(new Buffer(8).fill(0)));
    var transaction_bytes = transaction_2.encode_transaction(payload, [helpers_1.ENTITIES[0]]);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    // attempt to decode a transaction from the generated bytes
    var _a = __read(transaction_2.decode_transaction(transaction_bytes), 2), success = _a[0], tx = _a[1];
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx);
});
test('test invalid magic', function () {
    var invalid = Buffer.from([0x00]);
    expect(function () {
        transaction_2.decode_transaction(invalid);
    }).toThrow(errors_1.ValidationError);
});
test('test invalid version', function () {
    var invalid = Buffer.from([0xA1, 0xEF, 0xFF]);
    expect(function () {
        transaction_2.decode_transaction(invalid);
    }).toThrow(errors_1.ValidationError);
});
function assertIsExpectedTx(payload, transaction_bytes, expected_hex_payload) {
    var e_1, _a, _b;
    var len = payload.signers().size;
    // a payload needs at least one signee
    expect(len).toBeGreaterThan(0);
    // calculate the serial length of the signatures (so that we can extract the payload)
    var signatures_serial_length = EXPECTED_SERIAL_SIGNATURE_LENGTH * len;
    expect(Buffer.byteLength(transaction_bytes)).toBeGreaterThan(signatures_serial_length);
    var expected_payload_end = Buffer.byteLength(transaction_bytes) - signatures_serial_length;
    var payload_bytes = transaction_bytes.slice(0, expected_payload_end);
    expect(payload_bytes.toString('hex')).toBe(expected_hex_payload);
    var payload_bytes_hash = helpers_1.calc_digest(payload_bytes);
    // loop through and verify all the signatures
    var buffer = transaction_bytes.slice(expected_payload_end);
    var identity;
    var signature;
    try {
        for (var _c = __values(Object.keys(payload._signers)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var signee = _d.value;
            _b = __read(bytearray.decode_bytearray(buffer), 2), signature = _b[0], buffer = _b[1];
            // validate the signature is correct for the payload
            identity = new identity_1.Identity(Buffer.from(signee, 'hex'));
            expect(identity.verify(payload_bytes_hash, signature)).toBe(true);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
function assertTxAreEqual(reference, other) {
    expect(reference).toBeInstanceOf(transaction_1.Transaction);
    expect(other).toBeInstanceOf(transaction_1.Transaction);
    expect(reference.from_address()).toMatchObject(other.from_address());
    var reference_transfers = reference.transfers();
    var other_transfers = other.transfers();
    for (var i = 0; i < reference_transfers.length; i++) {
        expect(reference_transfers[i].address).toBe(other_transfers[i].address);
        expect(reference_transfers[i].amount.cmp(other_transfers[i].amount)).toBe(0);
    }
    expect(reference.valid_from().cmp(other.valid_from())).toBe(0);
    expect(reference.valid_from().cmp(other.valid_from())).toBe(0);
    expect(reference.charge_rate().cmp(other.charge_rate())).toBe(0);
    expect(reference.charge_limit().cmp(other.charge_limit())).toBe(0);
    if (typeof reference.contract_address() === 'string') {
        expect(reference.contract_address()).toBe(other.contract_address());
    }
    else {
        expect(reference.contract_address()).toMatchObject(other.contract_address());
    }
    expect(reference.chain_code()).toBe(other.chain_code());
    expect(reference.action()).toBe(other.action());
    expect(reference.shard_mask()).toMatchObject(other.shard_mask());
    expect(reference.data()).toBe(other.data());
    expect(Object.keys(reference.signers())).toMatchObject(Object.keys(other.signers()));
}
//# sourceMappingURL=test_transaction.js.map