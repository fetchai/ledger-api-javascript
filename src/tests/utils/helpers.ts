import * as bs58 from 'bs58'
import {createHash} from 'crypto'
import {Address} from '../../fetchai/ledger/crypto/address'
import {Entity} from '../../fetchai/ledger/crypto/entity'
import {Identity} from '../../fetchai/ledger/crypto/identity'

export const LOCAL_HOST = '127.0.0.1'
export const DEFAULT_PORT = 8000
export const RAND_FP = '/path/to/file'
export const PASSWORD = 'Password!12345'

export const _PRIVATE_KEYS = [
    '1411d53f88e736eac7872430dbe5b55ac28c17a3e648c388e0bd1b161ab04427',
    '3436c184890d498b25bc2b5cb0afb6bad67379ebd778eae1de40b6e0f0763825',
    '4a56a19355f934174f6388b3c80598abb151af79c23d5a7af45a13357fb71253',
    'f9d67ec139eb7a1cb1f627357995847392035c1e633e8530de5ab5d04c6e9c33',
    '80f0e1c69e5f1216f32647c20d744c358e0894ebc855998159017a5acda208ba',
    'e833c747ee0aeae29e6823e7c825d3001638bc30ffe50363f8adf2693c3286f8',
    '4083a476c4872f25cb40839ac8d994924bcef12d83e2ba4bd3ed6c9705959860',
]

export const ENTITIES = ((): Array<Entity> => {
    const ENTITIES: Array<Entity> = []
    for (let i = 0; i < _PRIVATE_KEYS.length; i++) {
        ENTITIES.push(Entity.from_hex(_PRIVATE_KEYS[i]))
    }
    return ENTITIES
})()

export const ADDRESSES = ((): Array<Address> => {
    const ENTITIES: Array<Entity> = []
    const ADDRESSES: Array<Address> = []

    for (let i = 0; i < _PRIVATE_KEYS.length; i++) {
        ENTITIES.push(Entity.from_hex(_PRIVATE_KEYS[i]))
        ADDRESSES.push(new Address(ENTITIES[i]))
    }
    return ADDRESSES
})()

export const IDENTITIES = ((): Array<Identity> => {
    const ENTITIES: Array<Entity> = []
    const IDENTITIES: Array<Identity> = []

    for (let i = 0; i < _PRIVATE_KEYS.length; i++) {
        ENTITIES.push(Entity.from_hex(_PRIVATE_KEYS[i]))
        IDENTITIES.push(new Identity(ENTITIES[i].public_key()))
    }
    return IDENTITIES
})()


//TODO remove functions names preceeding underscore.
export function calc_digest(address_raw: BinaryLike): Buffer {
    const hash_func = createHash('sha256')
    hash_func.update(address_raw)
    return hash_func.digest()
}

export function calc_address(address_raw: BinaryLike): Array<Buffer | string> {
    const digest = calc_digest(address_raw)
    const bytes = calc_digest(digest)
    const checksum = bytes.slice(0, 4)
    const full = Buffer.concat([digest, checksum])
    const display = bs58.encode(full)
    return [digest, display]
}

export function dummy_address(): Address {
    const digest = calc_digest(Buffer.from('rand'))
    // const bs58_encoded = bs58.encode(digest)
    return new Address(Buffer.from(digest))
}

export function equals(x: any, y: any): boolean {
    if (x === y) return true
    let p
    for (p in x) {
        if (!x.hasOwnProperty(p)) continue
        if (!y.hasOwnProperty(p)) return false
        if (x[p] === y[p]) continue
        if (typeof x[p] === 'string' && x[p].length > 150) continue
        if (typeof (x[p]) !== 'object') return false
        if (!equals(x[p], y[p])) return false
    }
    for (p in y) {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false
    }
    return true
}
