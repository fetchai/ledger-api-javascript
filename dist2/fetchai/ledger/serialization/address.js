"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var address_1 = require("../../../fetchai/ledger/crypto/address");
var BYTE_LENGTH = 32;
var encode_address = function (buffer, address) {
    if (address instanceof address_1.Address) {
        return Buffer.concat([buffer, Buffer.from(address.toHex(), 'hex')]);
    }
    else {
        // address is in hex format
        return Buffer.concat([buffer, Buffer.from(address, 'hex')]);
    }
};
exports.encode_address = encode_address;
var decode_address = function (buffer) {
    var address_raw = buffer.slice(0, BYTE_LENGTH);
    buffer = buffer.slice(BYTE_LENGTH);
    return [new address_1.Address(address_raw), buffer];
};
exports.decode_address = decode_address;
//# sourceMappingURL=address.js.map