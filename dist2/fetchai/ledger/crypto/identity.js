"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var secp256k1 = __importStar(require("secp256k1"));
var errors_1 = require("../errors");
/**
 * An identity is the public half of a private / public key pair.
 *
 * @public
 * @class
 */
var Identity = /** @class */ (function () {
    /**
     * @param  {Object|Buffer} pub_key Identity object or Buffer
     * @throws {ValidationError} ValidationError if invalid public key or unable to load public key from input
     */
    function Identity(pub_key) {
        if (pub_key instanceof Identity) {
            this.pub_key = pub_key.public_key();
        }
        else if (pub_key instanceof Buffer) {
            this.pub_key = pub_key;
            if (!secp256k1.publicKeyVerify(this.prefixed_public_key())) {
                throw new errors_1.ValidationError('invalid public key');
            }
        }
        else {
            throw new errors_1.ValidationError('Failed');
        }
    }
    /**
     * Get public key with 04 prefix.
     */
    Identity.prototype.prefixed_public_key = function () {
        return Buffer.concat([Buffer.from('04', 'hex'), this.pub_key]);
    };
    /**
     * Get base64 encoded public key.
     */
    Identity.prototype.public_key_base64 = function () {
        return this.pub_key.toString('base64');
    };
    /**
     * Get the public key in bytes(Buffer).
     */
    Identity.prototype.public_key = function () {
        return this.pub_key;
    };
    /**
     * Get the public key hex.
     */
    Identity.prototype.public_key_hex = function () {
        return this.pub_key.toString('hex');
    };
    /**
     * Get the public key in bytes(Buffer).
     */
    Identity.prototype.public_key_bytes = function () {
        return this.pub_key;
    };
    /**
     * Verify the signature.
     * @param  {String} message Message which wants to verify
     * @param  {String} signature Signature
     * @returns signature is valid or not
     */
    Identity.prototype.verify = function (message, signature) {
        return secp256k1.verify(message, signature, this.prefixed_public_key());
    };
    Identity.from_base64 = function (private_key_base64) {
        var private_key_bytes = Buffer.from(private_key_base64, 'base64');
        return new Identity(private_key_bytes);
    };
    Identity.from_hex = function (public_key_hex) {
        var public_key_bytes = Buffer.from(public_key_hex, 'hex');
        return new Identity(public_key_bytes);
    };
    return Identity;
}());
exports.Identity = Identity;
//# sourceMappingURL=identity.js.map