import * as bs58 from 'bs58'
import {createHash} from 'crypto'
import {Address} from '../../fetchai/ledger/crypto/address'

//TODO remove functions names preceeding underscore.
export function calc_digest(address_raw) {
    const hash_func = createHash('sha256')
    hash_func.update(address_raw)
    const digest = hash_func.digest()
    return digest
}

export function calc_address(address_raw) {
    const digest = calc_digest(address_raw)
    const bytes = calc_digest(digest)
    const checksum = bytes.slice(0, 4)
    const full = Buffer.concat([digest, checksum])
    const display = bs58.encode(full)
    return [digest, display]
}

export function dummy_address() {
    const digest = calc_digest(Buffer.from('rand'))
    const bs58_encoded = bs58.encode(digest)
    const [, expected_display] = calc_digest(bs58_encoded)
    return new Address(expected_display)
}

