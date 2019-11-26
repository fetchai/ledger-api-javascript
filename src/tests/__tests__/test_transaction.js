import {Transaction} from '../../fetchai/ledger/transaction'
import {BitVector} from '../../fetchai/ledger/bitvector'
import {Address} from '../../fetchai/ledger/crypto/address'
import {BN} from 'bn.js'
import {dummy_address} from '../utils/helpers'

describe(':Test Transaction', () => {
    it('Testing transaction constructor', () => {
        let txObj = new Transaction()
        expect(txObj._from).toBe('')
        expect(txObj._valid_from.cmp(new BN(0))).toBe(0)
        expect(txObj._valid_until.cmp(new BN(0))).toBe(0)
        expect(txObj._charge_rate.cmp(new BN(0))).toBe(0)
        expect(txObj._charge_limit.cmp(new BN(0))).toBe(0)
        expect(txObj._contract_digest).toBe('')
        expect(txObj._contract_address).toBe('')
        expect(txObj._chain_code).toBe('')
        expect(txObj._shard_mask._size).toBe(0)
        expect(txObj._shard_mask._byte_size).toBe(0)
        expect(txObj._action).toBe('')
        expect(txObj._metadata.synergetic_data_submission).toBe(false)
        expect(txObj._data).toBe('')
        expect(Object.keys(txObj._transfers).length).toEqual(0)
    })

    it('Test from_address', () => {
        let txObj = new Transaction()
        const randomAddr = dummy_address()
        const address = new Address(randomAddr)
        expect(txObj.from_address(randomAddr)).toEqual(address)
    })

    it('Test transfers', () => {
        let txObj = new Transaction()
        expect(Object.keys(txObj.transfers()).length).toEqual(0)
    })

    it('Test add_transfer with amount', () => {
        let txObj = new Transaction()
        let address = dummy_address()
        txObj.set_transfer(address, new BN(40))
        txObj.add_transfer(address, new BN(10))
        expect(txObj._transfers[address.toHex()].toNumber()).toBe(40 + 10)
    })

    it('Test valid_from', () => {
        let txObj = new Transaction()
        expect(txObj.valid_from(new BN(12)).cmp(new BN(12))).toBe(0)
        expect(txObj._valid_from).toEqual(new BN(12))
    })

    it('Test valid_until', () => {
        let txObj = new Transaction()
        expect(txObj.valid_until(new BN(14)).cmp(new BN(14))).toBe(0)
        expect(txObj._valid_until).toEqual(new BN(14))
    })

    it('Test charge_rate', () => {
        let txObj = new Transaction()
        expect(txObj.charge_rate(new BN(14)).cmp(new BN(14))).toBe(0)
    })

    it('Test charge_limit', () => {
        let txObj = new Transaction()
        expect(txObj.charge_limit(new BN(14)).cmp(new BN(14))).toBe(0)
        expect(txObj._charge_limit).toEqual(new BN(14))
    })

    it('Test contract_digest', () => {
        let txObj = new Transaction()
        expect(txObj.contract_digest()).toBe(txObj._contract_digest)
    })

    it('Test contract_address', () => {
        let txObj = new Transaction()
        expect(txObj.contract_address()).toBe(txObj._contract_address)
    })

    it('Test chain_code', () => {
        let txObj = new Transaction()
        expect(txObj.chain_code()).toBe(txObj._chain_code)
    })

    it('Test action', () => {
        let txObj = new Transaction()
        expect(txObj.action('takeAction')).toBe('takeAction')
        expect(txObj._action).toBe('takeAction')
    })

    it('Test shard_mask', () => {
        let txObj = new Transaction()
        expect(txObj.shard_mask()).toBe(txObj._shard_mask)
    })

    it('Test data', () => {
        let txObj = new Transaction()
        expect(txObj.data('some data to set')).toBe('some data to set')
        expect(txObj._data).toBe('some data to set')
    })

    // signers() tested below
    it('Test add_transfer', () => {
        let txObj = new Transaction()
        let address = dummy_address()
        txObj.set_transfer(address)
        txObj.add_transfer(address, new BN(10))
        const hex = address.toHex()
        expect(txObj._transfers[hex].toNumber()).toBe(10)
    })

    it('Test target_contract', () => {
        let txObj = new Transaction()
        const digest = dummy_address()
        const address = dummy_address()
        txObj.target_contract(digest, address, new BitVector(10))
        expect(txObj._contract_digest).toBeInstanceOf(Address)
        expect(txObj._contract_address).toBeInstanceOf(Address)
        expect(txObj._shard_mask._size).toBe(new BitVector(10)._size)
        expect(txObj._shard_mask._byte_size).toBe(new BitVector(10)._byte_size)
        expect(txObj._chain_code).toBe('')
    })

    it('Test target_chain_code', () => {
        let txObj = new Transaction()
        txObj.target_chain_code(2, new BitVector(10))
        expect(txObj._contract_digest).toBe('')
        expect(txObj._contract_address).toBe('')
        expect(txObj._shard_mask._size).toBe(new BitVector(10)._size)
        expect(txObj._shard_mask._byte_size).toBe(new BitVector(10)._byte_size)
        expect(txObj._chain_code).toBe(String(2))
    })

    it('Test synergetic_data_submission', () => {
        let txObj = new Transaction()
        expect(txObj.synergetic_data_submission(true)).toBe(true)
    })

    it('Test add_signer and signers', () => {
        let txObj = new Transaction()
        txObj.add_signer('thisIsSigner')
        expect(txObj.signers()['thisIsSigner']).toBe('')
    })
})
