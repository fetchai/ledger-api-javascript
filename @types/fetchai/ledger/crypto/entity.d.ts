/// <reference types="node" />
import { Identity } from './identity';
interface SerializedPrivateKey {
    readonly key_length: number;
    readonly init_vector: string;
    readonly password_salt: string;
    readonly privateKey: string;
}
/**
 * An entity is a full private/public key pair.
 *
 * @public
 * @class
 */
export declare class Entity extends Identity {
    pubKey: Buffer;
    privKey: Buffer;
    /**
     * @param  {Buffer} private_key_bytes construct or generate the private key if one is not specified.
     * @throws {ValidationError} ValidationError if unable to load private key from input.
     */
    constructor(private_key_bytes?: Buffer);
    static from_base64(private_key_base64: string): Entity;
    static from_hex(private_key_hex: string): Entity;
    static loads(s: string, password: string): Promise<Entity>;
    static load(fp: string, password: string): Promise<Entity>;
    static from_json_object(obj: SerializedPrivateKey, password: string): Promise<Entity>;
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
    static decrypt(password: string, salt: Buffer, data: Buffer, n: number, iv: Buffer): Promise<Buffer>;
    /**
     * Checks that a password is of sufficient length and contains all character classes
     * @param  {String} password plaintext password
     * @returns {Boolean} True if password is strong
     * @ignore
     */
    static strong_password(password: string): boolean;
    /**
     * Get the private key.
     */
    private_key(): Buffer;
    /**
     * Get the private key hex.
     */
    private_key_hex(): string;
    /**
     * Get the public key hex.
     */
    public_key_hex(): string;
    /**
     * sign the message.
     * @param  {String} extMsgHash Message hash
     * @returns signature obj
     */
    sign(extMsgHash: Buffer): any;
    /**
     * Get the signature hex
     * @param  {Object} sigObj signature obj
     */
    signature_hex(sigObj: any): string;
    prompt_dump(fp: string, password: string): Promise<void>;
    dumps(password: string): Promise<string>;
    dump(fp: string, password: string): Promise<void>;
    to_json_object(password: string): Promise<SerializedPrivateKey>;
    /** Encryption schema for private keys
     * @param  {String} password plaintext password to use for encryption
     * @param  {Buffer} data plaintext data to encrypt
     * @returns encrypted data, length of original data, initialization vector for aes, password hashing salt
     * @ignore
     */
    encrypt(password: string, data: Buffer | Uint8Array): Promise<SerializedPrivateKey>;
}
export {};
