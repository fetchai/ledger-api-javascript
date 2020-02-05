/// <reference types="node" />
/**
 * An identity is the public half of a private / public key pair.
 *
 * @public
 * @class
 */
export declare class Identity {
    pub_key: Buffer;
    /**
     * @param  {Object|Buffer} pub_key Identity object or Buffer
     * @throws {ValidationError} ValidationError if invalid public key or unable to load public key from input
     */
    constructor(pub_key: Buffer | Uint8Array | Identity);
    static from_base64(private_key_base64: string): Identity;
    static from_hex(public_key_hex: string): Identity;
    /**
     * Get public key with 04 prefix.
     */
    prefixed_public_key(): Buffer;
    /**
     * Get base64 encoded public key.
     */
    public_key_base64(): string;
    /**
     * Get the public key in bytes(Buffer).
     */
    public_key(): Buffer;
    /**
     * Get the public key hex.
     */
    public_key_hex(): string;
    /**
     * Get the public key in bytes(Buffer).
     */
    public_key_bytes(): Buffer;
    /**
     * Verify the signature.
     * @param  {String} message Message which wants to verify
     * @param  {String} signature Signature
     * @returns signature is valid or not
     */
    verify(message: Buffer, signature: Buffer): boolean;
}
