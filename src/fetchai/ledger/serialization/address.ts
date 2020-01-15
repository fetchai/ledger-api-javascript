import {Address} from '../../../fetchai/ledger/crypto/address'


const BYTE_LENGTH = 32
type Tuple = [Address, Buffer];

const encode_address = (buffer:  Buffer, address: Address | string) :  Buffer => {
    if (address instanceof Address) {
        return Buffer.concat([buffer, Buffer.from(address.toHex(), 'hex')])
    } else {
        // address is in hex format
        return Buffer.concat([buffer, Buffer.from(address, 'hex')])
    }
}

const decode_address = (buffer:  Buffer) : Tuple  => {
    const address_raw = buffer.slice(0, BYTE_LENGTH)
    buffer = buffer.slice(BYTE_LENGTH)
    return [new Address(address_raw), buffer]
}

export {encode_address, decode_address}
