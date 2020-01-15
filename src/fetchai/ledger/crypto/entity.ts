import {randomBytes, pbkdf2, SignPrivateKeyInput, KeyLike} from 'crypto'
import * as secp256k1 from 'secp256k1'
import {RunTimeError, ValidationError} from '../errors'
import {Identity} from './identity'
import fs from 'fs'
import * as aesjs from 'aes-js'
import {promisify} from 'util'
import assert from 'assert'

interface SerializedPrivateKey {
     readonly key_length: number,
      readonly      init_vector: string,
       readonly     password_salt: string,
       readonly     privateKey: string
}

/**
 * An entity is a full private/public key pair.
 *
 * @public
 * @class
 */
export class Entity extends Identity {
	public pubKey: Buffer
	public privKey: Buffer

    /**
     * @param  {Buffer} private_key_bytes construct or generate the private key if one is not specified.
     * @throws {ValidationError} ValidationError if unable to load private key from input.
     */
    constructor(private_key_bytes?: Buffer) {
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
    private_key() : Buffer {
        return this.privKey
    }

    /**
     * Get the private key hex.
     */
    private_key_hex() : string {
        return this.privKey.toString('hex')
    }

    /**
     * Get the public key hex.
     */
    public_key_hex() : string {
        return this.pubKey.toString('hex')
    }

    /**
     * sign the message.
     * @param  {String} extMsgHash Message hash
     * @returns signature obj
     */
    sign(extMsgHash: Buffer) : any {
        return secp256k1.sign(extMsgHash, this.privKey)
    }

    /**
     * Get the signature hex
     * @param  {Object} sigObj signature obj
     */
    signature_hex(sigObj: any) : string {
        return sigObj.signature.toString('hex')
    }

    static from_base64(private_key_base64: string) : Entity {
        const private_key_bytes = Buffer.from(private_key_base64, 'base64')
        return new Entity(private_key_bytes)
    }

    static from_hex(private_key_hex: string) : Entity {
        const private_key_bytes = Buffer.from(private_key_hex, 'hex')
        return new Entity(private_key_bytes)
    }

    static async loads(s: string, password: string) : Promise<Entity> {
        let obj = JSON.parse(s)
        return await Entity.from_json_object(obj, password)
    }

    static async load(fp: string, password: string) : Promise<Entity> {
        if (!Entity.strong_password(password)) {
            throw new ValidationError(
                'Please enter strong password of 14 length which contains number(0-9), alphabetic character[(a-z), (A-Z)] and one special character.'
            )
        }
        const x = fs.readFileSync(fp, 'utf8')
        let obj = JSON.parse(x)
        return await Entity.from_json_object(obj, password)
    }

    async prompt_dump(fp: string, password: string):  Promise<void>  {
        // let password = readline.question('Please enter password ')
        if (!Entity.strong_password(password)) {
            throw new ValidationError(
                'Please enter strong password of 14 length which contains number(0-9), alphabetic character[(a-z), (A-Z)] and one special character.'
            )
        }

        return await this.dump(fp, password)
    }

    async dumps(password: string) : Promise<String> {
        return JSON.stringify(this.to_json_object(password))
    }

    async dump(fp: string, password: string) : Promise<void> {
        const json_object = await this.to_json_object(password)
        fs.writeFileSync(fp, JSON.stringify(json_object))
    }

    async to_json_object(password: string) : Promise<SerializedPrivateKey> {
        debugger;
        return this.encrypt(password, this.privKey)
    }


    static async from_json_object(obj: SerializedPrivateKey, password: string) : Promise<Entity> {
        const private_key = await Entity.decrypt(
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
    async encrypt(password: string, data: Buffer | Uint8Array) : Promise<SerializedPrivateKey> {
        const DIGEST_BYTE_LENGTH = 32
        // Generate hash from password
        const salt = randomBytes(16)

        const promisified_pbkdf2 = promisify(pbkdf2)
        let hashed_pass
        try {
            hashed_pass = await promisified_pbkdf2(password, salt, 2000000, 32, 'sha256')
        } catch (err) {
            throw new RunTimeError('Encryption failed')
        }
        // Random initialization vector
        const iv = randomBytes(16)

        // Encrypt data using AES
        // https://www.npmjs.com/package/aes-js#cbc---cipher-block-chaining-recommended
        const aes = new aesjs.ModeOfOperation.cbc(hashed_pass, iv)

        assert(data.length === DIGEST_BYTE_LENGTH)

        let encrypted = Buffer.alloc(0)
        while (data.length) {
            encrypted = Buffer.concat([
                encrypted,
                Buffer.from(aes.encrypt(data.slice(0, 16)))
            ])
            data = data.slice(16)
        }

        return {
            key_length: DIGEST_BYTE_LENGTH,
            init_vector: iv.toString('base64'),
            password_salt: salt.toString('base64'),
            privateKey: encrypted.toString('base64'),
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
    static async decrypt(password: string, salt: Buffer, data: Buffer, n: number, iv: Buffer) : Promise<Buffer> {
        const promisified_pbkdf2 = promisify(pbkdf2)

        let hashed_pass
        try {
            hashed_pass = await promisified_pbkdf2(password, salt, 2000000, 32, 'sha256')
        } catch (err) {
            throw new RunTimeError('Decryption failed')
        }

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
    static strong_password(password: string) : boolean {
        if (password.length < 14) {
            return false
        }

        if (password.match('[a-z]+') === null) {
            return false
        }

        if (password.match('[A-Z]+') === null) {
            return false
        }

        if (password.match('[0-9]+') === null) {
            return false
        }

        if (password.match('[@_!#$%^&*()<>?/\\|}{~:]') === null) {
            return false
        }
        return true
    }
}


