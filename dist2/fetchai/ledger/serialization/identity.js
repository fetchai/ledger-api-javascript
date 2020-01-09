"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var identity_1 = require("../crypto/identity");
var errors_1 = require("../errors");
var UNCOMPRESSED_SCEP256K1_PUBLIC_KEY = 0x04;
var UNCOMPRESSED_SCEP256K1_PUBLIC_KEY_LEN = 64;
var encode_identity = function (buffer, value) {
    if (value instanceof identity_1.Identity) {
        return Buffer.concat([buffer, Buffer.from([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]), value.public_key()]);
    }
    else {
        return Buffer.concat([buffer, Buffer.from([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]), value]);
    }
};
exports.encode_identity = encode_identity;
var decode_identity = function (buffer) {
    var header = buffer.slice(0, 1);
    var hex = parseInt(header.toString('hex'));
    if (hex !== UNCOMPRESSED_SCEP256K1_PUBLIC_KEY) {
        throw new errors_1.ValidationError('Unsupported identity type');
    }
    // we add one to this value because our key is longer by one, and
    // one because we start our slice ignoring the first.
    var len = UNCOMPRESSED_SCEP256K1_PUBLIC_KEY_LEN + 1;
    var ret = buffer.slice(1, len);
    buffer = buffer.slice(len);
    return [new identity_1.Identity(ret), buffer];
};
exports.decode_identity = decode_identity;
//# sourceMappingURL=identity.js.map