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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("../../utils/helpers");
var contracts_1 = require("../../../fetchai/ledger/api/contracts");
var address_1 = require("../../../fetchai/ledger/crypto/address");
var entity_1 = require("../../../fetchai/ledger/crypto/entity");
var api_1 = require("../../../fetchai/ledger/api");
var contract_1 = require("../../../fetchai/ledger/contract");
var contracts_2 = require("../../../contracts");
var axios_1 = __importDefault(require("axios"));
var _a = __read((function () {
    var ENTITIES = [];
    ENTITIES.push(new entity_1.Entity(Buffer.from('19c59b0a4890383eea59539173bfca5dc78e5e99037f4ad65c93d5b777b8720e', 'hex')));
    ENTITIES.push(new entity_1.Entity(Buffer.from('e1b74f6357dbdd0e03ad26afaab04071964ef1c9a0f0abf10edb060e06c890a0', 'hex')));
    var ADDRESSES = [];
    ADDRESSES.push(new address_1.Address(ENTITIES[0]));
    ADDRESSES.push(new address_1.Address(ENTITIES[1]));
    return [ENTITIES, ADDRESSES];
})(), 2), ENTITIES = _a[0], ADDRESSES = _a[1]; //         const entity = new Entity(Buffer.from('2ff324b9d3367b160069ec67260959b4955ab519426603b5e59d5990128163f3', 'hex'))
var NONCE = (function () {
    return Buffer.from('dGhpcyBpcyBhIG5vbmNl', 'base64');
})();
describe(':ContractsApi', function () {
    afterEach(function () {
        // axios.mockClear()
    });
    test('test create', function () { return __awaiter(void 0, void 0, void 0, function () {
        var api, contract, created, promise_sync;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new api_1.LedgerApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
                    contract = new contract_1.Contract(contracts_2.TRANSFER_CONTRACT, ENTITIES[0], NONCE);
                    return [4 /*yield*/, contract.create(api, ENTITIES[0], 4000)];
                case 1:
                    created = _a.sent();
                    expect(created).toBe('68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516');
                    expect(axios_1.default).toHaveBeenCalledTimes(2);
                    return [4 /*yield*/, api.sync('bbc6e88d647ab41923216cdaaba8cdd01f42e953c6583e59179d9b32f52f5777')];
                case 2:
                    promise_sync = _a.sent();
                    return [4 /*yield*/, expect(promise_sync).toBe(true)];
                case 3:
                    _a.sent();
                    expect(axios_1.default).toHaveBeenCalledTimes(4);
                    return [2 /*return*/];
            }
        });
    }); });
    test('test query', function () { return __awaiter(void 0, void 0, void 0, function () {
        var api, contract, query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new api_1.LedgerApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
                    contract = new contract_1.Contract(contracts_2.TRANSFER_CONTRACT, ENTITIES[0], NONCE);
                    return [4 /*yield*/, contract.query(api, 'balance', { address: ADDRESSES[0] })];
                case 1:
                    query = _a.sent();
                    expect(query).toBe(1000000);
                    return [2 /*return*/];
            }
        });
    }); });
    test('test action', function () { return __awaiter(void 0, void 0, void 0, function () {
        var api, tok_transfer_amount, fet_tx_fee, contract, action;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new api_1.LedgerApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
                    tok_transfer_amount = 200;
                    fet_tx_fee = 160;
                    contract = new contract_1.Contract(contracts_2.TRANSFER_CONTRACT, ENTITIES[0], NONCE);
                    return [4 /*yield*/, contract.action(api, 'transfer', fet_tx_fee, [ENTITIES[0]], [ADDRESSES[0], ADDRESSES[1], tok_transfer_amount])];
                case 1:
                    action = _a.sent();
                    expect(action).toBe('68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516');
                    return [2 /*return*/];
            }
        });
    }); });
    test('test _encode_json_payload', function () {
        var api = new contracts_1.ContractsApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
        var args = [];
        args.push(new address_1.Address('2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED'));
        args.push(new address_1.Address('2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL'));
        args.push(200);
        var encoded = api._encode_json_payload(args);
        var reference = '{"0":"2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED","1":"2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL","2":200}';
        expect(JSON.stringify(encoded)).toBe(reference);
    });
    test('test _encode_json_payload with underscore as last character of key', function () {
        var api = new contracts_1.ContractsApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
        var underscore_test1_ = new address_1.Address('2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED');
        var underscore_test2_ = new address_1.Address('2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL');
        var encoded = api._encode_json_payload({ underscore_test1_: underscore_test1_, underscore_test2_: underscore_test2_ });
        var reference = '{"underscore_test1":"2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED","underscore_test2":"2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL"}';
        expect(JSON.stringify(encoded)).toBe(reference);
    });
    test('test _encode_json_payload with nested object', function () {
        var api = new contracts_1.ContractsApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
        var underScoreTest1_ = new address_1.Address('2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED');
        var underScoreTest2_ = new address_1.Address('2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL');
        var nest = { underScoreTest1_: underScoreTest1_, underScoreTest2_: underScoreTest2_ };
        var nest_obj = { underScoreTest1_: underScoreTest1_, underScoreTest2_: underScoreTest2_, nest: nest };
        var encoded = api._encode_json_payload(nest_obj);
        var reference = '{"underScoreTest1":"2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED","underScoreTest2":"2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL","nest":{"underScoreTest1":"2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED","underScoreTest2":"2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL"}}';
        expect(JSON.stringify(encoded)).toBe(reference);
    });
    test('test message pack encode', function () { return __awaiter(void 0, void 0, void 0, function () {
        var args, actual, actual_hex, expected;
        return __generator(this, function (_a) {
            args = [];
            args.push(new address_1.Address('2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED'));
            args.push(new address_1.Address('2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL'));
            args.push(200);
            actual = api_1.TransactionFactory.encode_msgpack_payload(args);
            actual_hex = Buffer.from(actual).toString('hex');
            expected = Buffer.from('93c7204daa9b9ae48c1cc64c009e8055b38da18620edc70988b19f4c183ce82863f4122ac7204dc7ff5ef50909f23694849efb8f745483456ccf227885b6285a8c96dfe5e1524cccc8', 'hex');
            expect(actual_hex).toBe(expected.toString('hex'));
            return [2 /*return*/];
        });
    }); });
    test('test IsJsonObject', function () { return __awaiter(void 0, void 0, void 0, function () {
        var api, valid_json, res, invalid_json, res2;
        return __generator(this, function (_a) {
            api = new contracts_1.ContractsApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
            valid_json = '{"test": "valid json"}';
            res = api.isJSON(valid_json);
            expect(res).toBe(true);
            invalid_json = '{"test": "valid json ",,,,,}';
            res2 = api.isJSON(invalid_json);
            expect(res2).toBe(false);
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=test_contracts.js.map