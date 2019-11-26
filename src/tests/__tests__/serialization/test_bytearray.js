import * as bytearray from '../../../fetchai/ledger/serialization/bytearray'

describe(':Bytearray', () => {

    it('test encode', () => {
        // https://github.com/nodejs/node/issues/24491
        const data = Buffer.from('3E', 'hex')
        const buf = Buffer.from('')
        const encoded = bytearray.encode(buf, data)
        expect(encoded.toString('hex')).toBe('013e')
    })

    it('test decode', () => {
        const data = Buffer.from('0A00010203040506070809', 'hex')
        const [decoded, buffer] = bytearray.decode(data)
        expect(decoded.toString('hex')).toBe('00010203040506070809')
        expect(Buffer.byteLength(buffer)).toBe(0)
    })
})
