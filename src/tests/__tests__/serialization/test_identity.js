import * as identity from '../../../fetchai/ledger/serialization/identity'
import {Entity} from '../../../fetchai/ledger/crypto/entity'

const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY = 0x04

describe(':Identity', () => {

	test('test encode', () => {
		const entity = new Entity()
		const buffer = Buffer.from('')
		const ref =  Buffer.concat([buffer, new Buffer([UNCOMPRESSED_SCEP256K1_PUBLIC_KEY]), entity.public_key_bytes()])
        const bytes = entity.public_key_bytes();
		const encoded = identity.encode(buffer, bytes);
		expect(Buffer.byteLength(ref)).toBe(Buffer.byteLength(encoded))
		expect(ref.toString('hex')).toBe(encoded.toString('hex'))
	})

})
