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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var address = __importStar(require("./address"));
var integer = __importStar(require("./integer"));
var bytearray = __importStar(require("./bytearray"));
var identity = __importStar(require("./identity"));
var errors_1 = require("../errors");
var bitvector_1 = require("../bitvector");
var identity_1 = require("../crypto/identity");
var transaction_1 = require("../transaction");
var bn_js_1 = require("bn.js");
var bytearray_1 = require("./bytearray");
var utils_1 = require("../utils");
// *******************************
// ********** Constants **********
// *******************************
var MAGIC = 0xa1;
// a reserved byte.
var RESERVED = 0x00;
var VERSION = 3;
var CONTRACT_MODE;
(function (CONTRACT_MODE) {
    CONTRACT_MODE[CONTRACT_MODE["NO_CONTRACT"] = 0] = "NO_CONTRACT";
    CONTRACT_MODE[CONTRACT_MODE["SMART_CONTRACT"] = 1] = "SMART_CONTRACT";
    CONTRACT_MODE[CONTRACT_MODE["CHAIN_CODE"] = 2] = "CHAIN_CODE";
    CONTRACT_MODE[CONTRACT_MODE["SYNERGETIC"] = 3] = "SYNERGETIC";
})(CONTRACT_MODE || (CONTRACT_MODE = {}));
var EXPECTED_SERIAL_SIGNATURE_LENGTH = 65;
var log2 = function (value) {
    var count = 0;
    while (value > 1) {
        value >>= 1;
        count += 1;
    }
    return count;
};
var map_contract_mode = function (payload) {
    if (payload.synergetic_data_submission()) {
        return CONTRACT_MODE.SYNERGETIC;
    }
    if (payload.action()) {
        if (payload.chain_code()) {
            return CONTRACT_MODE.CHAIN_CODE;
        }
        return CONTRACT_MODE.SMART_CONTRACT;
    }
    else {
        return CONTRACT_MODE.NO_CONTRACT;
    }
};
var encode_payload = function (payload) {
    var num_transfers = payload.transfers().length;
    var num_signatures = payload._signers.size;
    // sanity check
    assert_1.default(num_signatures >= 1);
    var num_extra_signatures = num_signatures > 0x40 ? (num_signatures - 0x40) : 0;
    var signalled_signatures = num_signatures - (num_extra_signatures + 1);
    var has_valid_from = (payload._valid_from.cmp(new bn_js_1.BN(0)) !== 0);
    var header0 = VERSION << 5; /// ??
    header0 |= (num_transfers > 0 ? 1 : 0) << 2;
    header0 |= (num_transfers > 1 ? 1 : 0) << 1;
    header0 |= has_valid_from ? 1 : 0;
    // determine the mode of the contract
    var contract_mode = map_contract_mode(payload);
    var header1 = contract_mode << 6;
    header1 |= signalled_signatures & 0x3f;
    var buffer = Buffer.from([MAGIC, header0, header1, RESERVED]);
    buffer = address.encode_address(buffer, payload.from_address());
    if (num_transfers > 1) {
        buffer = integer.encode_integer(buffer, new bn_js_1.BN(num_transfers - 2));
    }
    var transfers = payload.transfers();
    for (var i = 0; i < transfers.length; i++) {
        buffer = address.encode_address(buffer, transfers[i].address);
        buffer = integer.encode_integer(buffer, transfers[i].amount);
    }
    if (has_valid_from) {
        buffer = integer.encode_integer(buffer, new bn_js_1.BN(payload.valid_from()));
    }
    buffer = integer.encode_integer(buffer, payload.valid_until());
    buffer = integer.encode_integer(buffer, payload.charge_rate());
    buffer = integer.encode_integer(buffer, payload.charge_limit());
    if (CONTRACT_MODE.NO_CONTRACT !== contract_mode) {
        var shard_mask = payload.shard_mask();
        var shard_mask_length = shard_mask.__len__();
        if (shard_mask_length <= 1) {
            // signal this is a wildcard transaction
            buffer = Buffer.concat([buffer, Buffer.from([0x80])]);
        }
        else {
            var shard_mask_bytes = shard_mask.__bytes__();
            var log2_mask_length = log2(shard_mask_length);
            var contract_header = void 0;
            if (shard_mask_length < 8) {
                assert_1.default(Buffer.byteLength(shard_mask_bytes) === 1);
                contract_header = shard_mask_bytes.readUIntBE(0, 1) & 0xf;
                if (log2_mask_length === 2) {
                    contract_header |= 0x10;
                }
                // write the mask to the stream
                buffer = Buffer.concat([buffer, Buffer.from([contract_header])]);
            }
            else {
                assert_1.default(shard_mask_length <= 512);
                contract_header = 0x40 | ((log2_mask_length - 3) & 0x3f);
                buffer = Buffer.concat([buffer, Buffer.from([contract_header])]);
                buffer = Buffer.concat([buffer, shard_mask_bytes]);
            }
        }
        if (CONTRACT_MODE.SMART_CONTRACT === contract_mode || CONTRACT_MODE.SYNERGETIC === contract_mode) {
            buffer = address.encode_address(buffer, payload.contract_address());
        }
        else if (CONTRACT_MODE.CHAIN_CODE === contract_mode) {
            var encoded_chain_code = Buffer.from(payload.chain_code(), 'ascii');
            buffer = bytearray.encode_bytearray(buffer, encoded_chain_code);
        }
        else {
            assert_1.default(false);
        }
        buffer = bytearray.encode_bytearray(buffer, Buffer.from(payload.action(), 'ascii'));
        var data = Buffer.from(payload.data());
        buffer = bytearray.encode_bytearray(buffer, data);
    }
    buffer = Buffer.concat([buffer, payload.counter().toArrayLike(Buffer, 'be', 8)]);
    if (num_extra_signatures > 0) {
        buffer = integer.encode_integer(buffer, new bn_js_1.BN(num_extra_signatures));
    }
    // write all the signers public keys
    payload._signers.forEach(function (v, k) {
        buffer = identity.encode_identity(buffer, Buffer.from(k, 'hex'));
    });
    return buffer;
};
exports.encode_payload = encode_payload;
var encode_multisig_transaction = function (payload, signatures) {
    // assert isinstance(payload, bytes) or isinstance(payload, transaction.Transaction)
    //assert((payload instance bytes) or isinstance(payload, transaction.Transaction)
    // encode the contents of the transaction
    var buffer = encode_payload(payload);
    var signers = payload.signers();
    // append signatures in order
    //for(let key in signers){
    signers.forEach(function (v, k) {
        if (signatures.has(k) && typeof signatures.get(k).signature !== 'undefined') {
            buffer = bytearray_1.encode_bytearray(buffer, signatures.get(k).signature);
        }
    });
    return buffer;
};
exports.encode_multisig_transaction = encode_multisig_transaction;
var encode_transaction = function (payload, signers) {
    // encode the contents of the transaction
    var buffer = encode_payload(payload);
    // extract the payload buffer
    var payload_bytes = utils_1.calc_digest(buffer);
    // append all the signatures of the signers in order
    // for (let signer of Object.keys(payload._signers)) {
    var flag = false;
    payload.signers().forEach(function (v, k) {
        var hex_key;
        for (var i = 0; i < signers.length; i++) {
            hex_key = signers[i].pubKey.toString('hex');
            // check if payload sig matches one passed in this param.
            if (k === hex_key) {
                flag = true;
                var sign_obj = signers[i].sign(payload_bytes);
                buffer = bytearray.encode_bytearray(buffer, sign_obj.signature);
            }
        }
    });
    if (!flag) {
        throw new errors_1.ValidationError('Missing signer signing set');
    }
    // return the encoded transaction
    return buffer;
};
exports.encode_transaction = encode_transaction;
var decode_payload = function (buffer) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    // ensure the at the magic is correctly configured
    var magic = buffer.slice(0, 1);
    buffer = buffer.slice(1);
    var magic_integer = magic.readUIntBE(0, 1);
    if (magic_integer !== MAGIC) {
        throw new errors_1.ValidationError('Missing signer signing set');
    }
    //extract the header bytes
    var header_first_buffer = buffer.slice(0, 1);
    var header_second_buffer = buffer.slice(1, 2);
    buffer = buffer.slice(2);
    var header_first = header_first_buffer.readUIntBE(0, 1);
    var header_second = header_second_buffer.readUIntBE(0, 1);
    var version = (header_first & 0xE0) >> 5;
    // const charge_unit_flag = Boolean((header_first & 0x08) >> 3)
    // assert(!charge_unit_flag);
    var transfer_flag = Boolean((header_first & 0x04) >> 2);
    var multiple_transfers_flag = Boolean((header_first & 0x02) >> 1);
    var valid_from_flag = Boolean((header_first & 0x01));
    var contract_type = (header_second & 0xC0) >> 6;
    var signature_count_minus1 = (header_second & 0x3F);
    var num_signatures = signature_count_minus1 + 1;
    if (version !== VERSION) {
        throw new errors_1.ValidationError('Unable to parse transaction from stream, incompatible version');
    }
    // discard the reserved byte
    buffer = buffer.slice(1);
    var tx = new transaction_1.Transaction();
    // Set synergetic contract type
    tx.synergetic_data_submission(contract_type == CONTRACT_MODE.SYNERGETIC);
    // decode the address from the buffer
    var address_decoded;
    _a = __read(address.decode_address(buffer), 2), address_decoded = _a[0], buffer = _a[1];
    tx.from_address(address_decoded);
    if (transfer_flag) {
        var transfer_count = void 0;
        if (multiple_transfers_flag) {
            _b = __read(integer.decode_integer(buffer), 2), transfer_count = _b[0], buffer = _b[1];
            transfer_count = transfer_count.toNumber() + 2;
        }
        else {
            transfer_count = 1;
        }
        var to = void 0, amount = void 0;
        for (var i = 0; i < transfer_count; i++) {
            _c = __read(address.decode_address(buffer), 2), to = _c[0], buffer = _c[1];
            _d = __read(integer.decode_integer(buffer), 2), amount = _d[0], buffer = _d[1];
            tx.add_transfer(to, amount);
        }
    }
    if (valid_from_flag) {
        var valid_from = void 0;
        _e = __read(integer.decode_integer(buffer), 2), valid_from = _e[0], buffer = _e[1];
        tx.valid_from(valid_from);
    }
    var valid_until, charge_rate, charge_limit;
    _f = __read(integer.decode_integer(buffer), 2), valid_until = _f[0], buffer = _f[1];
    tx.valid_until(valid_until);
    _g = __read(integer.decode_integer(buffer), 2), charge_rate = _g[0], buffer = _g[1];
    tx.charge_rate(charge_rate);
    //  assert not charge_unit_flag, "Currently the charge unit field is not supported"
    _h = __read(integer.decode_integer(buffer), 2), charge_limit = _h[0], buffer = _h[1];
    tx.charge_limit(charge_limit);
    if (contract_type != CONTRACT_MODE.NO_CONTRACT) {
        var contract_header = buffer.slice(0, 1);
        buffer = buffer.slice(1);
        var contract_header_int = contract_header.readUIntBE(0, 1);
        var wildcard = Boolean(contract_header_int & 0x80);
        var shard_mask = new bitvector_1.BitVector();
        if (!wildcard) {
            var extended_shard_mask_flag = Boolean(contract_header_int & 0x40);
            if (!extended_shard_mask_flag) {
                var mask = void 0, bit_size = void 0;
                if (contract_header_int & 0x10) {
                    mask = 0xf;
                    bit_size = 4;
                }
                else {
                    mask = 0x3;
                    bit_size = 2;
                }
                // extract the shard mask from the header
                var toHex = function (d) { return ('0' + (Number(d).toString(16))).slice(-2).toUpperCase(); };
                var decoded_bytes = Buffer.from(toHex(contract_header_int & mask), 'hex');
                shard_mask = bitvector_1.BitVector.from_bytes(decoded_bytes, bit_size);
            }
            else {
                var bit_length = 1 << ((contract_header_int & 0x3F) + 3);
                var byte_length = Math.floor(bit_length / 8);
                assert_1.default((bit_length % 8) == 0); //this should be enforced as part of the spec
                shard_mask = bitvector_1.BitVector.from_bytes(buffer.slice(0, byte_length), bit_length);
                buffer = buffer.slice(byte_length);
            }
        }
        if (contract_type === CONTRACT_MODE.SMART_CONTRACT || contract_type === CONTRACT_MODE.SYNERGETIC) {
            var contract_address = void 0;
            _j = __read(address.decode_address(buffer), 2), contract_address = _j[0], buffer = _j[1];
            tx.target_contract(contract_address, shard_mask);
        }
        else if (contract_type === CONTRACT_MODE.CHAIN_CODE) {
            var encoded_chain_code_name = void 0;
            _k = __read(bytearray.decode_bytearray(buffer), 2), encoded_chain_code_name = _k[0], buffer = _k[1];
            tx.target_chain_code(encoded_chain_code_name.toString(), shard_mask);
        }
        else {
            // this is mostly a guard against a desync between this function and `map_contract_mode`
            throw new errors_1.RunTimeError('Unhandled contract type');
        }
        var action = void 0;
        var data = void 0;
        _l = __read(bytearray.decode_bytearray(buffer), 2), action = _l[0], buffer = _l[1];
        _m = __read(bytearray.decode_bytearray(buffer), 2), data = _m[0], buffer = _m[1];
        tx.action(action.toString());
        tx.data(data.toString());
    }
    tx.counter(new bn_js_1.BN(buffer.slice(0, 8)));
    buffer = buffer.slice(8);
    if (signature_count_minus1 == 0x3F) {
        var additional_signatures = void 0;
        _o = __read(bytearray.decode_bytearray(buffer), 2), additional_signatures = _o[0], buffer = _o[1];
        num_signatures = num_signatures + additional_signatures;
    }
    var public_keys = [];
    var pk;
    for (var i = 0; i < num_signatures; i++) {
        _p = __read(identity.decode_identity(buffer), 2), pk = _p[0], buffer = _p[1];
        public_keys.push(pk);
        var ident = new identity_1.Identity(pk);
        tx.add_signer(ident.public_key_hex());
    }
    return [tx, buffer];
};
exports.decode_payload = decode_payload;
var decode_transaction = function (buffer) {
    var _a;
    var input_buffer = buffer;
    var tx;
    _a = __read(decode_payload(buffer), 2), tx = _a[0], buffer = _a[1];
    var num_signatures = tx.signers().size;
    var signatures_serial_length = EXPECTED_SERIAL_SIGNATURE_LENGTH * num_signatures;
    var expected_payload_end = Buffer.byteLength(input_buffer) - signatures_serial_length;
    var payload_bytes = input_buffer.slice(0, expected_payload_end);
    var verified = [];
    tx.signers().forEach(function (v, k) {
        var _a;
        var identity, signature;
        _a = __read(bytearray.decode_bytearray(buffer), 2), signature = _a[0], buffer = _a[1];
        identity = identity_1.Identity.from_hex(k);
        var payload_bytes_digest = utils_1.calc_digest(payload_bytes);
        verified.push(identity.verify(payload_bytes_digest, signature));
        tx._signers.set(identity.public_key_hex(), {
            'signature': signature,
            'verified': verified[verified.length - 1]
        });
    });
    var success = verified.every(function (verified) { return verified === true; });
    return [success, tx];
};
exports.decode_transaction = decode_transaction;
//# sourceMappingURL=transaction.js.map