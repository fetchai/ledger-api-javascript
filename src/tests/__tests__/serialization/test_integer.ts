import * as integer from '../../../fetchai/ledger/serialization/integer'
import {BN} from 'bn.js'

describe(':Integer', () => {

    // encode tests
    test('test small unsigned encode', () => {
        const buffer = Buffer.from('')
        const encoded = integer.encode_integer(buffer, new BN(4))
        expect(encoded.toString('hex')).toBe('04')
    })

    test('test small signed encode', () => {
        const buffer = Buffer.from('')
        const encoded = integer.encode_integer(buffer, new BN(-4))
        expect(encoded.toString('hex')).toBe('e4')
    })

    test('test 1byte unsigned encode', () => {
        const buffer = Buffer.from('')
        const encoded = integer.encode_integer(buffer, new BN(0x80))
        expect(encoded.toString('hex')).toBe('c080')
    })

    test('test 2byte unsigned encode', () => {
        const buffer = Buffer.from('')
        const encoded = integer.encode_integer(buffer, new BN(0xEDEF))
        expect(encoded.toString('hex')).toBe('c1edef')
    })

    test('test 4byte unsigned encode', () => {
        const buffer = Buffer.from('')
        const encoded = integer.encode_integer(buffer, new BN(0xEDEFABCD))
        expect(encoded.toString('hex')).toBe('c2edefabcd')
    })

    test('test 8byte unsigned encode', () => {
        const buffer = Buffer.from('')
        const eight_byte = new BN('EDEFABCD01234567', 16)
        const encoded = integer.encode_integer(buffer, eight_byte)
        const expected_buffer = Buffer.from('c3edefabcd01234567', 'hex')
        expect(encoded).toMatchObject(expected_buffer)
    })


    test('test 1byte signed encode', () => {
        const buffer = Buffer.from('')
        const encoded = integer.encode_integer(buffer, new BN(-0x80))
        expect(encoded.toString('hex')).toBe('d080')
    })

    test('test 2byte signed encode', () => {
        const buffer = Buffer.from('')
        const encoded = integer.encode_integer(buffer, new BN(-0xEDEF))
        expect(encoded.toString('hex')).toBe('d1edef')
    })

    test('test 4byte signed encode', () => {
        const buffer = Buffer.from('')
        const encoded = integer.encode_integer(buffer, new BN(-0xEDEFABCD))
        expect(encoded.toString('hex')).toBe('d2edefabcd')
    })

    test('test 8byte signed encode', () => {
        const buffer = Buffer.from('')
        const eight_byte = new BN('-EDEFABCD01234567', 16)
        const encoded = integer.encode_integer(buffer, eight_byte)
        const expected_buffer = Buffer.from('D3EDEFABCD01234567', 'hex')
        expect(encoded).toMatchObject(expected_buffer)
    })


    // start decode tests
    test('test small unsigned decode', () => {
        const buff = Buffer.from('04', 'hex')
        const [decoded, buffer] = integer.decode_integer(buff)
        const reference = new BN(4)
        const comparison = decoded.cmp(reference)
        expect(comparison).toBe(0)
        expect(Buffer.byteLength(buffer)).toBe(0)
    })

    test('test small signed decode', () => {
        const buff = Buffer.from('E4', 'hex')
        const [decoded, buffer] = integer.decode_integer(buff)
        const reference = new BN(-4)
        const comparison = decoded.cmp(reference)
        expect(comparison).toBe(0)
        expect(Buffer.byteLength(buffer)).toBe(0)
    })

    test('test 1byte unsigned decode', () => {
        const buff = Buffer.from('C080', 'hex')
        const [decoded, buffer] = integer.decode_integer(buff)
        const reference = new BN('80', 16)
        const comparison = decoded.cmp(reference)
        expect(comparison).toBe(0)
        expect(Buffer.byteLength(buffer)).toBe(0)
    })

    test('test 2byte unsigned decode', () => {
        const buff = Buffer.from('C1EDEF', 'hex')
        const [decoded, buffer] = integer.decode_integer(buff)
        const reference = new BN('EDEF', 16)
        const comparison = decoded.cmp(reference)
        expect(comparison).toBe(0)
        expect(Buffer.byteLength(buffer)).toBe(0)
    })

    test('test 4byte unsigned decode', () => {
        const buff = Buffer.from('C2EDEFABCD', 'hex')
        const [decoded, buffer] = integer.decode_integer(buff)
        const reference = new BN('EDEFABCD', 16)
        const comparison = decoded.cmp(reference)
        expect(comparison).toBe(0)
        expect(Buffer.byteLength(buffer)).toBe(0)
    })

    test('test 8byte unsigned decode', () => {
        const buff = Buffer.from('C3EDEFABCD01234567', 'hex')
        const [decoded, buffer] = integer.decode_integer(buff)
        const reference = new BN('EDEFABCD01234567', 16)
        expect(reference.toArrayLike(Buffer, 'be')).toMatchObject(decoded.toArrayLike(Buffer, 'be'))
        expect(Buffer.byteLength(buffer)).toBe(0)
    })

    test('test 1byte signed decode', () => {
        const [decoded, buffer] = integer.decode_integer(Buffer.from('D080', 'hex'))
        const reference = new BN('-80', 16)
        const comparison = decoded.cmp(reference)
        expect(comparison).toBe(0)
        expect(Buffer.byteLength(buffer)).toBe(0)
    })

    test('test 2byte signed decode', () => {
        const [decoded, buffer] = integer.decode_integer(Buffer.from('D1EDEF', 'hex'))
        const reference = new BN('-EDEF', 16)
        const comparison = decoded.cmp(reference)
        expect(comparison).toBe(0)
        expect(Buffer.byteLength(buffer)).toBe(0)
    })

    test('test 4byte signed decode', () => {
        const [decoded, buffer] = integer.decode_integer(Buffer.from('D1EDEF', 'hex'))
        const reference = new BN('-EDEF', 16)
        const comparison = decoded.cmp(reference)
        expect(comparison).toBe(0)
        expect(Buffer.byteLength(buffer)).toBe(0)
    })

    test('test 8byte signed decode', () => {
        const buff = Buffer.from('D3EDEFABCD01234567', 'hex')
        const [decoded, buffer] = integer.decode_integer(buff)
        const reference = new BN('-EDEFABCD01234567', 16)
        const comparison = decoded.cmp(reference)
        expect(comparison).toBe(0)
        expect(Buffer.byteLength(buffer)).toBe(0)
    })

})
