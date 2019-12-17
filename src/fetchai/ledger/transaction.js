import {BitVector} from './bitvector'
import {Address} from './crypto/address'
import {Identity} from './crypto/identity'
import {BN} from 'bn.js'
import assert from 'assert'
import {randomBytes} from 'crypto'
import * as identity from "./serialization/identity";
import * as bytearray from "./serialization/bytearray";

/**
 * This class for Transactions related operations
 *
 * @public
 * @class
 */
export class Transaction {
    constructor() {
        this._from = ''
        this._transfers = {}
        this._valid_from = new BN(0)
        this._valid_until = new BN(0)
        this._charge_rate = new BN(0)
        this._charge_limit = new BN(0)
        this._contract_digest = ''
        this._contract_address = ''
        this._counter = new BN(randomBytes(8))
        this._chain_code = ''
        this._shard_mask = new BitVector() // BitVector class instance
        this._action = ''
        this._metadata = {
            synergetic_data_submission: false
        }
        this._data = ''
        this._signers = {}
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

    /**
     * NOT IN PYTHON
     */
    set_transfer(address, amount = new BN(0)) {
        assert(BN.isBN(amount))

        if (address instanceof Address) {
            address = address.toHex()
        }
        return this._transfers[address] = amount
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

    // Get contract_digest param
    contract_digest() {
        return this._contract_digest
    }

    // Get contract_address param
    contract_address() {
        return this._contract_address
    }

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

   compare(other){
        if(this.payload() !== other.payload()){
            return false;
        } else {
            return true;
        }
    }

    payload() {
        const buffer = transaction.encode_payload(this)
        // so to get running lets just do like hex or whatever since only used to compare but then actually get same as python and delete this comment at later stage.
        return buffer.toString('hex')
    }

   static from_payload(payload) {
       return decode_transaction(payload)
   }

   static from_encoded(encoded_transaction) {
       const [success, tx] = decode_transaction(encoded_transaction)
       if (success) {
           return tx;
       } else {
           return null;
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
        if (address instanceof Identity) {
            address = new Address(address)
        }

        if (address instanceof Address) {
            address = address.toHex()
        }

        let current = (this._transfers[address]) ? this._transfers[address] : new BN(0)
        this._transfers[address] = current.add(amount)
    }

    target_contract(digest, address, mask) {
        // python doesn't have any contract digest, maybe this is bug. delete this comment when verified.
        this._contract_digest = new Address(digest)
        this._contract_address = new Address(address)
        this._shard_mask = new BitVector(mask)
        this._chain_code = ''
    }

    target_chain_code(chain_code_id, mask) {
        this._contract_digest = ''
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
        if (!(signer in this._signers)) {
            this._signers[signer] = {} // will be replaced with a signature in the future
        }
    }

    sign(signer) {
        if(typeof this._signers[signer.public_key_hex()] !== "undefined"){
       const signature = signer.sign(self.payload)
        this._signers[Identity(signer)] = {
            'signature': signature,
            'verified': signer.verify(this.payload(), signature)
        }
    }

    merge_signatures(tx2){
        if(this.payload() !== tx2.payload()) {
            logger.info("Attempting to combine transactions with different payloads")
            return null
        }

        const signers = txs2.signers();
        for(key in signers){
            if(typeof signers.key !== "undefined" && typeof this._signers[key] === "undefined"){
                this._signers[key] = signers[key];
            }
        }
        }

    encode_partial() {
        let buffer = transaction.encode_payload(this)

           const num_signed =  Object.values(this._signers).reduce((accum, current) => (typeof current.signature !== "undefined")? current + 1 : current )
      //  num_signed = len([s for s in self.signers.values() if s
        buffer = integer.encode(buffer, num_signed)

            for(let key in this._signers){
                if(typeof this._signers[key].signature !== "undefined"){
                   let buff = Buffer.from(key, 'hex');
                   buffer = encode_identity(buffer, new Identity(buff))
                   buffer = encode_bytearray(buffer, this._signers[key].signature)
                }
            }
        return buffer;
    }
    static decode_partial(){
        const tx = decode_payload(buffer)

        const num_sigs = decode_integer(buffer)
let decoded, signer, signature;
            for(let i = 0; i < num_sigs; i++){
               [decoded, buffer] = identity.decode_identity(buffer)
                   [signer, buffer] = identity.decode(buffer)
                 [signature, buffer] = bytearray.decode_bytearray(buffer)
                tx.signers[signer] = {'signature': signature,
                                  'verified': signer.verify(tx.payload, signature)}
            }
        }

         const success = verified.every((verified) => verified === true)

        // reinstate before submission
        // if not all(s['verified'] for s in tx.signers.values() if 'verified' in s):
        //     logging.warning("Some signatures failed to verify")

        return tx
        }
}
