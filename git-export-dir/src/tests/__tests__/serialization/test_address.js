import * as address from '../../../fetchai/ledger/serialization/address'
import {Address} from '../../../fetchai/ledger/crypto/address'
import {dummy_address} from '../../utils/helpers'

describe(':Address', () => {

    test('test encode', () => {
        const ref_address = dummy_address()
        const buf = Buffer.from('')
        const encoded = address.encode(buf, ref_address)
        const expected = ref_address.toBytes()
        expect(Buffer.byteLength(expected)).toBe(Buffer.byteLength(encoded))
        expect(expected.toString('hex')).toBe(encoded.toString('hex'))
    })

    test('test decode', () => {
        const ref_address = dummy_address()
        const [address_obj, buffer] = address.decode(ref_address.toBytes())
        const expected = ref_address.toBytes()
        const address_bytes = address_obj.toBytes()
        expect(address_obj).toBeInstanceOf(Address)
        expect(address_bytes.toString('hex')).toBe(expected.toString('hex'))
        expect(Buffer.byteLength(buffer)).toBe(0)
    })

})
