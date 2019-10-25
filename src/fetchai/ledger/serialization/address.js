import { Address } from '../../../fetchai/ledger/crypto/address'

const BYTE_LENGTH = 32

const encode = (buffer, address) => {
	if (address instanceof Address) {
		return Buffer.concat([buffer, new Buffer(address.toHex(), 'hex')])
	} else {
		// address is in hex format
		return Buffer.concat([buffer, new Buffer(address, 'hex')])
	}
}

const decode = buff => {
	const address_raw = buff.slice(0, BYTE_LENGTH)
	return new Address(address_raw)
}

export { encode, decode }
