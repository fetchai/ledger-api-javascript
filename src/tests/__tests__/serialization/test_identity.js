import * as identity from '../../../fetchai/ledger/serialization/identity'
import {Entity} from '../../../fetchai/ledger/crypto/entity'

const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY = 0x04

describe(':Identity', () => {

    test('test encode', () => {
        const entity = new Entity()
        const buffer = Buffer.from('')
        const ref = Buffer.concat([buffer, Buffer.from([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]), entity.public_key_bytes()])
        const bytes = entity.public_key_bytes()
        const encoded = identity.encode_identity(buffer, bytes)
        const buffer2 = Buffer.from('') // think I can use same buffer as above refactor out when passing tests.
        const encoded_2 = identity.encode_identity(buffer2, bytes)
        // testing the passed in buffer
        expect(Buffer.byteLength(ref)).toBe(Buffer.byteLength(encoded))
        expect(ref.toString('hex')).toBe(encoded.toString('hex'))
        // testing the passed in entity.
        expect(Buffer.byteLength(ref)).toBe(Buffer.byteLength(encoded_2))
        expect(ref.toString('hex')).toBe(encoded_2.toString('hex'))
    })

    test('test decode', () => {
        const entity = new Entity()
        const buf = Buffer.from('')
        const ref = Buffer.concat([buf, Buffer.from([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]), entity.public_key_bytes()])
        const [decoded, buffer] = identity.decode_identity(ref)
        const bytes = entity.public_key_bytes()
        expect(decoded.toString('hex')).toBe(bytes.toString('hex'))
        expect(Buffer.byteLength(buffer)).toBe(0)
    })
})
