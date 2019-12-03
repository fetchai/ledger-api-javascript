import {BitVector} from './bitvector'
import {Address} from './crypto/address'
import {Identity} from './crypto/identity'
import {BN} from 'bn.js'
import assert from 'assert'
import {randomBytes} from 'crypto'

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
            this._signers[signer] = '' // will be replaced with a signature in the future
        }
    }
}
