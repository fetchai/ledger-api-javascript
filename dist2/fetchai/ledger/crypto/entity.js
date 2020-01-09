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
var crypto_1 = require("crypto");
var secp256k1 = __importStar(require("secp256k1"));
var errors_1 = require("../errors");
var identity_1 = require("./identity");
var fs_1 = __importDefault(require("fs"));
var aesjs = __importStar(require("aes-js"));
var util_1 = require("util");
var assert_1 = __importDefault(require("assert"));
/**
 * An entity is a full private/public key pair.
 *
 * @public
 * @class
 */
var Entity = /** @class */ (function (_super) {
    __extends(Entity, _super);
    /**
     * @param  {Buffer} private_key_bytes construct or generate the private key if one is not specified.
     * @throws {ValidationError} ValidationError if unable to load private key from input.
     */
    function Entity(private_key_bytes) {
        var _this = this;
        // construct or generate the private key if one is not specified
        if (private_key_bytes) {
            if (secp256k1.privateKeyVerify(private_key_bytes)) {
                var pubKey = Buffer.from(secp256k1
                    .publicKeyCreate(private_key_bytes, false)
                    .toString('hex')
                    .substring(2), 'hex');
                _this = _super.call(this, pubKey) || this;
                _this.pubKey = pubKey;
                _this.privKey = private_key_bytes;
            }
            else {
                throw new errors_1.ValidationError('Unable to load private key from input');
            }
        }
        else {
            var privKey = void 0;
            var pubKey = void 0;
            do {
                privKey = crypto_1.randomBytes(32);
                pubKey = Buffer.from(secp256k1
                    .publicKeyCreate(privKey, false)
                    .toString('hex')
                    .substring(2), 'hex');
            } while (!secp256k1.privateKeyVerify(privKey));
            _this = _super.call(this, pubKey) || this;
            _this.pubKey = pubKey;
            _this.privKey = privKey;
        }
        return _this;
    }
    /**
     * Get the private key.
     */
    Entity.prototype.private_key = function () {
        return this.privKey;
    };
    /**
     * Get the private key hex.
     */
    Entity.prototype.private_key_hex = function () {
        return this.privKey.toString('hex');
    };
    /**
     * Get the public key hex.
     */
    Entity.prototype.public_key_hex = function () {
        return this.pubKey.toString('hex');
    };
    /**
     * sign the message.
     * @param  {String} extMsgHash Message hash
     * @returns signature obj
     */
    Entity.prototype.sign = function (extMsgHash) {
        return secp256k1.sign(extMsgHash, this.privKey);
    };
    /**
     * Get the signature hex
     * @param  {Object} sigObj signature obj
     */
    Entity.prototype.signature_hex = function (sigObj) {
        return sigObj.signature.toString('hex');
    };
    Entity.from_base64 = function (private_key_base64) {
        var private_key_bytes = Buffer.from(private_key_base64, 'base64');
        return new Entity(private_key_bytes);
    };
    Entity.from_hex = function (private_key_hex) {
        var private_key_bytes = Buffer.from(private_key_hex, 'hex');
        return new Entity(private_key_bytes);
    };
    Entity.loads = function (s, password) {
        return __awaiter(this, void 0, void 0, function () {
            var obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        obj = JSON.parse(s);
                        return [4 /*yield*/, Entity.from_json_object(obj, password)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Entity.load = function (fp, password) {
        return __awaiter(this, void 0, void 0, function () {
            var x, obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Entity.strong_password(password)) {
                            throw new errors_1.ValidationError('Please enter strong password of 14 length which contains number(0-9), alphabetic character[(a-z), (A-Z)] and one special character.');
                        }
                        x = fs_1.default.readFileSync(fp, 'utf8');
                        obj = JSON.parse(x);
                        return [4 /*yield*/, Entity.from_json_object(obj, password)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Entity.prototype.prompt_dump = function (fp, password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // let password = readline.question('Please enter password ')
                        if (!Entity.strong_password(password)) {
                            throw new errors_1.ValidationError('Please enter strong password of 14 length which contains number(0-9), alphabetic character[(a-z), (A-Z)] and one special character.');
                        }
                        return [4 /*yield*/, this.dump(fp, password)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Entity.prototype.dumps = function (password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, JSON.stringify(this.to_json_object(password))];
            });
        });
    };
    Entity.prototype.dump = function (fp, password) {
        return __awaiter(this, void 0, void 0, function () {
            var json_object;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.to_json_object(password)];
                    case 1:
                        json_object = _a.sent();
                        fs_1.default.writeFileSync(fp, JSON.stringify(json_object));
                        return [2 /*return*/];
                }
            });
        });
    };
    Entity.prototype.to_json_object = function (password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                debugger;
                return [2 /*return*/, this.encrypt(password, this.privKey)];
            });
        });
    };
    Entity.from_json_object = function (obj, password) {
        return __awaiter(this, void 0, void 0, function () {
            var private_key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Entity.decrypt(password, Buffer.from(obj.password_salt, 'base64'), Buffer.from(obj.privateKey, 'base64'), obj.key_length, Buffer.from(obj.init_vector, 'base64'))];
                    case 1:
                        private_key = _a.sent();
                        return [2 /*return*/, Entity.from_base64(private_key.toString('base64'))];
                }
            });
        });
    };
    /** Encryption schema for private keys
     * @param  {String} password plaintext password to use for encryption
     * @param  {Buffer} data plaintext data to encrypt
     * @returns encrypted data, length of original data, initialization vector for aes, password hashing salt
     * @ignore
     */
    Entity.prototype.encrypt = function (password, data) {
        return __awaiter(this, void 0, void 0, function () {
            var DIGEST_BYTE_LENGTH, salt, promisified_pbkdf2, hashed_pass, err_1, iv, aes, encrypted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        DIGEST_BYTE_LENGTH = 32;
                        salt = crypto_1.randomBytes(16);
                        promisified_pbkdf2 = util_1.promisify(crypto_1.pbkdf2);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, promisified_pbkdf2(password, salt, 2000000, 32, 'sha256')];
                    case 2:
                        hashed_pass = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        throw new errors_1.RunTimeError('Encryption failed');
                    case 4:
                        iv = crypto_1.randomBytes(16);
                        aes = new aesjs.ModeOfOperation.cbc(hashed_pass, iv);
                        assert_1.default(data.length === DIGEST_BYTE_LENGTH);
                        encrypted = Buffer.alloc(0);
                        while (data.length) {
                            encrypted = Buffer.concat([
                                encrypted,
                                Buffer.from(aes.encrypt(data.slice(0, 16)))
                            ]);
                            data = data.slice(16);
                        }
                        debugger;
                        return [2 /*return*/, {
                                key_length: DIGEST_BYTE_LENGTH,
                                init_vector: iv.toString('base64'),
                                password_salt: salt.toString('base64'),
                                privateKey: encrypted.toString('base64'),
                            }];
                }
            });
        });
    };
    /**
     * Decryption schema for private keys
     * @param  {String} password plaintext password used for encryption
     * @param  {Buffer} salt password hashing salt
     * @param  {Buffer} data encrypted data string
     * @param  {Number} n length of original plaintext data
     * @param  {Buffer} iv initialization vector for aes
     * @returns decrypted data as plaintext
     * @ignore
     */
    Entity.decrypt = function (password, salt, data, n, iv) {
        return __awaiter(this, void 0, void 0, function () {
            var promisified_pbkdf2, hashed_pass, err_2, aes, decrypted, decrypted_data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promisified_pbkdf2 = util_1.promisify(crypto_1.pbkdf2);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, promisified_pbkdf2(password, salt, 2000000, 32, 'sha256')];
                    case 2:
                        hashed_pass = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        throw new errors_1.RunTimeError('Decryption failed');
                    case 4:
                        aes = new aesjs.ModeOfOperation.cbc(hashed_pass, iv);
                        decrypted = Buffer.alloc(0);
                        while (data.length) {
                            decrypted = Buffer.concat([
                                decrypted,
                                Buffer.from(aes.decrypt(data.slice(0, 16)))
                            ]);
                            data = data.slice(16);
                        }
                        decrypted_data = decrypted.slice(0, n);
                        // Return original data
                        return [2 /*return*/, decrypted_data];
                }
            });
        });
    };
    /**
     * Checks that a password is of sufficient length and contains all character classes
     * @param  {String} password plaintext password
     * @returns {Boolean} True if password is strong
     * @ignore
     */
    Entity.strong_password = function (password) {
        if (password.length < 14) {
            return false;
        }
        if (password.match('[a-z]+') === null) {
            return false;
        }
        if (password.match('[A-Z]+') === null) {
            return false;
        }
        if (password.match('[0-9]+') === null) {
            return false;
        }
        if (password.match('[@_!#$%^&*()<>?/\\|}{~:]') === null) {
            return false;
        }
        return true;
    };
    return Entity;
}(identity_1.Identity));
exports.Entity = Entity;
//# sourceMappingURL=entity.js.map