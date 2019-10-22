import * as bs58 from 'bs58'
import {createHash} from 'crypto'
import {Address} from '../../fetchai/ledger/crypto/address'

//TODO remove functions names preceeding underscore.
global._calc_digest = (address_raw) => {
	const hash_func = createHash('sha256')
	hash_func.update(address_raw)
	const digest = hash_func.digest()
	return digest
}

global._calc_address = (address_raw) => {
	const digest = _calc_digest(address_raw)
	const bytes = _calc_digest(digest)
	const checksum = bytes.slice(0, 4)
	const full = Buffer.concat([digest, checksum])
	const display = bs58.encode(full)
	return [digest, display]
}

global._dummy_address = () => {
	const digest = _calc_digest(Buffer.from('rand'))
	const bs58_encoded = bs58.encode(digest)
	const [, expected_display] = _calc_address(bs58_encoded)
	return new Address(expected_display)
}
