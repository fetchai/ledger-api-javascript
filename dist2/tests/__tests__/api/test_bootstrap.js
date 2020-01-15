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
var bootstrap_1 = require("../../../fetchai/ledger/api/bootstrap");
describe(':ContractsApi', function () {
    afterEach(function () {
        // axios.mockClear()
    });
    test('test get ledger address', function () { return __awaiter(void 0, void 0, void 0, function () {
        var address;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bootstrap_1.Bootstrap.get_ledger_address('alpha')];
                case 1:
                    address = _a.sent();
                    expect(address).toBe('https://foo.bar:500');
                    return [2 /*return*/];
            }
        });
    }); });
    test('list servers', function () { return __awaiter(void 0, void 0, void 0, function () {
        var actual1, actual2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bootstrap_1.Bootstrap.list_servers(true)];
                case 1:
                    actual1 = _a.sent();
                    expect(actual1).toMatchObject(JSON.parse('[{"name":"alpha","versions":"*"}]'));
                    return [4 /*yield*/, bootstrap_1.Bootstrap.list_servers(false)];
                case 2:
                    actual2 = _a.sent();
                    expect(actual2).toMatchObject(JSON.parse('[{"name":"alpha","versions":"*"}]'));
                    return [2 /*return*/];
            }
        });
    }); });
    test('test server from name', function () { return __awaiter(void 0, void 0, void 0, function () {
        var actual;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bootstrap_1.Bootstrap.server_from_name('alpha')];
                case 1:
                    actual = _a.sent();
                    expect(actual).toMatchObject(['https://foo.bar', 500]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('test split address', function () {
        // Test default ports depending on protocol
        var _a = __read(bootstrap_1.Bootstrap.split_address('https://foo.bar'), 3), protocol1 = _a[0], host1 = _a[1], port1 = _a[2];
        expect(protocol1).toBe('https');
        expect(host1).toBe('foo.bar');
        expect(port1).toEqual(443);
        var _b = __read(bootstrap_1.Bootstrap.split_address('http://foo.bar'), 3), protocol2 = _b[0], host2 = _b[1], port2 = _b[2];
        expect(protocol2).toBe('http');
        expect(host2).toBe('foo.bar');
        expect(port2).toEqual(8000);
        // Test correct splitting of address into protocol, host, port
        var _c = __read(bootstrap_1.Bootstrap.split_address('https://foo.bar:500'), 3), protocol3 = _c[0], host3 = _c[1], port3 = _c[2];
        expect(protocol3).toBe('https');
        expect(host3).toBe('foo.bar');
        expect(port3).toEqual(500);
        // Test defaulting of protocol to http
        var _d = __read(bootstrap_1.Bootstrap.split_address('foo.bar:600'), 3), protocol4 = _d[0], host4 = _d[1], port4 = _d[2];
        expect(protocol4).toBe('http');
        expect(host4).toBe('foo.bar');
        expect(port4).toEqual(600);
    });
});
//# sourceMappingURL=test_bootstrap.js.map