"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
var assert_1 = __importDefault(require("assert"));
var address_1 = require("../crypto/address");
var common_1 = require("./common");
var contract_1 = require("../contract");
var transaction_1 = require("../serialization/transaction");
/**
 * This class for all Tokens APIs.
 *
 * @public
 * @class
 */
var ContractsApi = /** @class */ (function (_super) {
    __extends(ContractsApi, _super);
    /**
     *
     * @param {String} HOST Ledger host.
     * @param {String} PORT Ledger port.
     */
    function ContractsApi(host, port, api) {
        var _this = _super.call(this, host, port, api) || this;
        // tidy up before submitting
        _this.prefix = PREFIX.CONTRACT;
        return _this;
    }
    /**
     * Create contract
     * @param {Object} owner Entity object
     * @param {Number} fee fee associated with the contract creation.
     * @param {String} contract contract
     * @param {Object} [shard_mask=null] BitVector object
     */
    ContractsApi.prototype.create = function (owner, contract, fee, signers, shard_mask) {
        if (signers === void 0) { signers = null; }
        if (shard_mask === void 0) { shard_mask = null; }
        return __awaiter(this, void 0, void 0, function () {
            var ENDPOINT, contractTxFactory, tx, encoded_tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert_1.default(contract instanceof contract_1.Contract);
                        ENDPOINT = 'create';
                        contractTxFactory = new ContractTxFactory(this.parent_api);
                        return [4 /*yield*/, contractTxFactory.create(owner, contract, fee, null, shard_mask)];
                    case 1:
                        tx = _a.sent();
                        signers = (signers !== null) ? signers : [owner];
                        encoded_tx = transaction_1.encode_transaction(tx, signers);
                        contract.owner(owner);
                        return [4 /*yield*/, this.post_tx_json(encoded_tx)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Query on contract
     * @param {Object} contract_owner Address object
     * @param {String} query query string
     * @param {JSON} data json payload
     */
    ContractsApi.prototype.query = function (contract_owner, query, data) {
        return __awaiter(this, void 0, void 0, function () {
            var encoded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert_1.default(this.isJSON(data));
                        encoded = this._encode_json_payload(data);
                        return [4 /*yield*/, this.post_json(query, encoded, contract_owner.toString())];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Action on ledger/contract
     * @param {Object} contract_digest Address class object
     * @param {Object} contract_address Address class object
     * @param {String} action action
     * @param {Number} fee fee associated with the action.
     * @param {Object} from_address from address
     * @param {Array} signers Entity list
     * @param {*} args arguments
     * @param {Object} shard_mask BitVector object
     */
    ContractsApi.prototype.action = function (contract_address, action, fee, from_address, signers, args, shard_mask) {
        if (shard_mask === void 0) { shard_mask = null; }
        return __awaiter(this, void 0, void 0, function () {
            var contractTxFactory, tx, i, encoded_tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contractTxFactory = new ContractTxFactory(this.parent_api);
                        return [4 /*yield*/, contractTxFactory.action(contract_address, action, fee, from_address, args, signers, shard_mask)];
                    case 1:
                        tx = _a.sent();
                        for (i = 0; i < signers.length; i++) {
                            tx.add_signer(signers[i].public_key_hex());
                        }
                        return [4 /*yield*/, this.set_validity_period(tx)];
                    case 2:
                        _a.sent();
                        encoded_tx = transaction_1.encode_transaction(tx, signers);
                        return [4 /*yield*/, this.post_tx_json(encoded_tx)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ContractsApi.prototype._encode_json_payload = function (data) {
        var e_1, _a, _b;
        assert_1.default(typeof data === 'object' && data !== null);
        var params = {};
        var new_key;
        try {
            //generic object/array loop
            for (var _c = __values(Object.entries(data)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), key = _e[0], value = _e[1];
                assert_1.default(typeof key === 'string');
                if (key.endsWith('_')) {
                    new_key = key.substring(0, key.length - 1);
                    // mutate key name
                    delete Object.assign(data, (_b = {}, _b[new_key] = data[key], _b))[new_key];
                    key = new_key;
                }
                if (ContractsApi._is_primitive(value)) {
                    params[key] = value;
                }
                else if (value instanceof address_1.Address) {
                    params[key] = value.toString();
                }
                else {
                    params[key] = this._encode_json_payload(value);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return params;
    };
    ContractsApi._is_primitive = function (test) {
        return test !== Object(test);
    };
    // taken from http://stackz.ru/en/4295386/how-can-i-check-if-a-value-is-a-json-object
    ContractsApi.prototype.isJSON = function (o) {
        if (typeof o != 'string') {
            o = JSON.stringify(o);
        }
        try {
            JSON.parse(o);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    ContractsApi.prototype.post_tx_json = function (tx_data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, _super.prototype.post_tx_json.call(this, tx_data, null)];
            });
        });
    };
    return ContractsApi;
}(common_1.ApiEndpoint));
exports.ContractsApi = ContractsApi;
var ContractTxFactory = /** @class */ (function (_super) {
    __extends(ContractTxFactory, _super);
    function ContractTxFactory(api) {
        var _this = _super.call(this) || this;
        _this.api = api;
        _this.prefix = PREFIX.CONTRACT;
        return _this;
    }
    /**
     * Replicate server interface for fetching number of lanes
     *
     * @returns {*}
     */
    ContractTxFactory.prototype.server = function () {
        return this.api.server;
    };
    /**
     * Replicate setting of validity period using server
     *
     * @param tx
     * @param validity_period
     */
    ContractTxFactory.prototype.set_validity_period = function (tx, validity_period) {
        if (validity_period === void 0) { validity_period = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.server.set_validity_period(tx, validity_period)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContractTxFactory.prototype.action = function (contract_address, action, fee, from_address, args, signers, shard_mask) {
        if (signers === void 0) { signers = null; }
        if (shard_mask === void 0) { shard_mask = null; }
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = common_1.TransactionFactory.create_action_tx(fee, from_address, action, PREFIX.CONTRACT, shard_mask);
                        tx.target_contract(contract_address, shard_mask);
                        tx.data(common_1.TransactionFactory.encode_msgpack_payload(args));
                        return [4 /*yield*/, this.set_validity_period(tx)];
                    case 1:
                        _a.sent();
                        if (signers !== null) {
                            signers.forEach(function (signer) {
                                tx.add_signer(signer.public_key_hex());
                            });
                        }
                        return [2 /*return*/, tx];
                }
            });
        });
    };
    ContractTxFactory.prototype.create = function (owner, contract, fee, signers, shard_mask) {
        if (signers === void 0) { signers = null; }
        if (shard_mask === void 0) { shard_mask = null; }
        return __awaiter(this, void 0, void 0, function () {
            var tx, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = common_1.TransactionFactory.create_action_tx(fee, owner, ENDPOINT.CREATE, PREFIX.CONTRACT, shard_mask);
                        data = JSON.stringify({
                            'text': contract.encoded_source(),
                            'nonce': contract.nonce(),
                            'digest': contract.digest().toHex()
                        });
                        tx.data(data);
                        return [4 /*yield*/, this.set_validity_period(tx)];
                    case 1:
                        _a.sent();
                        if (signers !== null) {
                            signers.forEach(function (signer) {
                                tx.add_signer(signer.public_key_hex());
                            });
                        }
                        else {
                            tx.add_signer(owner.public_key_hex());
                        }
                        return [2 /*return*/, tx];
                }
            });
        });
    };
    return ContractTxFactory;
}(common_1.TransactionFactory));
exports.ContractTxFactory = ContractTxFactory;
//# sourceMappingURL=contracts.js.map