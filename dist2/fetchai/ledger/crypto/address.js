"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bs58 = __importStar(require("bs58"));
var errors_1 = require("../errors");
var identity_1 = require("./identity");
var utils_1 = require("../utils");
var BYTE_LENGTH = 32;
var CHECKSUM_SIZE = 4;
var DISPLAY_BYTE_LENGTH = BYTE_LENGTH + CHECKSUM_SIZE;
/**
 * Address creation from identity, bytes and string.
 *
 * @public
 * @class
 */
var Address = /** @class */ (function () {
    /**
    * @param  {Object|Buffer|String} identity Address object or Buffer or String.
    * @throws {ValidationError} ValidationError on any failures.
    */
    function Address(identity) {
        if (typeof identity === 'string') {
            if (!Address.is_address(identity)) {
                throw new errors_1.ValidationError('Invalid Address');
            }
            this._address = bs58.decode(identity).slice(0, BYTE_LENGTH);
            this._display = identity;
        }
        else if (identity instanceof Address) {
            this._address = identity._address;
            this._display = identity._display;
        }
        else if (identity instanceof identity_1.Identity) {
            //TODO add unit tests for this block to address
            this._address = Address.digest(identity.public_key_bytes());
            this._display = this.calculate_display(this._address);
        }
        else if (identity instanceof Buffer) {
            // we don't seem to validate here for buffers ie check checksum is correct!!
            if (Buffer.byteLength(identity) !== BYTE_LENGTH) {
                throw new errors_1.ValidationError('Incorrect length of binary address');
            }
            this._address = identity;
            this._display = this.calculate_display(this._address);
        }
        else {
            throw new errors_1.ValidationError('Failed to build identity from input');
        }
    }
    /**
     * Check is string is a  valid address
     *
     * @param b58_address
     * @returns {boolean}
     */
    Address.is_address = function (b58_address) {
        if (typeof b58_address !== 'string')
            return false;
        var bytes = bs58.decode(b58_address);
        if (Buffer.byteLength(bytes) !== DISPLAY_BYTE_LENGTH) {
            return false;
        }
        // split the identity into address and checksum
        var address_raw = bytes.slice(0, BYTE_LENGTH);
        var checksum = bytes.slice(BYTE_LENGTH);
        //calculate the expected checksum
        var expected_checksum = Address.calculate_checksum(address_raw);
        // check the validity of the checksum.
        if (!Buffer.compare(checksum, expected_checksum)) {
            return false;
        }
        return true;
    };
    /**
     * Get address in string
     */
    Address.prototype.toString = function () {
        return this._display;
    };
    /**
     * Get address in bytes
     */
    Address.prototype.toBytes = function () {
        return this._address;
    };
    /**
     * //todo convert return type to boolean
     * Check equality of two address
     * @param  {bytes} other Address in bytes
     */
    Address.prototype.equals = function (other) {
        return Buffer.compare(this.toBytes(), other.toBytes());
    };
    /**
     * Get address in hex
     */
    Address.prototype.toHex = function () {
        return this._address.toString('hex');
    };
    Address.calculate_checksum = function (address_raw) {
        var digest = utils_1.calc_digest(address_raw);
        return digest.slice(0, BYTE_LENGTH);
    };
    Address.prototype.calculate_display = function (address_raw) {
        var digest = utils_1.calc_digest(address_raw);
        var bytes = digest.slice(0, CHECKSUM_SIZE);
        var full = Buffer.concat([address_raw, bytes]);
        return bs58.encode(full);
    };
    return Address;
}());
exports.Address = Address;
//# sourceMappingURL=address.js.map