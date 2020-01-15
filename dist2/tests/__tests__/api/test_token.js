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
var api_1 = require("../../../fetchai/ledger/api");
var deed_1 = require("../../../fetchai/ledger/crypto/deed");
var bn_js_1 = require("bn.js");
describe(':TokenApi', function () {
    test('test stake', function () { return __awaiter(void 0, void 0, void 0, function () {
        var api, tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new api_1.LedgerApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
                    return [4 /*yield*/, api.tokens.add_stake(helpers_1.ENTITIES[0], new bn_js_1.BN(1000), new bn_js_1.BN(50))];
                case 1:
                    tx = _a.sent();
                    expect(tx).toBe('68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516');
                    return [2 /*return*/];
            }
        });
    }); });
    test('test stake cooldown', function () { return __awaiter(void 0, void 0, void 0, function () {
        var api, stake;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new api_1.LedgerApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
                    return [4 /*yield*/, api.tokens.stake_cooldown(helpers_1.ENTITIES[0])];
                case 1:
                    stake = _a.sent();
                    expect(stake.cooldownStake).toBe(500);
                    return [2 /*return*/];
            }
        });
    }); });
    test('test deed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var deed, api, tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    deed = new deed_1.Deed();
                    deed.set_signee(helpers_1.ENTITIES[2], 2);
                    api = new api_1.LedgerApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
                    return [4 /*yield*/, api.tokens.deed(helpers_1.ENTITIES[0], deed, null, true)];
                case 1:
                    tx = _a.sent();
                    expect(tx).toBe('68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516');
                    return [2 /*return*/];
            }
        });
    }); });
    test('test collect stake', function () { return __awaiter(void 0, void 0, void 0, function () {
        var api, tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new api_1.LedgerApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
                    return [4 /*yield*/, api.tokens.collect_stake(helpers_1.ENTITIES[0], 300)];
                case 1:
                    tx = _a.sent();
                    expect(tx).toBe('68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516');
                    return [2 /*return*/];
            }
        });
    }); });
    test('test de stake', function () { return __awaiter(void 0, void 0, void 0, function () {
        var api, tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new api_1.LedgerApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
                    return [4 /*yield*/, api.tokens.de_stake(helpers_1.ENTITIES[0], 300, 25)];
                case 1:
                    tx = _a.sent();
                    expect(tx).toBe('68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516');
                    return [2 /*return*/];
            }
        });
    }); });
    test('test TokenTxFactory transfer', function () { return __awaiter(void 0, void 0, void 0, function () {
        var api, tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new api_1.LedgerApi(helpers_1.LOCAL_HOST, helpers_1.DEFAULT_PORT);
                    return [4 /*yield*/, api.tokens.transfer(helpers_1.ENTITIES[0], helpers_1.ENTITIES[1], 200, 2)];
                case 1:
                    tx = _a.sent();
                    expect(tx).toBe('be448a628ed7d333eaf497b7bf56722f1df661c67856b9cedf6d75180859964c');
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=test_token.js.map