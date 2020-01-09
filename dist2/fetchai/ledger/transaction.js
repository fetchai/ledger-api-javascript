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
var bitvector_1 = require("./bitvector");
var address_1 = require("./crypto/address");
var identity_1 = require("./crypto/identity");
var bn_js_1 = require("bn.js");
var utils_1 = require("./utils");
var assert_1 = __importDefault(require("assert"));
var crypto_1 = require("crypto");
var identity = __importStar(require("./serialization/identity"));
var bytearray = __importStar(require("./serialization/bytearray"));
var serialization_1 = require("./serialization");
var integer = __importStar(require("./serialization/integer"));
var errors_1 = require("./errors");
var crypto_2 = require("crypto");
function calc_digest(address_raw) {
    var hash_func = crypto_1.createHash('sha256');
    hash_func.update(address_raw);
    return hash_func.digest();
}
/**
 * This class for Transactions related operations
 *
 * @public
 * @class
 */
var Transaction = /** @class */ (function () {
    function Transaction() {
        //todo
        this._from = '';
        this._transfers = [];
        this._valid_from = new bn_js_1.BN(0);
        this._valid_until = new bn_js_1.BN(0);
        this._charge_rate = new bn_js_1.BN(0);
        this._charge_limit = new bn_js_1.BN(0);
        this._contract_address = '';
        this._counter = new bn_js_1.BN(crypto_2.randomBytes(8));
        this._chain_code = '';
        this._shard_mask = new bitvector_1.BitVector();
        this._metadata = {
            synergetic_data_submission: false
        };
        this._data = '';
    }
    // Get and Set from_address param
    Transaction.prototype.from_address = function (address) {
        if (address !== null) {
            this._from = new address_1.Address(address);
            return this._from;
        }
        return this._from;
    };
    Transaction.prototype.transfers = function () {
        return this._transfers;
    };
    // Get and Set valid_from param
    Transaction.prototype.valid_from = function (block_number) {
        if (block_number === void 0) { block_number = null; }
        if (block_number) {
            assert_1.default(bn_js_1.BN.isBN(block_number));
            this._valid_from = block_number;
            return this._valid_from;
        }
        return this._valid_from;
    };
    // Get and Set valid_until param
    Transaction.prototype.valid_until = function (block_number) {
        if (block_number === void 0) { block_number = null; }
        if (block_number) {
            assert_1.default(bn_js_1.BN.isBN(block_number));
            this._valid_until = block_number;
            return this._valid_until;
        }
        return this._valid_until;
    };
    // Get and Set charge_rate param
    Transaction.prototype.charge_rate = function (charge) {
        if (charge === void 0) { charge = null; }
        if (charge) {
            assert_1.default(bn_js_1.BN.isBN(charge));
            this._charge_rate = charge;
            return this._charge_rate;
        }
        return this._charge_rate;
    };
    // Get and Set charge_limit param
    Transaction.prototype.charge_limit = function (limit) {
        if (limit === void 0) { limit = null; }
        if (limit) {
            assert_1.default(bn_js_1.BN.isBN(limit));
            this._charge_limit = limit;
            return this._charge_limit;
        }
        return this._charge_limit;
    };
    // Get contract_address param
    Transaction.prototype.contract_address = function () {
        return this._contract_address;
    };
    // getter and setter
    Transaction.prototype.counter = function (counter) {
        if (counter === void 0) { counter = null; }
        if (counter === null)
            return this._counter;
        assert_1.default(bn_js_1.BN.isBN(counter));
        this._counter = counter;
    };
    // Get chain_code param
    Transaction.prototype.chain_code = function () {
        return this._chain_code;
    };
    // Get and Set action param
    Transaction.prototype.action = function (action) {
        if (action !== null) {
            this._action = action;
        }
        return this._action;
    };
    // Get shard_mask param
    Transaction.prototype.shard_mask = function () {
        return this._shard_mask;
    };
    // Get and Set data param. Note: data in bytes
    Transaction.prototype.data = function (data) {
        if (data !== null) {
            this._data = data;
        }
        return this._data;
    };
    Transaction.prototype.compare = function (other) {
        var x = this.payload().toString('hex');
        var y = other.payload().toString('hex');
        return x === y;
    };
    Transaction.prototype.payload = function () {
        var buffer = serialization_1.encode_payload(this);
        // so to get running lets just do like hex or whatever since only used to compare but then actually get same as python and delete this comment at later stage.
        return buffer;
    };
    Transaction.from_payload = function (payload) {
        var _a = __read(serialization_1.decode_payload(payload), 2), tx = _a[0], buffer = _a[1];
        return [tx, buffer];
    };
    Transaction.from_encoded = function (encoded_transaction) {
        var _a = __read(serialization_1.decode_transaction(encoded_transaction), 2), success = _a[0], tx = _a[1];
        if (success) {
            return tx;
        }
        else {
            return null;
        }
    };
    // Get signers param.
    Transaction.prototype.signers = function () {
        return this._signers;
    };
    Transaction.prototype.add_transfer = function (address, amount) {
        assert_1.default(amount.gtn(new bn_js_1.BN(0)));
        // if it is an identity we turn it into an address
        address = new address_1.Address(address);
        this._transfers.push({ address: address.toHex(), amount: new bn_js_1.BN(amount) });
    };
    Transaction.prototype.target_contract = function (address, mask) {
        this._contract_address = new address_1.Address(address);
        this._shard_mask = new bitvector_1.BitVector(mask);
        this._chain_code = '';
    };
    Transaction.prototype.target_chain_code = function (chain_code_id, mask) {
        this._contract_address = '';
        this._shard_mask = new bitvector_1.BitVector(mask);
        this._chain_code = String(chain_code_id);
    };
    // Get and Set synergetic_data_submission param
    Transaction.prototype.synergetic_data_submission = function (is_submission) {
        if (is_submission === void 0) { is_submission = false; }
        if (is_submission) {
            this._metadata['synergetic_data_submission'] = is_submission;
            return this._metadata['synergetic_data_submission'];
        }
        return this._metadata['synergetic_data_submission'];
    };
    Transaction.prototype.add_signer = function (signer) {
        if (!(this._signers.has(signer))) {
            this._signers.set(signer, ''); // will be replaced with a signature in the future
        }
    };
    Transaction.prototype.sign = function (signer) {
        if (this._signers.has(signer.public_key_hex())) {
            var payload_digest = calc_digest(this.payload());
            var sign_obj = signer.sign(payload_digest);
            this._signers.set(signer.public_key_hex(), {
                signature: sign_obj.signature,
                verified: signer.verify(payload_digest, sign_obj.signature)
            });
        }
    };
    //todo SHOULD METHOD REALLY RETURN VOID OR NULL
    Transaction.prototype.merge_signatures = function (tx2) {
        var _this = this;
        if (this.compare(tx2)) {
            var signers_1 = tx2.signers();
            // for (let key in signers) {
            signers_1.forEach(function (v, k) {
                if (signers_1.has(k) && typeof signers_1.get(k).signature !== 'undefined') {
                    var s = signers_1.get(k);
                    _this._signers.set(k, s);
                }
            });
        }
        else {
            console.log('Attempting to combine transactions with different payloads');
            utils_1.logger.info('Attempting to combine transactions with different payloads');
            return null;
        }
    };
    Transaction.prototype.encode_partial = function () {
        var buffer = serialization_1.encode_payload(this);
        var num_signed = 0;
        this._signers.forEach(function (v) {
            if (typeof v.signature !== 'undefined')
                num_signed++;
        });
        buffer = integer.encode_integer(buffer, new bn_js_1.BN(num_signed));
        this._signers.forEach(function (v, k) {
            if (typeof v.signature !== 'undefined') {
                var buff = Buffer.from(k, 'hex');
                var test_1 = new identity_1.Identity(buff);
                buffer = serialization_1.encode_identity(buffer, test_1);
                buffer = serialization_1.encode_bytearray(buffer, v.signature);
            }
        });
        return buffer;
    };
    Transaction.decode_partial = function (buffer) {
        var _a, _b, _c, _d;
        var tx;
        _a = __read(serialization_1.decode_payload(buffer), 2), tx = _a[0], buffer = _a[1];
        var num_sigs;
        _b = __read(serialization_1.decode_integer(buffer), 2), num_sigs = _b[0], buffer = _b[1];
        var payload_digest = calc_digest(tx.payload());
        for (var i = 0; i < num_sigs.toNumber(); i++) {
            var signer = void 0;
            _c = __read(identity.decode_identity(buffer), 2), signer = _c[0], buffer = _c[1];
            var signature = void 0;
            _d = __read(bytearray.decode_bytearray(buffer), 2), signature = _d[0], buffer = _d[1];
            signature = Buffer.from(signature);
            tx._signers.set(signer.public_key_hex(), {
                'signature': signature,
                'verified': signer.verify(payload_digest, signature)
            });
        }
        tx.signers().forEach(function (v) {
            if (v.verified && !v.verified) {
                throw new errors_1.RunTimeError('Not all keys were able to sign successfully');
            }
        });
        return tx;
    };
    return Transaction;
}());
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map