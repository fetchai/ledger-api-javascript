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
var errors_1 = require("../errors");
var common_1 = require("./common");
var transaction_1 = require("../serialization/transaction");
var crypto_1 = require("../crypto");
var bn_js_1 = require("bn.js");
var assert_1 = __importDefault(require("assert"));
/**
 * If number is not Big Number instance converts to BN, or throws if int passed is too large or small throw.
 *
 * @param num
 * @returns {BN}
 */
var convert_number = function (num) {
    // currently only support BN.js or number
    if (typeof num !== 'number' && !bn_js_1.BN.isBN(num)) {
        throw new errors_1.ValidationError(num + " is must be instance of BN.js or an Integer");
    }
    if (typeof num === 'number' && !Number.isSafeInteger(num)) {
        throw new errors_1.ValidationError(" " + num + " is not a safe number (<53 bits), please use an instance of BN.js");
    }
    return new bn_js_1.BN(num);
};
/**
 * This class for all Tokens APIs.
 *
 * @public
 * @class
 */
var TokenApi = /** @class */ (function (_super) {
    __extends(TokenApi, _super);
    /**
     * Create new TokenApi object with host and port.
     * @constructor
     * @param {String} host ledger host
     * @param {Number} port ledger port
     */
    function TokenApi(host, port, api) {
        var _this = _super.call(this, host, port, api) || this;
        _this.prefix = 'fetch.token';
        return _this;
    }
    /**
     * Query the balance for a given address from the remote node.
     * @async
     * @method
     * @param {Object} address base64 encoded string containing the address of the node.
     * @returns {Number} The balance value retried.
     * @throws {ApiError} ApiError on any failures.
     */
    TokenApi.prototype.balance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var request, _a, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // convert the input to an address
                        address = new crypto_1.Address(address);
                        request = { address: address.toString() };
                        return [4 /*yield*/, _super.prototype.post_json.call(this, 'balance', request, this.prefix)];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent(), 2]), data = _a[1];
                        if (!('balance' in data)) {
                            throw new errors_1.ApiError('Malformed response from server (no balance)');
                        }
                        // return the balance
                        return [2 /*return*/, new bn_js_1.BN(data['balance'])];
                }
            });
        });
    };
    /**
     *
     * @param address
     * @returns {Promise<BN|BN.props>}
     */
    TokenApi.prototype.stake = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var request, _a, success, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // convert the input to an address
                        address = new crypto_1.Address(address);
                        request = {
                            'address': address.toString()
                        };
                        return [4 /*yield*/, _super.prototype.post_json.call(this, 'stake', request)
                            // check for error cases
                        ];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent()
                            // check for error cases
                            , 2]), success = _a[0], data = _a[1];
                        // check for error cases
                        if (!success) {
                            throw new errors_1.ApiError('Failed to request balance for address ' + address.toString());
                        }
                        if (!('stake' in data)) {
                            throw new errors_1.ApiError('Malformed response from server');
                        }
                        // return the balance
                        return [2 /*return*/, new bn_js_1.BN(data['stake'])];
                }
            });
        });
    };
    /**
     * Query the stake on cooldown for a given address from the remote node
     *
     * @param address  The base58 encoded string containing the address of the node
     * @returns {Promise<void>}
     */
    TokenApi.prototype.stake_cooldown = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var request, _a, success, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // convert the input to an address
                        address = new crypto_1.Address(address);
                        request = {
                            'address': address.toString()
                        };
                        return [4 /*yield*/, _super.prototype.post_json.call(this, 'cooldownStake', request)
                            // check for error cases
                        ];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent()
                            // check for error cases
                            , 2]), success = _a[0], data = _a[1];
                        // check for error cases
                        if (!success) {
                            throw new errors_1.ApiError('Failed to request cooldown stake for address ' + address.toString());
                        }
                        if (!('cooldownStake' in data)) {
                            throw new errors_1.ApiError('Malformed response from server');
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * Sets the deed for a multi-sig account
     *
     * @param entity The entity object to create deed for
     * @param deed The deed to set
     * @param signatories The entities that will sign this action
     * @param allow_no_amend if true will not be able to ammend deed
     * @returns {Promise<*>} The digest of the submitted transaction
     */
    TokenApi.prototype.deed = function (entity, deed, signatories, allow_no_amend) {
        if (signatories === void 0) { signatories = null; }
        if (allow_no_amend === void 0) { allow_no_amend = false; }
        return __awaiter(this, void 0, void 0, function () {
            var tx, encoded_tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TokenTxFactory.deed(entity, deed, signatories, allow_no_amend)];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, _super.prototype.set_validity_period.call(this, tx)];
                    case 2:
                        _a.sent();
                        signatories = (signatories === null) ? [entity] : signatories;
                        encoded_tx = transaction_1.encode_transaction(tx, signatories);
                        return [4 /*yield*/, _super.prototype.post_tx_json.call(this, encoded_tx, ENDPOINT.DEED)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Transfers FET from one account to another account.
     *
     * @param {Object} entity Entity bytes of the private key of the source address.
     * @param {Object} to to bytes of the targeted address to send funds to.
     * @param {Number} amount amount of funds being transferred.
     * @param {Number} fee fee associated with the transfer.
     * @returns The digest of the submitted transaction.
     * @throws {ApiError} ApiError on any failures.
     */
    TokenApi.prototype.transfer = function (entity, to, amount, fee, signatories) {
        if (signatories === void 0) { signatories = null; }
        return __awaiter(this, void 0, void 0, function () {
            var tx, encoded_tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        amount = convert_number(amount);
                        fee = convert_number(fee);
                        tx = TokenTxFactory.transfer(entity, to, amount, fee, signatories);
                        return [4 /*yield*/, this.set_validity_period(tx)];
                    case 1:
                        _a.sent();
                        if (signatories == null) {
                            signatories = [entity];
                        }
                        encoded_tx = transaction_1.encode_transaction(tx, signatories);
                        return [4 /*yield*/, this.post_tx_json(encoded_tx, ENDPOINT.TRANSFER)];
                    case 2: 
                    //submit the transaction
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Stakes a specific amount of
     *
     * @param entity The entity object that desires to stake
     * @param amount The amount to stake
     * @param fee
     */
    TokenApi.prototype.add_stake = function (entity, amount, fee) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, encoded_tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        amount = convert_number(amount);
                        fee = convert_number(fee);
                        return [4 /*yield*/, TokenTxFactory.add_stake(entity, amount, fee)];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, _super.prototype.set_validity_period.call(this, tx)
                            // encode and sign the transaction
                        ];
                    case 2:
                        _a.sent();
                        encoded_tx = transaction_1.encode_transaction(tx, [entity]);
                        return [4 /*yield*/, _super.prototype.post_tx_json.call(this, encoded_tx, ENDPOINT.ADDSTAKE)];
                    case 3: 
                    // submit the transaction
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Destakes a specific amount of tokens from a staking miner. This will put the tokens in a cool down period
     *
     * @param entity The entity object that desires to destake
     * @param amount The amount of tokens to destake
     * @param fee
     * @returns {Promise<*>} The digest of the submitted transaction
     */
    TokenApi.prototype.de_stake = function (entity, amount, fee) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, encoded_tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fee = convert_number(fee);
                        amount = convert_number(amount);
                        tx = TokenTxFactory.de_stake(entity, amount, fee);
                        return [4 /*yield*/, _super.prototype.set_validity_period.call(this, tx)
                            // encode and sign the transaction
                        ];
                    case 1:
                        _a.sent();
                        encoded_tx = transaction_1.encode_transaction(tx, [entity]);
                        return [4 /*yield*/, _super.prototype.post_tx_json.call(this, encoded_tx, ENDPOINT.DESTAKE)];
                    case 2: 
                    // submit the transaction
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Collect all stakes that have reached the end of the cooldown period
     *
     * @param entity The entity object that desires to collect
     * @param fee
     * @returns {Promise<*>}
     */
    TokenApi.prototype.collect_stake = function (entity, fee) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, encoded_tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fee = convert_number(fee);
                        tx = TokenTxFactory.collect_stake(entity, fee);
                        return [4 /*yield*/, _super.prototype.set_validity_period.call(this, tx)
                            // encode and sign the transaction
                        ];
                    case 1:
                        _a.sent();
                        encoded_tx = transaction_1.encode_transaction(tx, [entity]);
                        return [4 /*yield*/, _super.prototype.post_tx_json.call(this, encoded_tx, ENDPOINT.COLLECTSTAKE)];
                    case 2: 
                    // submit the transaction
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return TokenApi;
}(common_1.ApiEndpoint));
exports.TokenApi = TokenApi;
var TokenTxFactory = /** @class */ (function (_super) {
    __extends(TokenTxFactory, _super);
    function TokenTxFactory() {
        var _this = _super.call(this) || this;
        _this.prefix = 'fetch.token';
        return _this;
    }
    TokenTxFactory.deed = function (entity, deed, signatories, allow_no_amend) {
        if (signatories === void 0) { signatories = null; }
        if (allow_no_amend === void 0) { allow_no_amend = false; }
        var tx = common_1.TransactionFactory.create_action_tx(10000, entity, ENDPOINT.DEED, 'fetch.token');
        if (signatories !== null) {
            signatories.forEach(function (sig) { return tx.add_signer(sig.public_key_hex()); });
        }
        else {
            tx.add_signer(entity.public_key_hex());
        }
        var deed_json = deed.deed_creation_json(allow_no_amend);
        tx.data(JSON.stringify(deed_json));
        return tx;
    };
    TokenTxFactory.transfer = function (entity, to, amount, fee, signatories) {
        if (signatories === void 0) { signatories = null; }
        fee = convert_number(fee);
        amount = convert_number(amount);
        // build up the basic transaction information
        var tx = _super.create_skeleton_tx.call(this, fee);
        tx.from_address(new crypto_1.Address(entity));
        tx.add_transfer(to, amount);
        if (signatories !== null) {
            signatories.forEach(function (ent) { return tx.add_signer(ent.public_key_hex()); });
        }
        else {
            tx.add_signer(entity.public_key_hex());
        }
        return tx;
    };
    TokenTxFactory.add_stake = function (entity, amount, fee, signatories) {
        if (signatories === void 0) { signatories = null; }
        // build up the basic transaction information
        fee = convert_number(fee);
        amount = convert_number(amount);
        var tx = common_1.TransactionFactory.create_action_tx(fee, entity, ENDPOINT.ADDSTAKE, 'fetch.token');
        if (signatories !== null) {
            signatories.forEach(function (ent) { return tx.add_signer(ent.public_key_hex()); });
        }
        else {
            tx.add_signer(entity.public_key_hex());
        }
        var encoded = JSON.stringify({
            address: entity.public_key_base64(),
            amount: amount.toNumber()
        });
        tx.data(encoded);
        return tx;
    };
    TokenTxFactory.de_stake = function (entity, amount, fee, signatories) {
        if (signatories === void 0) { signatories = null; }
        assert_1.default(bn_js_1.BN.isBN(amount));
        assert_1.default(bn_js_1.BN.isBN(fee));
        // build up the basic transaction information
        var tx = common_1.TransactionFactory.create_action_tx(fee, entity, ENDPOINT.DESTAKE, 'fetch.token');
        if (signatories !== null) {
            signatories.forEach(function (ent) { return tx.add_signer(ent.public_key_hex()); });
        }
        else {
            tx.add_signer(entity.public_key_hex());
        }
        // format the transaction payload
        tx.data(JSON.stringify({
            'address': entity.public_key_base64(),
            'amount': amount.toNumber()
        }));
        return tx;
    };
    TokenTxFactory.collect_stake = function (entity, fee, signatories) {
        if (signatories === void 0) { signatories = null; }
        assert_1.default(bn_js_1.BN.isBN(fee));
        // build up the basic transaction information
        var tx = common_1.TransactionFactory.create_action_tx(fee, entity, ENDPOINT.COLLECTSTAKE, 'fetch.token');
        if (signatories !== null) {
            signatories.forEach(function (ent) { return tx.add_signer(ent.public_key_hex()); });
        }
        else {
            tx.add_signer(entity.public_key_hex());
        }
        return tx;
    };
    return TokenTxFactory;
}(common_1.TransactionFactory));
exports.TokenTxFactory = TokenTxFactory;
//# sourceMappingURL=token.js.map