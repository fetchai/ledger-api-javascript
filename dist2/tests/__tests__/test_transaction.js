"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var transaction_1 = require("../../fetchai/ledger/transaction");
var bitvector_1 = require("../../fetchai/ledger/bitvector");
var address_1 = require("../../fetchai/ledger/crypto/address");
var bn_js_1 = require("bn.js");
var helpers_1 = require("../utils/helpers");
var token_1 = require("../../fetchai/ledger/api/token");
var entity_1 = require("../../fetchai/ledger/crypto/entity");
var crypto_1 = require("../../fetchai/ledger/crypto");
describe(':Test Transaction', function () {
    test('Testing transaction constructor', function () {
        var txObj = new transaction_1.Transaction();
        expect(txObj._from).toBe('');
        expect(txObj._valid_from.cmp(new bn_js_1.BN(0))).toBe(0);
        expect(txObj._valid_until.cmp(new bn_js_1.BN(0))).toBe(0);
        expect(txObj._charge_rate.cmp(new bn_js_1.BN(0))).toBe(0);
        expect(txObj._charge_limit.cmp(new bn_js_1.BN(0))).toBe(0);
        expect(txObj._contract_address).toBe('');
        expect(txObj._chain_code).toBe('');
        expect(txObj._shard_mask._size).toBe(0);
        expect(txObj._shard_mask._byte_size).toBe(0);
        expect(txObj._action).toBe('');
        expect(txObj._metadata.synergetic_data_submission).toBe(false);
        expect(txObj._data).toBe('');
        expect(txObj.transfers()).toHaveLength(0);
    });
    test('Test from_address', function () {
        var txObj = new transaction_1.Transaction();
        var randomAddr = helpers_1.dummy_address();
        var address = new address_1.Address(randomAddr);
        expect(txObj.from_address(randomAddr)).toMatchObject(address);
    });
    test('Test transfers', function () {
        var txObj = new transaction_1.Transaction();
        expect(txObj.transfers()).toHaveLength(0);
    });
    test('Test add_transfer with amount', function () {
        var actual = new bn_js_1.BN(0);
        var txObj = new transaction_1.Transaction();
        var address = helpers_1.dummy_address();
        txObj.add_transfer(address, new bn_js_1.BN(40));
        txObj.add_transfer(address, new bn_js_1.BN(10));
        var transfers = txObj.transfers();
        transfers.forEach(function (el) {
            if (el.address === address.toHex()) {
                actual = actual.add(el.amount);
            }
        });
        expect(actual.toNumber()).toBe(40 + 10);
    });
    test('Test valid_from', function () {
        var txObj = new transaction_1.Transaction();
        expect(txObj.valid_from(new bn_js_1.BN(12)).cmp(new bn_js_1.BN(12))).toBe(0);
        expect(txObj._valid_from).toMatchObject(new bn_js_1.BN(12));
    });
    test('Test valid_until', function () {
        var txObj = new transaction_1.Transaction();
        expect(txObj.valid_until(new bn_js_1.BN(14)).cmp(new bn_js_1.BN(14))).toBe(0);
        expect(txObj._valid_until).toMatchObject(new bn_js_1.BN(14));
    });
    test('Test charge_rate', function () {
        var txObj = new transaction_1.Transaction();
        expect(txObj.charge_rate(new bn_js_1.BN(14)).cmp(new bn_js_1.BN(14))).toBe(0);
    });
    test('Test charge_limit', function () {
        var txObj = new transaction_1.Transaction();
        expect(txObj.charge_limit(new bn_js_1.BN(14)).cmp(new bn_js_1.BN(14))).toBe(0);
        expect(txObj._charge_limit).toMatchObject(new bn_js_1.BN(14));
    });
    test('Test contract_address', function () {
        var txObj = new transaction_1.Transaction();
        expect(txObj.contract_address()).toBe(txObj._contract_address);
    });
    test('Test chain_code', function () {
        var txObj = new transaction_1.Transaction();
        expect(txObj.chain_code()).toBe(txObj._chain_code);
    });
    test('Test action', function () {
        var txObj = new transaction_1.Transaction();
        expect(txObj.action('takeAction')).toBe('takeAction');
        expect(txObj._action).toBe('takeAction');
    });
    test('Test shard_mask', function () {
        var txObj = new transaction_1.Transaction();
        expect(txObj.shard_mask()).toBe(txObj._shard_mask);
    });
    test('Test data', function () {
        var txObj = new transaction_1.Transaction();
        expect(txObj.data('some data to set')).toBe('some data to set');
        expect(txObj._data).toBe('some data to set');
    });
    // signers() tested below
    test('Test add_transfer', function () {
        var actual = new bn_js_1.BN(0);
        var txObj = new transaction_1.Transaction();
        var address = helpers_1.dummy_address();
        txObj.add_transfer(address, new bn_js_1.BN(10));
        var transfers = txObj.transfers();
        transfers.forEach(function (el) {
            if (el.address === address.toHex()) {
                actual = actual.add(el.amount);
            }
        });
        expect(actual.toNumber()).toBe(10);
    });
    test('Test target_contract', function () {
        var txObj = new transaction_1.Transaction();
        var address = helpers_1.dummy_address();
        txObj.target_contract(address, new bitvector_1.BitVector(10));
        expect(txObj._contract_address).toBeInstanceOf(address_1.Address);
        expect(txObj._shard_mask._size).toBe(new bitvector_1.BitVector(10)._size);
        expect(txObj._shard_mask._byte_size).toBe(new bitvector_1.BitVector(10)._byte_size);
        expect(txObj._chain_code).toBe('');
    });
    test('Test target_chain_code', function () {
        var txObj = new transaction_1.Transaction();
        txObj.target_chain_code(2, new bitvector_1.BitVector(10));
        expect(txObj._contract_address).toBe('');
        expect(txObj._shard_mask._size).toBe(new bitvector_1.BitVector(10)._size);
        expect(txObj._shard_mask._byte_size).toBe(new bitvector_1.BitVector(10)._byte_size);
        expect(txObj._chain_code).toBe(String(2));
    });
    test('Test synergetic_data_submission', function () {
        var txObj = new transaction_1.Transaction();
        expect(txObj.synergetic_data_submission(true)).toBe(true);
    });
    test('Test add_signer and signers', function () {
        var txObj = new transaction_1.Transaction();
        txObj.add_signer('thisIsSigner');
        expect(txObj.signers().get('thisIsSigner')).toBe('');
    });
    test('Test test partial serialize', function () { return __awaiter(void 0, void 0, void 0, function () {
        var multi_sig_identity, multi_sig_board, i, target_identity, mstx, encoded, tx2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    multi_sig_identity = new entity_1.Entity();
                    multi_sig_board = [];
                    for (i = 0; i < 4; i++) {
                        multi_sig_board.push(new entity_1.Entity());
                    }
                    target_identity = new entity_1.Entity();
                    return [4 /*yield*/, token_1.TokenTxFactory.transfer(multi_sig_identity, new crypto_1.Identity(target_identity), 500, 500, multi_sig_board)];
                case 1:
                    mstx = _a.sent();
                    mstx.sign(multi_sig_board[0]);
                    mstx.sign(multi_sig_board[2]);
                    encoded = mstx.encode_partial();
                    tx2 = transaction_1.Transaction.decode_partial(encoded);
                    expect(mstx.compare(tx2)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    test('Test test merge tx signatures', function () { return __awaiter(void 0, void 0, void 0, function () {
        var multi_sig_identity, multi_sig_board, i, target_identity, mstx, txs, i, payload, _a, tx, i, signers, flag, key;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    multi_sig_identity = new entity_1.Entity();
                    multi_sig_board = [];
                    for (i = 0; i < 4; i++) {
                        multi_sig_board.push(new entity_1.Entity());
                    }
                    target_identity = new entity_1.Entity();
                    return [4 /*yield*/, token_1.TokenTxFactory.transfer(multi_sig_identity, new crypto_1.Identity(target_identity), new bn_js_1.BN(500), new bn_js_1.BN(500), multi_sig_board)];
                case 1:
                    mstx = _b.sent();
                    txs = [];
                    for (i = 0; i < 4; i++) {
                        payload = mstx.payload();
                        _a = __read(transaction_1.Transaction.from_payload(payload), 1), tx = _a[0];
                        tx.sign(multi_sig_board[i]);
                        txs.push(tx.encode_partial());
                    }
                    for (i = 0; i < 4; i++) {
                        mstx.merge_signatures(transaction_1.Transaction.decode_partial(txs[i]));
                    }
                    signers = mstx.signers();
                    flag = true;
                    for (key in signers) {
                        if (typeof signers[key].verified === 'undefined' || !signers[key].verified) {
                            flag = false;
                        }
                    }
                    expect(flag).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=test_transaction.js.map