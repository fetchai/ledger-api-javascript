import {BitVector} from './bitvector'
import {Address} from './crypto/address'
import {Identity} from './crypto/identity'
import {BN} from 'bn.js'
import {logger} from './utils'
import assert from 'assert'
import {createHash, randomBytes} from 'crypto'
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


function calc_digest(address_raw) {
    const hash_func = createHash('sha256')
    hash_func.update(address_raw)
    const digest = hash_func.digest()
    return digest
}

/**
 * This class for Transactions related operations
 *
 * @public
 * @class
 */
export class Transaction {
    constructor() {
        this._from = ''
        this._transfers = []
        this._valid_from = new BN(0)
        this._valid_until = new BN(0)
        this._charge_rate = new BN(0)
        this._charge_limit = new BN(0)
        this._contract_address = ''
        this._counter = new BN(Buffer.from('EE86419F0178ACAE', 'hex'))
        this._chain_code = ''
        this._shard_mask = new BitVector() // BitVector class instance
        this._action = ''
        this._metadata = {
            synergetic_data_submission: false
        }
        this._data = ''
        this._signers = new Map()
    }

    // Get and Set from_address param
    from_address(address = '') {
        if (address) {
            this._from = new Address(address)
            return this._from
        }
        return this._from
    }

    transfers() {
        return this._transfers
    }

    // Get and Set valid_from param
    valid_from(block_number = null) {
        if (block_number) {
            assert(BN.isBN(block_number))
            this._valid_from = block_number
            return this._valid_from
        }
        return this._valid_from
    }

    // Get and Set valid_until param
    valid_until(block_number = null) {
        if (block_number) {
            assert(BN.isBN(block_number))
            this._valid_until = block_number
            return this._valid_until
        }
        return this._valid_until
    }

    // Get and Set charge_rate param
    charge_rate(charge = null) {
        if (charge) {
            assert(BN.isBN(charge))
            this._charge_rate = charge
            return this._charge_rate
        }
        return this._charge_rate
    }

    // Get and Set charge_limit param
    charge_limit(limit = null) {
        if (limit) {
            assert(BN.isBN(limit))
            this._charge_limit = limit
            return this._charge_limit
        }
        return this._charge_limit
    }

    // Get contract_address param
    contract_address() {
        return this._contract_address
    }

    // getter and setter
    counter(counter = null) {
        if (counter === null) return this._counter
        assert(BN.isBN(counter))
        this._counter = counter

    }

    // Get chain_code param
    chain_code() {
        return this._chain_code
    }

    // Get and Set action param
    action(action = '') {
        if (action) {
            this._action = String(action)
            return this._action
        }
        return this._action
    }

    // Get shard_mask param
    shard_mask() {
        return this._shard_mask
    }

    // Get and Set data param. Note: data in bytes
    data(data = '') {
        if (data) {
            this._data = data
            return this._data
        }
        return this._data
    }

    compare(other) {
        const x = this.payload().toString('hex')
        const y = other.payload().toString('hex')
        if (x !== y) {

            return false
        } else {
            return true
        }
    }

    payload() {
        const buffer = encode_payload(this)
        // so to get running lets just do like hex or whatever since only used to compare but then actually get same as python and delete this comment at later stage.
        return buffer
    }

    static from_payload(payload) {
        let [tx, buffer] = decode_payload(payload)

        return [tx, buffer]
    }

    static from_encoded(encoded_transaction) {
        const [success, tx] = decode_transaction(encoded_transaction)
        if (success) {
            return tx
        } else {
            return null
        }
    }

    // Get signers param.
    signers() {
        return this._signers
    }

    add_transfer(address, amount) {
        assert(BN.isBN(amount))
        assert(amount.gtn(new BN(0)))
        // if it is an identity we turn it into an address
        address = new Address(address)
        address = address.toHex()
        this._transfers.push({address: address, amount: new BN(amount)})
    }

    target_contract(address, mask) {
        this._contract_address = new Address(address)
        this._shard_mask = new BitVector(mask)
        this._chain_code = ''
    }

    target_chain_code(chain_code_id, mask) {
        this._contract_address = ''
        this._shard_mask = new BitVector(mask)
        this._chain_code = String(chain_code_id)
    }

    // Get and Set synergetic_data_submission param
    synergetic_data_submission(is_submission = false) {
        if (is_submission) {
            this._metadata['synergetic_data_submission'] = is_submission
            return this._metadata['synergetic_data_submission']
        }
        return this._metadata['synergetic_data_submission']
    }

    add_signer(signer) {
        if (!(this._signers.has(signer))) {
            this._signers.set(signer, '') // will be replaced with a signature in the future
        }
    }

    sign(signer) {
        if (this._signers.has(signer.public_key_hex())) {
            const payload_digest = calc_digest(this.payload())
            const sign_obj = signer.sign(payload_digest)
            this._signers.set(signer.public_key_hex(), {
                'signature': sign_obj.signature,
                'verified': signer.verify(payload_digest, sign_obj.signature)
            })
        }
    }

    merge_signatures(tx2) {
        if (this.compare(tx2)) {

            const signers = tx2.signers()
            // for (let key in signers) {
            signers.forEach((v, k, m) => {
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

    encode_partial() {

        let buffer = encode_payload(this)
        let num_signed = 0

        // Object.values(this._signers).filter(current => typeof current.signature !== "undefined").length
        this._signers.forEach((v, k, m) => {
            if (typeof v.signature !== 'undefined') num_signed++
        })

        console.log('num signed : ' + num_signed)
        //  num_signed = len([s for s in self.signers.values() if s
        buffer = integer.encode_integer(buffer, new BN(num_signed))

        // for (let key in this._signers) { //
        this._signers.forEach((v, k, m) => {
            if (typeof v.signature !== 'undefined') {
                let buff = Buffer.from(k, 'hex')
                let test = new Identity(buff)
                buffer = encode_identity(buffer, test)
                buffer = encode_bytearray(buffer, v.signature)
            }
        })
        // if (typeof this._signers[key].signature !== "undefined") {
        //     let buff = Buffer.from(key, 'hex');
        //     let test = new Identity(buff)
        //
        //     buffer = encode_identity(buffer, test)
        //     buffer = encode_bytearray(buffer, this._signers[key].signature)
        // }
        // }
        return buffer
    }

    static decode_partial(buffer) {
        let tx;
        [tx, buffer] = decode_payload(buffer)
        let num_sigs;
        [num_sigs, buffer] = decode_integer(buffer)
        // console.log("num sigs : " + num_sigs)
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

        tx.signers().forEach((v, k, m) => {

            if (v.verified && !v.verified) {
                throw new RunTimeError('Not all keys were able to sign successfully')
            }
        })
        // reinstate before submission
        // if not all(s['verified'] for s in tx.signers.values() if 'verified' in s):
        //     logging.warning("Some signatures failed to verify")
        return tx
    }
}
