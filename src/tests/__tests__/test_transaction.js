import {Transaction} from '../../fetchai/ledger/transaction'
import {BitVector} from '../../fetchai/ledger/bitvector'
import {Address} from '../../fetchai/ledger/crypto/address'
import {BN} from 'bn.js'
import {dummy_address} from '../utils/helpers'

describe(':Test Transaction', () => {
    test('Testing transaction constructor', () => {
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
        expect(Object.keys(txObj._transfers)).toHaveLength(0)
    })

    test('Test from_address', () => {
        let txObj = new Transaction()
        const randomAddr = dummy_address()
        const address = new Address(randomAddr)
        expect(txObj.from_address(randomAddr)).toMatchObject(address)
    })

    test('Test transfers', () => {
        let txObj = new Transaction()
        expect(Object.keys(txObj.transfers())).toHaveLength(0)
    })

    test('Test add_transfer with amount', () => {
        let txObj = new Transaction()
        let address = dummy_address()
        txObj.set_transfer(address, new BN(40))
        txObj.add_transfer(address, new BN(10))
        expect(txObj._transfers[address.toHex()].toNumber()).toBe(40 + 10)
    })

    test('Test valid_from', () => {
        let txObj = new Transaction()
        expect(txObj.valid_from(new BN(12)).cmp(new BN(12))).toBe(0)
        expect(txObj._valid_from).toMatchObject(new BN(12))
    })

    test('Test valid_until', () => {
        let txObj = new Transaction()
        expect(txObj.valid_until(new BN(14)).cmp(new BN(14))).toBe(0)
        expect(txObj._valid_until).toMatchObject(new BN(14))
    })

    test('Test charge_rate', () => {
        let txObj = new Transaction()
        expect(txObj.charge_rate(new BN(14)).cmp(new BN(14))).toBe(0)
    })

    test('Test charge_limit', () => {
        let txObj = new Transaction()
        expect(txObj.charge_limit(new BN(14)).cmp(new BN(14))).toBe(0)
        expect(txObj._charge_limit).toMatchObject(new BN(14))
    })

    test('Test contract_digest', () => {
        let txObj = new Transaction()
        expect(txObj.contract_digest()).toBe(txObj._contract_digest)
    })

    test('Test contract_address', () => {
        let txObj = new Transaction()
        expect(txObj.contract_address()).toBe(txObj._contract_address)
    })

    test('Test chain_code', () => {
        let txObj = new Transaction()
        expect(txObj.chain_code()).toBe(txObj._chain_code)
    })

    test('Test action', () => {
        let txObj = new Transaction()
        expect(txObj.action('takeAction')).toBe('takeAction')
        expect(txObj._action).toBe('takeAction')
    })

    test('Test shard_mask', () => {
        let txObj = new Transaction()
        expect(txObj.shard_mask()).toBe(txObj._shard_mask)
    })

    test('Test data', () => {
        let txObj = new Transaction()
        expect(txObj.data('some data to set')).toBe('some data to set')
        expect(txObj._data).toBe('some data to set')
    })

    // signers() tested below
    test('Test add_transfer', () => {
        let txObj = new Transaction()
        let address = dummy_address()
        txObj.set_transfer(address)
        txObj.add_transfer(address, new BN(10))
        const hex = address.toHex()
        expect(txObj._transfers[hex].toNumber()).toBe(10)
    })

    test('Test target_contract', () => {
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

    test('Test target_chain_code', () => {
        let txObj = new Transaction()
        txObj.target_chain_code(2, new BitVector(10))
        expect(txObj._contract_digest).toBe('')
        expect(txObj._contract_address).toBe('')
        expect(txObj._shard_mask._size).toBe(new BitVector(10)._size)
        expect(txObj._shard_mask._byte_size).toBe(new BitVector(10)._byte_size)
        expect(txObj._chain_code).toBe(String(2))
    })

    test('Test synergetic_data_submission', () => {
        let txObj = new Transaction()
        expect(txObj.synergetic_data_submission(true)).toBe(true)
    })

    test('Test add_signer and signers', () => {
        let txObj = new Transaction()
        txObj.add_signer('thisIsSigner')
        expect(txObj.signers()['thisIsSigner']).toBe('')
    })
})
