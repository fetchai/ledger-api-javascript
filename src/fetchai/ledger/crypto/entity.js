import { randomBytes, pbkdf2Sync } from 'crypto'
import * as secp256k1 from 'secp256k1'
import { ValidationError } from '../errors'
import { Identity } from './identity'
import fs from 'fs'
// import { logger } from '../utils'
import * as readline from 'readline-sync'
import * as aesjs from 'aes-js'

/**
 * An entity is a full private/public key pair.
 *
 * @public
 * @class
 */
export class Entity extends Identity {
    /**
     * @param  {Buffer} private_key_bytes construct or generate the private key if one is not specified.
     * @throws {ValidationError} ValidationError if unable to load private key from input.
     */
    constructor(private_key_bytes) {
        // construct or generate the private key if one is not specified
        if (private_key_bytes) {
            if (secp256k1.privateKeyVerify(private_key_bytes)) {
                const pubKey = Buffer.from(
                    secp256k1
                        .publicKeyCreate(private_key_bytes, false)
                        .toString('hex')
                        .substring(2),
                    'hex'
                )
                super(pubKey)
                this.pubKey = pubKey
                this.privKey = private_key_bytes
            } else {
                throw new ValidationError(
                    'Unable to load private key from input'
                )
            }
        } else {
            let privKey
            let pubKey
            do {
                privKey = randomBytes(32)
                pubKey = Buffer.from(
                    secp256k1
                        .publicKeyCreate(privKey, false)
                        .toString('hex')
                        .substring(2),
                    'hex'
                )
            } while (!secp256k1.privateKeyVerify(privKey))
            super(pubKey)
            this.pubKey = pubKey
            this.privKey = privKey
        }
    }

    /**
     * Get the private key.
     */
    private_key() {
        return this.privKey
    }

    /**
     * Get the private key hex.
     */
    private_key_hex() {
        return this.privKey.toString('hex')
    }

    /**
     * Get the public key hex.
     */
    public_key_hex() {
        return this.pubKey.toString('hex')
    }

    /**
     * sign the message.
     * @param  {String} extMsgHash Message hash
     * @returns signature obj
     */
    sign(extMsgHash) {
        return secp256k1.sign(extMsgHash, this.privKey)
    }

    /**
     * Get the signature hex
     * @param  {Object} sigObj signature obj
     */
    signature_hex(sigObj) {
        return sigObj.signature.toString('hex')
    }

    static from_base64(private_key_base64) {
        const private_key_bytes = Buffer.from(private_key_base64, 'base64')
        return new Entity(private_key_bytes)
    }

    static from_hex(private_key_hex) {
        const private_key_bytes = Buffer.from(private_key_hex, 'hex')
        return new Entity(private_key_bytes)
    }

    static prompt_load(fp) {
        // Prompt user to input data in console.
        let password = readline.question('Please enter password ')
        while (!Entity._strong_password(password)) {
            password = readline.question('Please enter password ')
        }
        return Entity.load(fp, password)
    }

    static loads(s) {
        const obj = JSON.parse(s)
        return Entity.from_base64(obj.privateKey)
    }

    static load(fp, password) {
        let obj = JSON.parse(fs.readFileSync(fp, 'utf8'))
        return Entity._from_json_object(obj, password)
    }

    prompt_dump(fp) {
        // Prompt user to input data in console.
        let password = readline.question('Please enter password ')
        while (!Entity._strong_password(password)) {
            password = readline.question('Please enter password ')
        }
        return this.dump(fp, password)
    }

    dumps(password) {
        return JSON.stringify(this._to_json_object(password))
    }

    dump(fp, password) {
        return JSON.stringify(this._to_json_object(password), fp)
    }

    _to_json_object(password) {
        let data = this._encrypt(password, this.privKey)
        return {
            key_length: data.key_length,
            init_vector: data.init_vector.toString('base64'),
            password_salt: data.password_salt.toString('base64'),
            privateKey: data.privateKey.toString('base64')
        }
    }

    static _from_json_object(obj, password) {
        const private_key = Entity._decrypt(
            password,
            Buffer.from(obj.password_salt, 'base64'),
            Buffer.from(obj.privateKey, 'base64'),
            obj.key_length,
            Buffer.from(obj.init_vector, 'base64')
        )
        return Entity.from_base64(private_key.toString('base64'))
    }

    /** Encryption schema for private keys
     * @param  {String} password plaintext password to use for encryption
     * @param  {Buffer} data plaintext data to encrypt
     * @returns encrypted data, length of original data, initialization vector for aes, password hashing salt
     * @ignore
     */
    _encrypt(password, data) {
        // Generate hash from password
        const salt = randomBytes(16)
        const hashed_pass = pbkdf2Sync(password, salt, 2000000, 32, 'sha256')

        // Random initialization vector
        const iv = randomBytes(16)

        // Encrypt data using AES
        // https://www.npmjs.com/package/aes-js#cbc---cipher-block-chaining-recommended
        const aes = new aesjs.ModeOfOperation.cbc(hashed_pass, iv)

        // Pad data to multiple of 16
        const n = data.length
        if (n % 16 != 0) {
            data += Buffer.alloc(0) * (16 - (n % 16))
        }

        let encrypted = Buffer.alloc(0)
        while (data.length) {
            encrypted = Buffer.concat([
                encrypted,
                Buffer.from(aes.encrypt(data.slice(0, 16)))
            ])
            data = data.slice(16)
        }
        return {
            key_length: n,
            init_vector: iv,
            password_salt: salt,
            privateKey: encrypted
        }
    }

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
    static _decrypt(password, salt, data, n, iv) {
        // Hash password
        const hashed_pass = pbkdf2Sync(password, salt, 2000000, 32, 'sha256')

        // Decrypt data, noting original length
        const aes = new aesjs.ModeOfOperation.cbc(hashed_pass, iv)

        let decrypted = Buffer.alloc(0)
        while (data.length) {
            decrypted = Buffer.concat([
                decrypted,
                Buffer.from(aes.decrypt(data.slice(0, 16)))
            ])
            data = data.slice(16)
        }
        const decrypted_data = decrypted.slice(0, n)

        // Return original data
        return decrypted_data
    }

    /**
     * Checks that a password is of sufficient length and contains all character classes
     * @param  {String} password plaintext password
     * @returns {Boolean} True if password is strong
     * @ignore
     */
    static _strong_password(password) {
        if (password.length < 14) {
            console.error(
                'Please enter a password at least 14 characters long'
            )
            return false
        }

        if (password.match('[a-z]+') === null) {
            console.error(
                'Password must contain at least one lower case character'
            )
            return false
        }

        if (password.match('[A-Z]+') === null) {
            console.error(
                'Password must contain at least one upper case character'
            )
            return false
        }

        if (password.match('[0-9]+') === null) {
            console.error('Password must contain at least one number')
            return false
        }

        if (password.match('[@_!#$%^&*()<>?/\\|}{~:]') === null) {
            console.error('Password must contain at least one symbol')
            return false
        }
        return true
    }
}
