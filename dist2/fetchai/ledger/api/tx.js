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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var errors_1 = require("../errors");
var address_1 = require("../crypto/address");
var bn_js_1 = require("bn.js");
var common_1 = require("./common");
var utils_1 = require("../utils");
var NON_TERMINAL_STATES;
(function (NON_TERMINAL_STATES) {
    NON_TERMINAL_STATES["UNKNOWN"] = "Unknown";
    NON_TERMINAL_STATES["PENDING"] = "Pending";
})(NON_TERMINAL_STATES || (NON_TERMINAL_STATES = {}));
var SUCCESSFUL_TERMINAL_STATES;
(function (SUCCESSFUL_TERMINAL_STATES) {
    SUCCESSFUL_TERMINAL_STATES["EXECUTED"] = "Executed";
    SUCCESSFUL_TERMINAL_STATES["SUBMITTED"] = "Submitted";
})(SUCCESSFUL_TERMINAL_STATES || (SUCCESSFUL_TERMINAL_STATES = {}));
/*
takes an array and turns it into an object, setting the to field and the amount field.
//TODO ASK ED IF THIS OK?, since we want insertion order, which plain objects don't.
 */
var tx_array_to_object = function (array) {
    return array.reduce(function (obj, item) {
        obj[item.to] = new bn_js_1.BN(item.amount);
        return obj;
    }, {});
};
var TxStatus = /** @class */ (function () {
    function TxStatus(digest, status, exit_code, charge, charge_rate, fee) {
        this.digest_bytes = digest;
        this.digest_hex = this.digest_bytes.toString('hex');
        this.status = status;
        this.exit_code = exit_code;
        this.charge = new bn_js_1.BN(charge);
        this.charge_rate = new bn_js_1.BN(charge_rate);
        this.fee = new bn_js_1.BN(fee);
    }
    TxStatus.prototype.get_status = function () {
        return this.status;
    };
    TxStatus.prototype.get_exit_code = function () {
        return this.exit_code;
    };
    TxStatus.prototype.successful = function () {
        return Object.values(SUCCESSFUL_TERMINAL_STATES).includes(this.status);
    };
    TxStatus.prototype.failed = function () {
        return (!Object.values(NON_TERMINAL_STATES).includes(this.status) &&
            !Object.values(SUCCESSFUL_TERMINAL_STATES).includes(this.status));
    };
    TxStatus.prototype.non_terminal = function () {
        return Object.values(NON_TERMINAL_STATES).includes(this.status);
    };
    TxStatus.prototype.get_digest_hex = function () {
        return this.digest_hex;
    };
    TxStatus.prototype.get_digest_bytes = function () {
        return this.digest_bytes;
    };
    return TxStatus;
}());
exports.TxStatus = TxStatus;
var TxContents = /** @class */ (function () {
    function TxContents(digest, action, chain_code, from_address, contract_address, valid_from, valid_until, charge, charge_limit, transfers, signatories, data) {
        this.digest_bytes = digest;
        this.digest_hex = this.digest_bytes.toString('hex');
        this.action = action;
        this.chain_code = chain_code;
        this.from_address = new address_1.Address(from_address);
        this.contract_address = (contract_address) ? new address_1.Address(contract_address) : null;
        this.valid_from = utils_1.convert_number(valid_from);
        this.valid_until = utils_1.convert_number(valid_until);
        this.charge = utils_1.convert_number(charge);
        this.charge_limit = utils_1.convert_number(charge_limit);
        this.transfers = tx_array_to_object(transfers);
        this.signatories = signatories;
        this.data = data;
    }
    /**
     *  Returns the amount of FET transferred to an address by this transaction, if any
     */
    TxContents.prototype.transfers_to = function (address) {
        var hex = new address_1.Address(address).toHex();
        return (this.transfers[hex]) ? this.transfers[hex] : new bn_js_1.BN(0);
    };
    /**
     *Creates a TxContents from a json string or an object
     */
    TxContents.from_json = function (data) {
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }
        if (data.digest.toUpperCase().substring(0, 2) === '0X')
            data.digest = data.digest.substring(2);
        //  Extract contents from json, converting as necessary
        return new TxContents(Buffer.from(data.digest, 'hex'), data.action, data.chainCode, data.from, data.contractAddress, data.validFrom, data.validUntil, data.charge, data.chargeLimit, data.transfers, data.signatories, data.data);
    };
    return TxContents;
}());
exports.TxContents = TxContents;
var TransactionApi = /** @class */ (function (_super) {
    __extends(TransactionApi, _super);
    function TransactionApi() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TransactionApi.prototype.status = function (tx_digest) {
        return __awaiter(this, void 0, void 0, function () {
            var url, request_headers, resp, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.protocol() + "://" + this.host() + ":" + this.port() + "/api/status/tx/" + tx_digest;
                        request_headers = {
                            'Content-Type': 'application/json; charset=utf-8'
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default({
                                method: 'get',
                                url: url
                            })];
                    case 2:
                        resp = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        throw new errors_1.ApiError('Malformed response from server');
                    case 4:
                        if (200 !== resp.status) {
                            throw new errors_1.NetworkUnavailableError('Failed to get status from txs hash');
                        }
                        return [2 /*return*/, new TxStatus(Buffer.from(resp.data.tx, 'hex'), resp.data.status, resp.data.exit_code, resp.data.charge, resp.data.charge_rate, resp.data.fee)];
                }
            });
        });
    };
    TransactionApi.prototype.contents = function (tx_digest) {
        return __awaiter(this, void 0, void 0, function () {
            var url, resp, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.protocol() + "://" + this.host() + ":" + this.port() + "/api/tx/" + tx_digest;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default({
                                method: 'get',
                                url: url
                            })];
                    case 2:
                        resp = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        throw new errors_1.ApiError('Malformed response from server');
                    case 4:
                        if (200 !== resp.status) {
                            throw new errors_1.NetworkUnavailableError('Failed to get contents from txs hash');
                        }
                        return [2 /*return*/, TxContents.from_json(resp.data)];
                }
            });
        });
    };
    return TransactionApi;
}(common_1.ApiEndpoint));
exports.TransactionApi = TransactionApi;
//# sourceMappingURL=tx.js.map