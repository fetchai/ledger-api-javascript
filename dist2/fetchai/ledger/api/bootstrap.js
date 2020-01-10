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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var errors_1 = require("../errors");
var semver = __importStar(require("semver"));
var init_1 = require("../init");
var Bootstrap = /** @class */ (function () {
    function Bootstrap() {
    }
    Bootstrap.list_servers = function (active) {
        if (active === void 0) { active = true; }
        return __awaiter(this, void 0, void 0, function () {
            var params, resp, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = (active) ? { 'active': 1 } : {};
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default({
                                method: 'get',
                                url: 'https://bootstrap.fetch.ai/networks/',
                                params: params
                            })];
                    case 2:
                        resp = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        throw new errors_1.NetworkUnavailableError('Failed to get network status from bootstrap');
                    case 4:
                        if (200 !== resp.status) {
                            throw new errors_1.NetworkUnavailableError('Failed to get network status from bootstrap');
                        }
                        return [2 /*return*/, resp.data];
                }
            });
        });
    };
    Bootstrap.is_server_valid = function (server_list, network) {
        var available_servers = server_list.map(function (a) { return a.name; });
        // Check requested server is on list
        if (!available_servers.includes(network)) {
            throw new errors_1.NetworkUnavailableError("Requested server not present on network: " + network);
        }
        var server_details;
        for (var i = 0; i < server_list.length; i++) {
            if (typeof server_list[i]['name'] !== 'undefined' && server_list[i]['name'] === network) {
                server_details = server_list[i];
                break;
            }
        }
        var invalid_flag = false;
        if (server_details['versions'] !== '*') {
            var version_constraints = server_details['versions'].split(',');
            //todo are these noew needed with the interface
            if (typeof server_details['prerelease'] !== 'undefined')
                invalid_flag = true;
            if (typeof server_details['build'] !== 'undefined')
                invalid_flag = true;
            if (typeof server_details['patch'] !== 'undefined' && server_details['patch'] !== 0)
                invalid_flag = true;
            if (!semver.satisfies(semver.coerce(init_1.__version__), version_constraints.join(' ')))
                invalid_flag = true;
            if (invalid_flag) {
                throw new errors_1.IncompatibleLedgerVersionError("Requested network does not support required version\n\n                                            Required version: " + semver.coerce(init_1.__version__) + "\nNetwork supports: " + version_constraints.join(' '));
            }
        }
        return true;
    };
    Bootstrap.get_ledger_address = function (network) {
        return __awaiter(this, void 0, void 0, function () {
            var params, endpoints_response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = { 'network': network };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default({
                                method: 'get',
                                url: 'https://bootstrap.fetch.ai/endpoints',
                                params: params
                            })];
                    case 2:
                        endpoints_response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        throw new errors_1.NetworkUnavailableError('Failed to get network endpoint from bootstrap');
                    case 4:
                        if (200 !== endpoints_response.status) {
                            throw new errors_1.NetworkUnavailableError('Failed to get network status from bootstrap, incorrect status code received');
                        }
                        if (typeof endpoints_response.data[0].address === 'undefined') {
                            throw new errors_1.RunTimeError('Ledger endpoint missing address');
                        }
                        return [2 /*return*/, endpoints_response.data[0].address];
                }
            });
        });
    };
    /**
     *Splits a url into a protocol, host name and port
     * @param address
     */
    Bootstrap.split_address = function (address) {
        var _a, _b;
        var protocol, port;
        if (address.includes('://')) {
            _a = __read(address.split('://'), 2), protocol = _a[0], address = _a[1];
        }
        else {
            protocol = 'http';
        }
        if (address.includes(':')) {
            _b = __read(address.split(':'), 2), address = _b[0], port = _b[1];
            port = parseInt(port);
        }
        else {
            port = (protocol == 'https') ? 443 : 8000;
        }
        return [protocol, address, port];
    };
    /**
     * Queries bootstrap for the requested network and returns connection details
     * @param network
     */
    Bootstrap.server_from_name = function (network) {
        return __awaiter(this, void 0, void 0, function () {
            var server_list, ledger_address, _a, protocol, host, port;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Bootstrap.list_servers(true)
                        // Check requested network exists and supports our ledger version
                    ];
                    case 1:
                        server_list = _b.sent();
                        // Check requested network exists and supports our ledger version
                        Bootstrap.is_server_valid(server_list, network);
                        return [4 /*yield*/, Bootstrap.get_ledger_address(network)
                            // Check if address contains a port
                        ];
                    case 2:
                        ledger_address = _b.sent();
                        _a = __read(Bootstrap.split_address(ledger_address), 3), protocol = _a[0], host = _a[1], port = _a[2];
                        return [2 /*return*/, [protocol + "://" + host, port]];
                }
            });
        });
    };
    return Bootstrap;
}());
exports.Bootstrap = Bootstrap;
//# sourceMappingURL=bootstrap.js.map