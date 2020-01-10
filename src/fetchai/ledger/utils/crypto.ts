import {createHash} from "crypto";

function calc_digest(address_raw: BinaryLike) : Buffer {
    const hash_func = createHash('sha256')
    hash_func.update(address_raw)
    return hash_func.digest()
}

export {calc_digest}
