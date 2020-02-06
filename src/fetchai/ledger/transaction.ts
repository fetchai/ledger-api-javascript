import {BitVector} from './bitvector'
import {Address} from './crypto/address'
import {Identity} from './crypto/identity'
import {BN} from 'bn.js'
import {calc_digest} from './utils'
import assert from 'assert'
import * as identity from './serialization/identity'
import * as bytearray from './serialization/bytearray'
import {
    decode_integer,
    decode_payload,
    decode_transaction,
    encode_bytearray,
    encode_identity,
    encode_payload
} from './serialization'
import * as integer from './serialization/integer'
import {RunTimeError} from './errors'
import {randomBytes} from 'crypto'
import {Entity} from './crypto'

type PayloadTuple = [Transaction, Buffer]

interface TransferItem {
    readonly address: string;
    readonly amount: BN;
}

interface SignatureData {
    readonly signature: NodeJS.ArrayBufferView;
    readonly verified: boolean;
}

interface SignatureItem {
    identity: Identity;
    signature: NodeJS.ArrayBufferView | null;
}


/**
 * This class for Transactions related operations
 *
 * @public
 * @class
 */
export class Transaction {
    public _from: string | Address = '';
    public _transfers: Array<TransferItem> = [];
    public _valid_from: BN = new BN(0);
    public _valid_until: BN = new BN(0);
    public _charge_rate: BN = new BN(0);
    public _charge_limit: BN = new BN(0);
    public _contract_address: string | Address = '';
    public _counter: BN = new BN(randomBytes(8));
    public _chain_code = '';
    public _shard_mask: BitVector = new BitVector();
    public _action = '';
    public _data = '';
    public _signatures: any = Array<SignatureItem>;

    static from_payload(payload: Buffer): PayloadTuple {
        const [tx, buffer] = decode_payload(payload)

        return [tx, buffer]
    }

    static from_encoded(encoded_transaction: Buffer): Transaction | null {
        const [success, tx] = decode_transaction(encoded_transaction)
        if (success) {
            return tx
        } else {
            return null
        }
    }

    static decode_partial(buffer: Buffer): Transaction {
        let tx;
        [tx, buffer] = decode_payload(buffer)
        let num_sigs;
        [num_sigs, buffer] = decode_integer(buffer)
        const payload_digest = calc_digest(tx.payload())

        for (let i = 0; i < num_sigs.toNumber(); i++) {
            let signer;
            [signer, buffer] = identity.decode_identity(buffer)
            let signature;

            [signature, buffer] = bytearray.decode_bytearray(buffer)
            signature = Buffer.from(signature)

            tx._signatures.set(signer.public_key_hex(), {
                'signature': signature,
                'verified': signer.verify(payload_digest, signature)
            })
        }

        tx.signers().forEach((v: any) => {
            if (v.verified && !v.verified) {
                throw new RunTimeError('Not all keys were able to sign successfully')
            }
        })
        return tx
    }

    // Get and Set from_address param
    from_address(address: AddressLike | null = null): Address | string {
        if (address !== null) {
            this._from = new Address(address)
            return
        }
    }

    get transfers(): Array<TransferItem> {
        return this._transfers;
    }

    // Get and Set valid_from param
    valid_from(block_number: BN | null = null): BN {
        if (block_number) {
            assert(BN.isBN(block_number))
            this._valid_from = block_number
            return this._valid_from
        }
        return this._valid_from
    }

    // Get and Set valid_until param
    valid_until(block_number: BN | null = null): BN {
        if (block_number) {
            assert(BN.isBN(block_number))
            this._valid_until = block_number
            return this._valid_until
        }
        return this._valid_until
    }

    // Get and Set charge_rate param
    charge_rate(charge: BN | null = null): BN {
        if (charge) {
            assert(BN.isBN(charge))
            this._charge_rate = charge
            return this._charge_rate
        }
        return this._charge_rate
    }

    // Get and Set charge_limit param
    charge_limit(limit: BN | null = null): BN {
        if (limit) {
            assert(BN.isBN(limit))
            this._charge_limit = limit
            return this._charge_limit
        }
        return this._charge_limit
    }

    // Get contract_address param
    contract_address(): string | Address {
        return this._contract_address
    }

