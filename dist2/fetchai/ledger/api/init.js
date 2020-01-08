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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var semver = __importStar(require("semver"));
var init_1 = require("../init");
var apiError_1 = require("../errors/apiError");
var contracts_1 = require("./contracts");
var errors_1 = require("../errors");
var server_1 = require("./server");
var token_1 = require("./token");
var tx_1 = require("./tx");
var DEFAULT_TIMEOUT = 120;
/**
 * This class for all ledger APIs.
 *
 * @public
 * @class
 */
var LedgerApi = /** @class */ (function () {
    /**
     * @param  {Boolean} host ledger host.
     * @param  {Boolean} port ledger port.
     * @param  {Boolean} network server name.
     */
    function LedgerApi(host, port) {
        this.tokens = new token_1.TokenApi(host, port, this);
        this.contracts = new contracts_1.ContractsApi(host, port, this);
        this.tx = new tx_1.TransactionApi(host, port, this);
        this.server = new server_1.ServerApi(host, port, this);
    }
    /**
     *  Sync the ledger.
     * this does not block event loop, but waits sync for return of executed
     * digest using a timeout, wrapped in a promise that resolves when we get executed status in response, or
     * rejects if timeouts.
     * @async
     * @method
     * @param  {String} txs transactions string.
     * @param  {Boolean} [timeout=false] units seconds.
     * @returns {Promise} return asyncTimerPromise.
     */
    LedgerApi.prototype.sync = function (txs, timeout, hold_state_sec, extend_success_status) {
        if (timeout === void 0) { timeout = DEFAULT_TIMEOUT; }
        if (hold_state_sec === void 0) { hold_state_sec = 0; }
        if (extend_success_status === void 0) { extend_success_status = []; }
        return __awaiter(this, void 0, void 0, function () {
            var limit, failed, waiting, asyncTimerPromise;
            var _this = this;
            return __generator(this, function (_a) {
                if (!Array.isArray(txs) && !txs.length) {
                    throw new TypeError('Unknown argument type');
                }
                if (!Array.isArray(txs)) {
                    txs = [txs];
                }
                limit = timeout * 1000;
                failed = [];
                waiting = [];
                asyncTimerPromise = new Promise(function (resolve, reject) {
                    var start = Date.now();
                    var loop = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                        var _loop_1, out_i_1, i, elapsed_time;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (txs.length === 0) {
                                        clearInterval(loop);
                                        if (failed.length) {
                                            return [2 /*return*/, reject(failed)];
                                        }
                                        else {
                                            return [2 /*return*/, resolve(true)];
                                        }
                                    }
                                    return [4 /*yield*/, this.poll(txs)];
                                case 1:
                                    // we poll all of the digests.
                                    txs = _a.sent();
                                    _loop_1 = function (i) {
                                        // if failed we push into array of failed and go to next one.
                                        if (txs[i].failed()) {
                                            failed.push(txs[i]);
                                            txs.splice(i, 1);
                                            i--;
                                            return out_i_1 = i, "continue";
                                        }
                                        if (txs[i].non_terminal()) {
                                            // if a transaction reverts its status to a non-terminal state within hold time then revert.
                                            var index = waiting.findIndex(function (item) { return (Date.now() - item.time) < hold_state_sec && item.tx_status.get_digest_hex() === txs[i].get_digest_hex(); });
                                            if (index !== -1) {
                                                waiting.splice(index, 1);
                                            }
                                        }
                                        if (txs[i].successful() || extend_success_status.includes(txs[i].get_status())) {
                                            var index = waiting.findIndex(function (item) {
                                                var x = Date.now() - item.time;
                                                return x > hold_state_sec && item.tx_status.get_digest_hex() === txs[i].get_digest_hex();
                                            });
                                            if (index !== -1) {
                                                // splice it out of the array if successful
                                                txs.splice(i, 1);
                                                i--;
                                            }
                                            else {
                                                // check if it is currently waiting for hold time to elapse.
                                                var index_1 = waiting.findIndex(function (item) {
                                                    var x = item.tx_status.get_digest_hex();
                                                    return txs[i].get_digest_hex() === x;
                                                });
                                                if (index_1 === -1) {
                                                    waiting.push({ time: Date.now(), tx_status: txs[i] });
                                                }
                                            }
                                        }
                                        out_i_1 = i;
                                    };
                                    for (i = 0; i < txs.length; i++) {
                                        _loop_1(i);
                                        i = out_i_1;
                                    }
                                    elapsed_time = Date.now() - start;
                                    if (elapsed_time >= limit) {
                                        clearInterval(loop);
                                        // and return all those which still have not.
                                        return [2 /*return*/, reject(failed.concat(txs))];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); }, 100);
                });
                return [2 /*return*/, asyncTimerPromise];
            });
        });
    };
    LedgerApi.prototype.poll = function (txs) {
        return __awaiter(this, void 0, void 0, function () {
            var tx_status, res, i, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        res = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < txs.length)) return [3 /*break*/, 9];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        if (!(txs[i] instanceof tx_1.TxStatus)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.tx.status(txs[i].get_digest_hex())];
                    case 3:
                        tx_status = _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.tx.status(txs[i])];
                    case 5:
                        tx_status = _a.sent();
                        _a.label = 6;
                    case 6:
                        res.push(tx_status);
                        return [3 /*break*/, 8];
                    case 7:
                        e_1 = _a.sent();
                        if (!(e_1 instanceof apiError_1.ApiError)) {
                            // if wedon't fail whole thing then we must push it into it to keep arrays same length.
                            // this needs looking at and asking eds opinion for future direction.
                            throw e_1;
                        }
                        return [3 /*break*/, 8];
                    case 8:
                        i++;
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/, res];
                }
            });
        });
    };
    LedgerApi.from_network_name = function (host, port) {
        return __awaiter(this, void 0, void 0, function () {
            var api, server_version;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        api = new LedgerApi(host, port);
                        return [4 /*yield*/, api.server.version()];
                    case 1:
                        server_version = _a.sent();
                        if (!semver.satisfies(semver.coerce(server_version), init_1.__compatible__.join(' '))) {
                            throw new errors_1.IncompatibleLedgerVersionError("Ledger version running on server is not compatible with this API  \n\n                                                 Server version: " + server_version + " \nExpected version: " + init_1.__compatible__.join(','));
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return LedgerApi;
}());
exports.LedgerApi = LedgerApi;
//# sourceMappingURL=init.js.map