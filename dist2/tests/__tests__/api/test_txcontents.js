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
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("../../utils/helpers");
var tx_1 = require("../../../fetchai/ledger/api/tx");
var address_1 = require("../../../fetchai/ledger/crypto/address");
var bn_js_1 = require("bn.js");
var api_1 = require("../../../fetchai/ledger/api");
describe(':TXContentsTest', function () {
    test('test contents', function () { return __awaiter(void 0, void 0, void 0, function () {
        var api, transfer, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new api_1.LedgerApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
                    return [4 /*yield*/, api.tokens.transfer(helpers_1.ENTITIES[0], helpers_1.ENTITIES[1], 1000, 50)];
                case 1:
                    transfer = _a.sent();
                    return [4 /*yield*/, api.tx.contents(transfer)];
                case 2:
                    json = _a.sent();
                    expect(json.digest_hex).toBe('123456');
                    expect(json.digest_bytes.toString('hex')).toBe(Buffer.from('123456', 'hex').toString('hex'));
                    expect(json.action).toBe('transfer');
                    expect(json.chain_code).toBe('action.transfer');
                    expect(json.from_address.toHex()).toBe(new address_1.Address('U5dUjGzmAnajivcn4i9K4HpKvoTvBrDkna1zePXcwjdwbz1yB').toHex());
                    expect(json.contract_address).toBeNull();
                    expect(json.valid_from).toBe(0);
                    expect(json.valid_until).toBe(100);
                    expect(json.charge).toBe(2);
                    expect(json.charge_limit).toBe(5);
                    expect(json.transfers).toMatchObject({});
                    expect(json.data).toBe('def');
                    return [2 /*return*/];
            }
        });
    }); });
    test('test constructor', function () {
        var data = {
            'digest': '0x123456',
            'action': 'transfer',
            'chainCode': 'action.transfer',
            'from': 'U5dUjGzmAnajivcn4i9K4HpKvoTvBrDkna1zePXcwjdwbz1yB',
            'validFrom': 0,
            'validUntil': 100,
            'charge': 2,
            'chargeLimit': 5,
            'transfers': [],
            'signatories': ['abc'],
            'data': 'def'
        };
        var tx_contents = tx_1.TxContents.from_json(data);
        expect(tx_contents.digest_hex).toBe('123456');
        expect(tx_contents.digest_bytes.toString('hex')).toBe(Buffer.from('123456', 'hex').toString('hex'));
        expect(tx_contents.action).toBe('transfer');
        expect(tx_contents.chain_code).toBe('action.transfer');
        expect(tx_contents.from_address.toHex()).toBe(new address_1.Address('U5dUjGzmAnajivcn4i9K4HpKvoTvBrDkna1zePXcwjdwbz1yB').toHex());
        expect(tx_contents.contract_address).toBeNull();
        expect(tx_contents.valid_from).toBe(0);
        expect(tx_contents.valid_until).toBe(100);
        expect(tx_contents.charge).toBe(2);
        expect(tx_contents.charge_limit).toBe(5);
        expect(tx_contents.transfers).toMatchObject({});
        expect(tx_contents.data).toBe('def');
    });
    test('test transfers', function () {
        var data = {
            'digest': '0x123456',
            'action': 'transfer',
            'chainCode': 'action.transfer',
            'from': 'U5dUjGzmAnajivcn4i9K4HpKvoTvBrDkna1zePXcwjdwbz1yB',
            'validFrom': 0,
            'validUntil': 100,
            'charge': 2,
            'chargeLimit': 5,
            'signatories': ['abc'],
            'data': 'def',
            'transfers': [
                { 'to': helpers_1.ADDRESSES[0].toHex(), 'amount': 200 },
                { 'to': helpers_1.ADDRESSES[1].toHex(), 'amount': 300 }
            ]
        };
        var tx_contents = tx_1.TxContents.from_json(data);
        expect(tx_contents.transfers_to(helpers_1.ADDRESSES[0]).cmp(new bn_js_1.BN(200))).toBe(0);
        expect(tx_contents.transfers_to(helpers_1.ADDRESSES[1]).cmp(new bn_js_1.BN(300))).toBe(0);
        expect(tx_contents.transfers_to(helpers_1.ADDRESSES[2]).cmp(new bn_js_1.BN(0))).toBe(0);
    });
});
//# sourceMappingURL=test_txcontents.js.map