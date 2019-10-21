import {Address} from '../../../fetchai/ledger/crypto/address'

const encode = (buffer, address) => {
	if(address instanceof Address){
		return  Buffer.concat([buffer, new Buffer(address.toHex(), 'hex')])
	} else {
		// address is in hex format
		return Buffer.concat([buffer, new Buffer(address, 'hex')])
	}
}

export { encode }
