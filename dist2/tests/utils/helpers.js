"use strict";
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var bs58 = __importStar(require("bs58"));
var crypto_1 = require("crypto");
var address_1 = require("../../fetchai/ledger/crypto/address");
var entity_1 = require("../../fetchai/ledger/crypto/entity");
var identity_1 = require("../../fetchai/ledger/crypto/identity");
exports.LOCAL_HOST = '127.0.0.1';
exports.DEFAULT_PORT = 8000;
exports.RAND_FP = '/path/to/file';
exports.PASSWORD = 'Password!12345';
exports._PRIVATE_KEYS = [
    '1411d53f88e736eac7872430dbe5b55ac28c17a3e648c388e0bd1b161ab04427',
    '3436c184890d498b25bc2b5cb0afb6bad67379ebd778eae1de40b6e0f0763825',
    '4a56a19355f934174f6388b3c80598abb151af79c23d5a7af45a13357fb71253',
    'f9d67ec139eb7a1cb1f627357995847392035c1e633e8530de5ab5d04c6e9c33',
    '80f0e1c69e5f1216f32647c20d744c358e0894ebc855998159017a5acda208ba',
];
exports.ENTITIES = (_a = __read((function () {
    var ENTITIES = [];
    var IDENTITIES = [];
    var ADDRESSES = [];
    for (var i = 0; i < exports._PRIVATE_KEYS.length; i++) {
        ENTITIES.push(entity_1.Entity.from_hex(exports._PRIVATE_KEYS[i]));
        IDENTITIES.push(new identity_1.Identity(ENTITIES[i].public_key()));
        ADDRESSES.push(new address_1.Address(ENTITIES[i]));
    }
    return [ENTITIES, IDENTITIES, ADDRESSES];
})(), 3), _a[0]), exports.IDENTITIES = _a[1], exports.ADDRESSES = _a[2];
//TODO remove functions names preceeding underscore.
function calc_digest(address_raw) {
    var hash_func = crypto_1.createHash('sha256');
    hash_func.update(address_raw);
    return hash_func.digest();
}
exports.calc_digest = calc_digest;
function calc_address(address_raw) {
    var digest = calc_digest(address_raw);
    var bytes = calc_digest(digest);
    var checksum = bytes.slice(0, 4);
    var full = Buffer.concat([digest, checksum]);
    var display = bs58.encode(full);
    return [digest, display];
}
exports.calc_address = calc_address;
function dummy_address() {
    var digest = calc_digest(Buffer.from('rand'));
    // const bs58_encoded = bs58.encode(digest)
    return new address_1.Address(Buffer.from(digest));
}
exports.dummy_address = dummy_address;
function equals(x, y) {
    if (x === y)
        return true;
    for (var p in x) {
        if (!x.hasOwnProperty(p))
            continue;
        if (!y.hasOwnProperty(p))
            return false;
        if (x[p] === y[p])
            continue;
        if (typeof x[p] === 'string' && x[p].length > 150)
            continue;
        if (typeof (x[p]) !== 'object')
            return false;
        if (!equals(x[p], y[p]))
            return false;
    }
    for (p in y) {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p))
            return false;
    }
    return true;
}
exports.equals = equals;
//# sourceMappingURL=helpers.js.map