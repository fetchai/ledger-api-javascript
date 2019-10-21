import * as address from '../../../fetchai/ledger/serialization/address'

describe(':Address', () => {

	test('test encode', () => {
		const ref_address = _dummy_address()
		const buf = Buffer.from('')
		const encoded = address.encode(buf, ref_address)
		const expected = ref_address.toBytes()
		expect(Buffer.byteLength(expected)).toBe(Buffer.byteLength(encoded))
		expect(expected.toString('hex')).toBe(encoded.toString('hex'))
	})

})
