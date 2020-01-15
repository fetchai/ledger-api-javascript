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
var axios_1 = __importDefault(require("axios"));
var errors_1 = require("../errors");
var bn_js_1 = require("bn.js");
var utils_1 = require("../utils");
var transaction_1 = require("../transaction");
var assert_1 = __importDefault(require("assert"));
var msgpack_1 = require("@msgpack/msgpack");
var crypto_1 = require("../crypto");
var bitvector_1 = require("../bitvector");
var transaction_2 = require("../serialization/transaction");
function format_contract_url(host, port, prefix, endpoint, protocol) {
    if (prefix === void 0) { prefix = null; }
    if (endpoint === void 0) { endpoint = null; }
    if (protocol === void 0) { protocol = 'http'; }
    var canonical_name, url;
    if (endpoint === null || endpoint === '') {
        url = protocol + "://" + host + ":" + port + "/api/contract/submit";
    }
    else {
        if (prefix == null) {
            canonical_name = endpoint;
        }
        else {
            canonical_name = prefix + "." + endpoint;
        }
        url = protocol + "://" + host + ":" + port + "/api/contract/" + canonical_name.replace(/\./g, '/');
    }
    return url;
}
/**
 * This class for all ledger endpoints operations
 *
 * @public
 * @class
 */
var ApiEndpoint = /** @class */ (function () {
    function ApiEndpoint(host, port, api) {
        var _a;
        this.DEFAULT_BLOCK_VALIDITY_PERIOD = 100;
        assert_1.default(typeof port === "number");
        assert_1.default(typeof host === "string");
        var protocol;
        if (host.includes('://')) {
            _a = __read(host.split('://'), 2), protocol = _a[0], host = _a[1];
        }
        else {
            protocol = 'http';
        }
        this._protocol = protocol;
        this.prefix = utils_1.PREFIX.TOKEN;
        this._host = host;
        this._port = port;
        this.parent_api = api;
    }
    ApiEndpoint.prototype.protocol = function () {
        return this._protocol;
    };
    ApiEndpoint.prototype.host = function () {
        return this._host;
    };
    ApiEndpoint.prototype.port = function () {
        return this._port;
    };
    /**
     * request to ledger
     *
     * @public
     * @method
     * @param  {endpoint} endpoint of the url.
     * @param  {data} data for request body.
     * @param  {prefix} prefix of the url.
     */
    ApiEndpoint.prototype.post_json = function (endpoint, data, prefix) {
        if (data === void 0) { data = {}; }
        if (prefix === void 0) { prefix = this.prefix; }
        return __awaiter(this, void 0, void 0, function () {
            var url, request_headers, resp, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = format_contract_url(this._host, this._port, prefix, endpoint, this._protocol);
                        request_headers = {
                            'Content-Type': 'application/json; charset=utf-8'
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default({
                                method: 'post',
                                url: url,
                                data: data,
                                headers: request_headers
                            })];
                    case 2:
                        resp = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        throw new errors_1.ApiError('Malformed response from server');
                    case 4:
                        // check the status code
                        if (200 <= resp.status && resp.status < 300) {
                            return [2 /*return*/, [true, resp.data]];
                        }
                        // in python add later perhaps
                        // # Allow for additional data to be transferred
                        // response = None
                        // try:
                        //     response = json.loads(raw_response.text)
                        // except:
                        //     pass
                        //
                        // return False, response
                        return [2 /*return*/, [false, resp.data]];
                }
            });
        });
    };
    ApiEndpoint.prototype.create_skeleton_tx = function (fee, validity_period) {
        if (validity_period === void 0) { validity_period = null; }
        return __awaiter(this, void 0, void 0, function () {
            var current_block, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!validity_period) {
                            validity_period = this.DEFAULT_BLOCK_VALIDITY_PERIOD;
                        }
                        return [4 /*yield*/, this.current_block_number()];
                    case 1:
                        current_block = _a.sent();
                        if (current_block < 0) {
                            throw new errors_1.ApiError('Unable to query current block number');
                        }
                        tx = new transaction_1.Transaction();
                        tx.valid_until(new bn_js_1.BN(current_block + validity_period));
                        tx.charge_rate(new bn_js_1.BN(1));
                        tx.charge_limit(new bn_js_1.BN(fee));
                        return [2 /*return*/, tx];
                }
            });
        });
    };
    /**
     *Appends signatures to a transaction and submits it, returning the transaction digest
     *
     * @param tx    A pre-assembled transaction
     * @param signatures    signers signatures
     * @returns {Promise<*>}    The digest of the submitted transaction
     */
    ApiEndpoint.prototype.submit_signed_tx = function (tx, signatures) {
        return __awaiter(this, void 0, void 0, function () {
            var encoded_tx;
            return __generator(this, function (_a) {
                encoded_tx = transaction_2.encode_multisig_transaction(tx, signatures);
                // Submit and return digest
                return [2 /*return*/, this.post_tx_json(encoded_tx, tx.action())];
            });
        });
    };
    // tx is transaction
    ApiEndpoint.prototype.set_validity_period = function (tx, validity_period) {
        if (validity_period === void 0) { validity_period = null; }
        return __awaiter(this, void 0, void 0, function () {
            var current_block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!validity_period) {
                            validity_period = this.DEFAULT_BLOCK_VALIDITY_PERIOD;
                        }
                        return [4 /*yield*/, this.current_block_number()];
                    case 1:
                        current_block = _a.sent();
                        tx.valid_until(new bn_js_1.BN(current_block + validity_period));
                        return [2 /*return*/, tx.valid_until()];
                }
            });
        });
    };
    ApiEndpoint.prototype.current_block_number = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, block_number;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._get_json('status/chain', { size: 1 })];
                    case 1:
                        response = _a.sent();
                        block_number = -1;
                        if (response) {
                            block_number = response.data['chain'][0].blockNumber;
                        }
                        return [2 /*return*/, block_number];
                }
            });
        });
    };
    ApiEndpoint.prototype._get_json = function (path, data) {
        return __awaiter(this, void 0, void 0, function () {
            var url, request_headers, resp, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "http://" + this._host + ":" + this._port + "/api/" + path;
                        request_headers = {
                            'Content-Type': 'application/json; charset=utf-8'
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default({
                                method: 'get',
                                url: url,
                                params: data,
                                headers: request_headers
                            })];
                    case 2:
                        resp = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        throw new errors_1.ApiError('Malformed response from server');
                    case 4:
                        if (200 <= resp.status && resp.status < 300) {
                            return [2 /*return*/, resp];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Submits a transaction to the a ledger endpoint
     *
     * @param tx_data
     * @param endpoint
     * @returns {Promise<null|*>} Promise resolves to the hexadecimal digest of the submitted transaction
     */
    ApiEndpoint.prototype.post_tx_json = function (tx_data, endpoint) {
        return __awaiter(this, void 0, void 0, function () {
            var request_headers, tx_payload, url, resp, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request_headers = {
                            'content-type': 'application/vnd+fetch.transaction+json'
                        };
                        tx_payload = {
                            ver: '1.2',
                            data: tx_data.toString('base64')
                        };
                        url = format_contract_url(this._host, this._port, this.prefix, endpoint, this._protocol);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default({
                                method: 'post',
                                url: url,
                                data: tx_payload,
                                headers: request_headers
                            })];
                    case 2:
                        resp = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        throw new errors_1.ApiError('Malformed response from server');
                    case 4:
                        if (200 <= resp.status && resp.status < 300) {
                            //TODO WHY DOES ED CHECK in python that there is a hash, else there is no return.
                            //TODO confirm that is as intended.
                            utils_1.logger.info("\n Transactions hash is " + resp.data.txs + " \n");
                            return [2 /*return*/, resp.data.txs[0]];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    return ApiEndpoint;
}());
exports.ApiEndpoint = ApiEndpoint;
var TransactionFactory = /** @class */ (function () {
    function TransactionFactory() {
    }
    TransactionFactory.create_skeleton_tx = function (fee) {
        // build up the basic transaction information
        var tx = new transaction_1.Transaction();
        tx.charge_rate(new bn_js_1.BN(1));
        tx.charge_limit(new bn_js_1.BN(fee));
        return tx;
    };
    TransactionFactory.create_action_tx = function (fee, from, action, prefix, shard_mask) {
        if (shard_mask === void 0) { shard_mask = null; }
        var mask = (shard_mask === null) ? new bitvector_1.BitVector() : shard_mask;
        fee = utils_1.convert_number(fee);
        var tx = TransactionFactory.create_skeleton_tx(fee);
        tx.from_address(new crypto_1.Address(from));
        tx.target_chain_code(prefix, mask);
        tx.action(action);
        return tx;
    };
    TransactionFactory.encode_msgpack_payload = function (args) {
        assert_1.default(Array.isArray(args));
        var extensionCodec = new msgpack_1.ExtensionCodec();
        extensionCodec.register({
            type: 77,
            encode: function (object) {
                if (object instanceof crypto_1.Address) {
                    return object.toBytes();
                }
                else {
                    return null;
                }
            },
            decode: function () { }
        });
        return msgpack_1.encode(args, { extensionCodec: extensionCodec });
    };
    return TransactionFactory;
}());
exports.TransactionFactory = TransactionFactory;
//# sourceMappingURL=common.js.map