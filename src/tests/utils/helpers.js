import * as bs58 from 'bs58'
import {createHash} from 'crypto'
import {Address} from '../../fetchai/ledger/crypto/address'

export const LOCAL_HOST = '127.0.0.1'
export const DEFAULT_PORT = 8000
export const RAND_FP = '/path/to/file'


//TODO remove functions names preceeding underscore.
export function calc_digest(address_raw) {
    const hash_func = createHash('sha256')
    hash_func.update(address_raw)
    return hash_func.digest()
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
    // const bs58_encoded = bs58.encode(digest)
    return new Address(Buffer.from(digest))
}

