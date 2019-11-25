import {Address} from '../../fetchai/ledger/crypto/address'
import {Identity} from '../../fetchai/ledger/crypto/identity'
import * as bs58 from 'bs58'
import {ValidationError} from '../../fetchai/ledger/errors'
import {calc_address, calc_digest} from '../utils/helpers'

describe(':Address', () => {

    it('test construction from string', () => {
        // generate a random 32 byte buffer
        const digest = calc_digest(Buffer.from('rand'))
        const bs58_encoded = bs58.encode(digest)
        const [expected_address_bytes, expected_display] = calc_address(bs58_encoded)
        const address = new Address(expected_display)
        expect(address.toBytes()).toMatchObject(expected_address_bytes)
        expect(address.toString()).toBe(expected_display)
    })

    it('test construction from bytes', () => {
        const digest = calc_digest(Buffer.from('rand'))
        const bs58_encoded = bs58.encode(digest)
        const [expected_address_bytes,] = calc_address(bs58_encoded)
        const address = new Address(expected_address_bytes)
        expect(address.toBytes()).toMatchObject(expected_address_bytes)
    })

    it('test construction from address', () => {
        const digest = calc_digest(Buffer.from('rand'))
        const bs58_encoded = bs58.encode(digest)
        const [expected_address_bytes,] = calc_address(bs58_encoded)
        const address1 = new Address(expected_address_bytes)
        const address2 = new Address(address1)
        expect(address2.toBytes()).toMatchObject(expected_address_bytes)
    })

    it('test invalid length bytes', () => {
        const digest = calc_digest(Buffer.from('rand'))
        const invalid_address = Buffer.concat([digest, digest])
        expect(() => {
            new Address(invalid_address)
        }).toThrow(ValidationError)
    })

    it('test invalid length string', () => {
        const invalid_string = Buffer.from('rand')
        const bs58_encoded = bs58.encode(invalid_string)
        expect(() => {
            new Address(bs58_encoded)
        }).toThrow(ValidationError)
    })

    it('test invalid type', () => {
        expect(() => {
            new Address(99)
        }).toThrow(ValidationError)
    })

    it('test hex display', () => {
        const digest = calc_digest(Buffer.from('rand'))
        const bs58_encoded = bs58.encode(digest)
        const [expected_address_bytes,] = calc_address(bs58_encoded)
        const address = new Address(expected_address_bytes)
        const address_bytes = address.toBytes()
        const hex_address = address_bytes.toString('hex')
        const actual = address.toHex()
        expect(actual).toBe(hex_address)
    })

    it('test invalid display', () => {
        const digest = calc_digest(Buffer.from('rand'))
        const bs58_encoded = bs58.encode(digest)
        const [, expected_display] = calc_address(bs58_encoded)
        const address = new Address(expected_display)
        const address_bytes = address.toBytes()
        const invalid_checksum = Buffer.from('1134')
        const display = Buffer.concat([address_bytes, invalid_checksum])
        const bs58invalid = bs58.encode(display)
        expect(() => {
            new Address(Buffer.from(bs58invalid))
        }).toThrow(ValidationError)

    })

    it('test hardcoded addresses', () => {
        const identity1 = new Identity(Buffer.from('11f2b9a49c76fdaee79b9f470594b51c09299ef4294ea9cf545be4d9d303cc0d28013a21e085a0a1f68bae3f203c375fae182bc69f994290224b563b43388183', 'hex'))
        const expected_display = 'nLYsNsbFGDgcGJa3e7xn2V82fnpaGZVSuJUHCkeY9Cm6SfEyG'
        const address1 = new Address(expected_display)
        const address2 = new Address(identity1)
        const address1_bytes = address1.toBytes()
        const address2_bytes = address2.toBytes()
        const expected_raw_address = '66f17ebc835641521877ef171e0275e0ce923b02b3cbf1965e59fe950277a582'
        expect(address1_bytes.toString('hex')).toBe(expected_raw_address)
        expect(address2_bytes.toString('hex')).toBe(expected_raw_address)
        expect(address1.toString()).toBe(expected_display)
        expect(address2.toString()).toBe(expected_display)
    })

})