    // getter and setter
    counter(counter: BN | null = null): BN {
        if (counter === null) return this._counter
        assert(BN.isBN(counter))
        this._counter = counter
    }

    // Get chain_code param
    chain_code(): string {
        return this._chain_code
    }

    // Get and Set action param
    action(action: string | null = null): string {
        if (action !== null) {
            this._action = action
        }
        return this._action
    }

    // Get shard_mask param
    shard_mask(): BitVector {
        return this._shard_mask
    }

    // Get and Set data param. Note: data in bytes
    data(data: any = null): string {
        if (data !== null) {
            this._data = data
        }
        return this._data
    }
    // compare(other: Transaction): boolean {
    //     const x = this.payload().toString('hex')
    //     const y = other.payload().toString('hex')
    //     return x === y
    // }

    encode_payload(): Buffer {
        return encode_payload(this)
    }



    add_transfer(address: AddressLike, amount: BN): void {
        assert(amount.gtn(new BN(0)))
        // if it is an identity we turn it into an address
        address = new Address(address)
        this._transfers.push({address: address.toHex(), amount: new BN(amount)})
    }

    target_contract(address: AddressLike, mask: BitVectorLike): void {
        this._contract_address = new Address(address)
        this._shard_mask = new BitVector(mask)
        this._chain_code = ''
    }

    target_chain_code(chain_code_id: string | number, mask: number | BitVector): void {
        this._contract_address = ''
        this._shard_mask = new BitVector(mask)
        this._chain_code = String(chain_code_id)
    }

    // Get and Set synergetic_data_submission param
    synergetic_data_submission(is_submission = false): boolean {
        if (is_submission) {
            this._metadata['synergetic_data_submission'] = is_submission
            return this._metadata['synergetic_data_submission']
        }
        return this._metadata['synergetic_data_submission']
    }

    pending_signers(){
       return this._signatures.filter((el) => el.signature == null).map(el => el.identity)
    }

    present_signers() {
        return this._signatures.filter((el) => el.signature !== null).map(el => el.identity)
    }

        // Get signers param.
    signers(): Array<Identity> {
       return this._signatures.map(el => el.identity)
    }

    signatures(): Array<SignatureItem> {
        return this._signatures
    }

    hasSigner(signer: Identity): Boolean {
         return this._signatures.some(el => el.identity.public_key_hex() === signer.public_key_hex())
    }

    // left string to reduce size of refactor required
    add_signer(signer: string | Identity): void {

        // this is a difference with python where initally we were storing as different datastrcture
        if(typeof signer === "string") {
            signer = Identity.from_hex(signer)
        }

        if (!this.hasSigner(signer as Identity)) {
           this._signatures.push({identity: signer, signature: null})
        }
    }

    add_signature(identity: Identity, signature: NodeJS.ArrayBufferView){
         if(!this.hasSigner(identity){
             throw new RunTimeError('Identity is not currently part')
         }

         this._signatures = this._signatures.forEach(el => {
             if(el.identity.public_key_hex() === identity.public_key_hex()){
                 el.signature = signature
             }})
    }

    sign(signer: Entity): void {
        if (this.hasSigner(signer)) {
            const payload_digest = calc_digest(this.encode_payload())
            const sign_obj = signer.sign(payload_digest)
            this.add_signature(signer, sign_obj.signature)
        }
    }


    compare(other: Transaction): boolean {
        const x = this.payload().toString('hex')
        const y = other.payload().toString('hex')
        return x === y
    }

    //todo SHOULD METHOD REALLY RETURN VOID OR NULL
    merge_signatures(tx2: Transaction): Boolean {

        if (this.compare(tx2)) {
            console.log('Attempting to combine transactions with different payloads')
            return false
        }

        let success_flag = false

        let payload = this.encode_payload()
        let pending_signers = this.pending_signers();

        tx2.signatures().forEach(el => {

            if(!this.hasSigner( el.identity)) continue;
            if(el.signature == null) continue;
            if(!el.identity.verify(calc_digest(payload), el.signature)){
                success_flag = false
                    continue
           }

           this._signatures =

        })

        signers.forEach((v: any, k: string) => {
                if (signers.has(k) && typeof signers.get(k).signature !== 'undefined') {
                    const s = signers.get(k)
                    this.signatures.set(k, s)
                }
            })


    }

    encode_partial(): Buffer {
        return encode_payload(this)
    }
}
