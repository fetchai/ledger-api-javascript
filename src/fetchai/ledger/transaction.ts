import {BitVector} from './bitvector'
import {Address} from './crypto/address'
import {Identity} from './crypto/identity'
import {BN} from 'bn.js'
import {calc_digest, logger} from './utils'
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
import {Entity} from "./crypto";

type PayloadTuple = [Transaction, Buffer]

interface TransferItem {
     readonly address: string,
     readonly amount: BN
}

interface SignatureData {
     readonly signature: NodeJS.ArrayBufferView,
     readonly verified: boolean,
}

interface Metadata {
     synergetic_data_submission: boolean
}

/**
 * This class for Transactions related operations
 *
 * @public
 * @class
 */
export class Transaction {
    //todo
	public _from: string | Address = '';
	public _transfers: Array<TransferItem> = [];
	public _valid_from: BN = new BN(0);
	public _valid_until: BN = new BN(0);
	public _charge_rate: BN = new BN(0);
	public _charge_limit: BN = new BN(0);
	public _contract_address: string | Address= '';
	public _counter: BN = new BN(randomBytes(8));
	public _chain_code: string = '';
	public _shard_mask: BitVector  = new BitVector()
	public _action: string = '';
	public _metadata: any = {
            synergetic_data_submission: false
        }
	public _data: string = '';
	//public _signers: Map<string, string | SignatureData>;
    public _signers: any = new Map;

    // Get and Set from_address param
    from_address(address: AddressLike | null = null) : Address | string {
        if (address !== null) {
            this._from = new Address(address)
            return this._from
        }
        return this._from
    }

    transfers() : Array<TransferItem> {
        return this._transfers
    }

    // Get and Set valid_from param
    valid_from(block_number: BN | null = null) : BN {
        if (block_number) {
            assert(BN.isBN(block_number))
            this._valid_from = block_number
            return this._valid_from
        }
        return this._valid_from
    }

    // Get and Set valid_until param
    valid_until(block_number: BN | null = null) : BN {
        if (block_number) {
            assert(BN.isBN(block_number))
            this._valid_until = block_number
            return this._valid_until
        }
        return this._valid_until
    }

    // Get and Set charge_rate param
    charge_rate(charge: BN | null = null) : BN {
        if (charge) {
            assert(BN.isBN(charge))
            this._charge_rate = charge
            return this._charge_rate
        }
        return this._charge_rate
    }

    // Get and Set charge_limit param
    charge_limit(limit: BN | null = null) : BN {
        if (limit) {
            assert(BN.isBN(limit))
            this._charge_limit = limit
            return this._charge_limit
        }
        return this._charge_limit
    }

    // Get contract_address param
    contract_address() : string | Address {
        return this._contract_address
    }

    // getter and setter
    counter(counter: BN | null = null) : BN {
        if (counter === null) return this._counter
        assert(BN.isBN(counter))
        this._counter = counter
    }

    // Get chain_code param
    chain_code() : string {
        return this._chain_code
    }

    // Get and Set action param
    action(action : string | null = null) : string {
        if (action !== null) {
            this._action = action
        }
        return this._action
    }

    // Get shard_mask param
    shard_mask() : BitVector {
        return this._shard_mask
    }

    // Get and Set data param. Note: data in bytes
    data(data: any = null) : string {
        if (data !== null) {
            this._data = data
        }
        return this._data
    }

    compare(other: Transaction) : boolean {
        const x = this.payload().toString('hex')
        const y = other.payload().toString('hex')
        return x === y
    }

    payload(): Buffer {
        const buffer = encode_payload(this)
        // so to get running lets just do like hex or whatever since only used to compare but then actually get same as python and delete this comment at later stage.
        return buffer
    }

    static from_payload(payload: Buffer) : PayloadTuple {
        let [tx, buffer] = decode_payload(payload)

        return [tx, buffer]
    }

    static from_encoded(encoded_transaction: Buffer) : Transaction | null {
        const [success, tx] = decode_transaction(encoded_transaction)
        if (success) {
            return tx
        } else {
            return null
        }
    }

    // Get signers param.
    signers() : any {
        return this._signers
    }

    add_transfer(address: AddressLike, amount: BN) : void {
        assert(amount.gtn(new BN(0)))
        // if it is an identity we turn it into an address
        address = new Address(address)
        this._transfers.push({address: address.toHex(), amount: new BN(amount)})
    }

    target_contract(address: AddressLike , mask: BitVectorLike) {
        this._contract_address = new Address(address)
        this._shard_mask = new BitVector(mask)
        this._chain_code = ''
    }

    target_chain_code(chain_code_id: string | number, mask: number | BitVector) {
        this._contract_address = ''
        this._shard_mask = new BitVector(mask)
        this._chain_code = String(chain_code_id)
    }

    // Get and Set synergetic_data_submission param
    synergetic_data_submission(is_submission: boolean = false) : boolean {
        if (is_submission) {
            this._metadata['synergetic_data_submission'] = is_submission
            return this._metadata['synergetic_data_submission']
        }
        return this._metadata['synergetic_data_submission']
    }

    add_signer(signer: string) : void {
        if (!(this._signers.has(signer))) {
            this._signers.set(signer, '') // will be replaced with a signature in the future
        }
    }

    sign(signer: Entity) : void {
        if (this._signers.has(signer.public_key_hex())) {
            const payload_digest = calc_digest(this.payload())
            const sign_obj = signer.sign(payload_digest)
            this._signers.set(signer.public_key_hex(), {
                signature: sign_obj.signature,
                verified: signer.verify(payload_digest, sign_obj.signature)
            })
        }
    }
   //todo SHOULD METHOD REALLY RETURN VOID OR NULL
    merge_signatures(tx2: Transaction) : void | null {
        if (this.compare(tx2)) {

            const signers = tx2.signers()
            // for (let key in signers) {
            signers.forEach((v: any, k: string) => {
                if (signers.has(k) && typeof signers.get(k).signature !== 'undefined') {
                    const s = signers.get(k)
                    this._signers.set(k, s)
                }
            })

        } else {
            console.log('Attempting to combine transactions with different payloads')
            logger.info('Attempting to combine transactions with different payloads')
            return null
        }
    }

    encode_partial() : Buffer {

        let buffer = encode_payload(this)
        let num_signed = 0

        this._signers.forEach((v: any) => {
            if (typeof v.signature !== 'undefined') num_signed++
        })

        buffer = integer.encode_integer(buffer, new BN(num_signed))
        this._signers.forEach((v: any, k: string) => {
            if (typeof v.signature !== 'undefined') {
                let buff = Buffer.from(k, 'hex')
                let test = new Identity(buff)
                buffer = encode_identity(buffer, test)
                buffer = encode_bytearray(buffer, v.signature)
            }
        })
        return buffer
    }

    static decode_partial(buffer: Buffer) : Transaction {
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

            tx._signers.set(signer.public_key_hex(), {
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
}
