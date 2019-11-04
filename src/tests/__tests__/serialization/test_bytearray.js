import * as bytearray from '../../../fetchai/ledger/serialization/bytearray'

describe(':Bytearray', () => {

	test('test encode', () => {
		const data = Buffer.from('3E8', 'hex')
		const buf = Buffer.from('')
		const encoded = bytearray.encode(buf, data)
		expect(encoded.toString('hex')).toBe('013e')
	})

	test('test decode', () => {
		const data = Buffer.from('0A00010203040506070809', 'hex')
		const container = { buffer: data}
		const decoded = bytearray.decode(container)
		expect(decoded.toString('hex')).toBe('00010203040506070809')
	})
})
