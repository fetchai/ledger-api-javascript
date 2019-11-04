import {Address} from '../../../fetchai/ledger/crypto/address'

const BYTE_LENGTH = 32

const encode = (buffer, address) => {
    if (address instanceof Address) {
        return Buffer.concat([buffer, Buffer.from(address.toHex(), 'hex')])
    } else {
        // address is in hex format
        return Buffer.concat([buffer, Buffer.from(address, 'hex')])
    }
}

const decode = (container) => {
	const address_raw = container.buffer.slice(0, BYTE_LENGTH)
	container.buffer = container.buffer.slice(BYTE_LENGTH)
	return new Address(address_raw)
}

export {encode, decode}
