"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
function calc_digest(address_raw) {
    var hash_func = crypto_1.createHash('sha256');
    hash_func.update(address_raw);
    return hash_func.digest();
}
exports.calc_digest = calc_digest;
//# sourceMappingURL=crypto.js.map