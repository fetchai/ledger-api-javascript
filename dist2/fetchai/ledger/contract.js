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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var assert_1 = __importDefault(require("assert"));
var address_1 = require("./crypto/address");
var bitvector_1 = require("./bitvector");
var contracts_1 = require("./api/contracts");
var crypto_1 = require("crypto");
var atob_1 = __importDefault(require("atob"));
var btoa_1 = __importDefault(require("btoa"));
var api_1 = require("./api");
var utils_1 = require("./utils");
var errors_1 = require("./errors");
var parser_1 = require("./parser/parser");
var shardmask_1 = require("./serialization/shardmask");
var calc_address = function (owner, nonce) {
    assert_1.default(owner instanceof address_1.Address);
    var hash_func = crypto_1.createHash('sha256');
    hash_func.update(owner.toBytes());
    hash_func.update(nonce);
    return hash_func.digest();
};
var Contract = /** @class */ (function () {
    function Contract(source, owner, nonce) {
        assert_1.default(typeof source === 'string');
        this._source = source;
        this._digest = new address_1.Address(utils_1.calc_digest(source));
        this._owner = new address_1.Address(owner);
        this._nonce = nonce || crypto_1.randomBytes(8);
        this._address = new address_1.Address(calc_address(this._owner, this._nonce));
    }
    Contract.prototype.name = function () {
        return this._digest.toBytes().toString('hex') + this._address.toHex();
    };
    Contract.prototype.encoded_source = function () {
        return btoa_1.default(this._source);
    };
    // combined getter/setter mimicking the python.
    Contract.prototype.owner = function (owner) {
        if (owner === void 0) { owner = null; }
        if (owner !== null)
            this._owner = new address_1.Address(owner);
        return this._owner;
    };
    Contract.prototype.digest = function () {
        return this._digest;
    };
    Contract.prototype.source = function () {
        return this._source;
    };
    Contract.prototype.dumps = function () {
        return JSON.stringify(this.to_json_object());
    };
    Contract.prototype.dump = function (fp) {
        fs.writeFileSync(fp, JSON.stringify(this.to_json_object()));
    };
    Contract.loads = function (s) {
        return Contract.from_json_object(JSON.parse(s));
    };
    Contract.load = function (fp) {
        var obj = JSON.parse(fs.readFileSync(fp, 'utf8'));
        return Contract.from_json_object(obj);
    };
    Contract.prototype.nonce = function () {
        return btoa_1.default(this._nonce);
    };
    Contract.prototype.nonce_bytes = function () {
        return this._nonce;
    };
    Contract.prototype.address = function () {
        return this._address;
    };
    Contract.prototype.create = function (api, owner, fee, signers) {
        if (signers === void 0) { signers = null; }
        return __awaiter(this, void 0, void 0, function () {
            var shard_mask;
            return __generator(this, function (_a) {
                this.owner(owner);
                fee = utils_1.convert_number(fee);
                //todo THIS LOOKS LIKE BUG, look at later. It can never == null so unreachable at present.
                if (this._init === null) {
                    throw new errors_1.RunTimeError('Contract has no initialisation function');
                }
                try {
                    //todo todo todo todo todo
                    //TODO modify hen added etch parser
                    // temp we put empty shard mask.
                    shard_mask = new bitvector_1.BitVector();
                }
                catch (e) {
                    utils_1.logger.info('WARNING: Couldn\'t auto-detect used shards, using wildcard shard mask');
                    shard_mask = new bitvector_1.BitVector();
                }
                return [2 /*return*/, Contract.api(api).create(owner, this, fee, signers, shard_mask)];
            });
        });
    };
    Contract.prototype.query = function (api, name, data) {
        return __awaiter(this, void 0, void 0, function () {
            var annotations, _a, success, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this._owner === null) {
                            throw new errors_1.RunTimeError('Contract has no owner, unable to perform any queries. Did you deploy it?');
                        }
                        annotations = parser_1.Parser.get_annotations(this._source);
                        if (typeof annotations['@query'] === 'undefined' || !annotations['@query'].includes(name)) {
                            throw new errors_1.ValidationError("Contract does not contain function: " + name + " with annotation @query");
                        }
                        return [4 /*yield*/, Contract.api(api).query(this._address, name, data)];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent(), 2]), success = _a[0], response = _a[1];
                        if (!success) {
                            if (response !== null && 'msg' in response) {
                                throw new errors_1.RunTimeError('Failed to make requested query: ' + response['msg']);
                            }
                            else {
                                throw new errors_1.RunTimeError('Failed to make requested query with no error message.');
                            }
                        }
                        return [2 /*return*/, response['result']];
                }
            });
        });
    };
    Contract.prototype.action = function (api, name, fee, args, signers) {
        if (signers === void 0) { signers = null; }
        return __awaiter(this, void 0, void 0, function () {
            var annotations, resource_addresses, num_lanes, shard_mask, from_address;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fee = utils_1.convert_number(fee);
                        // verify if we are used undefined
                        if (this._owner === null) {
                            throw new errors_1.RunTimeError('Contract has no owner, unable to perform any actions. Did you deploy it?');
                        }
                        annotations = parser_1.Parser.get_annotations(this._source);
                        if (typeof annotations['@action'] === 'undefined' || !annotations['@action'].includes(name)) {
                            throw new errors_1.ValidationError("Contract does not contain function: " + name + " with annotation @action");
                        }
                        resource_addresses = parser_1.Parser.get_resource_addresses(this._source, name, args);
                        return [4 /*yield*/, api.server.num_lanes()];
                    case 1:
                        num_lanes = _a.sent();
                        shard_mask = shardmask_1.ShardMask.resources_to_shard_mask(resource_addresses, num_lanes);
                        from_address = (signers.length === 1) ? new address_1.Address(signers[0]) : new address_1.Address(this._owner);
                        return [2 /*return*/, Contract.api(api).action(this._address, name, fee, from_address, args, signers, shard_mask)];
                }
            });
        });
    };
    Contract.api = function (ContractsApiLike) {
        if (ContractsApiLike instanceof contracts_1.ContractTxFactory) {
            return ContractsApiLike;
        }
        else if (ContractsApiLike instanceof api_1.LedgerApi) {
            return ContractsApiLike.contracts;
        }
        else {
            throw new errors_1.ValidationError("");
        }
    };
    Contract.from_json_object = function (obj) {
        assert_1.default(obj['version'] === 1);
        var source = atob_1.default(obj.source);
        var owner = obj['owner'];
        var nonce = atob_1.default(obj['nonce']);
        return new Contract(source, owner, Buffer.from(nonce, 'base64'));
    };
    Contract.prototype.to_json_object = function () {
        return {
            'version': 1,
            'owner': this._owner.toString(),
            'source': this.encoded_source(),
            'nonce': this.nonce(),
        };
    };
    return Contract;
}());
exports.Contract = Contract;
//# sourceMappingURL=contract.js.map