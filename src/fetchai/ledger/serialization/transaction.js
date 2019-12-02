import assert from 'assert'
import * as address from './address'
import * as integer from './integer'
import * as bytearray from './bytearray'
import * as identity from './identity'
import {RunTimeError, ValidationError} from '../errors'
import {logger} from '../utils'
import {createHash} from 'crypto'
import {BitVector} from '../bitvector'
import {Identity} from '../crypto/identity'
import {Transaction} from '../transaction'
import {BN} from 'bn.js'

// *******************************
// ********** Constants **********
// *******************************
const MAGIC = 0xa1
// a reserved byte.
const RESERVED = 0x00
const VERSION = 2
const NO_CONTRACT = 0
const SMART_CONTRACT = 1
const CHAIN_CODE = 2
const SYNERGETIC = 3
const EXPECTED_SERIAL_SIGNATURE_LENGTH = 65

const log2 = value => {

    let count = 0
    while (value > 1) {
        value >>= 1
        count += 1
    }
    return count
}

const _calc_digest_utf = (address_raw) => {
    const hash_func = createHash('sha256')
    hash_func.update(address_raw, 'utf')
    return hash_func.digest()
}

const _map_contract_mode = payload => {

    if (payload.synergetic_data_submission()) {
        return SYNERGETIC
    }
    if (payload.action()) {
        if (payload.chain_code()) {
            return CHAIN_CODE
        }
        assert(payload.contract_digest() != null)
        return SMART_CONTRACT
    } else {
        return NO_CONTRACT
    }
}


const encode_payload = payload => {

    const num_transfers = Object.keys(payload._transfers).length
    const num_signatures = Object.keys(payload._signers).length
    // sanity check
    assert(num_signatures >= 1)
    const num_extra_signatures =
        num_signatures > 0x40 ? (num_signatures - 0x40) : 0
    const signalled_signatures = num_signatures - (num_extra_signatures + 1)
    const has_valid_from = (payload._valid_from.cmp(new BN(0)) !== 0)

    let header0 = VERSION << 5 /// ??
    header0 |= (num_transfers > 0 ? 1 : 0) << 2
    header0 |= (num_transfers > 1 ? 1 : 0) << 1
    header0 |= has_valid_from ? 1 : 0
    // determine the mode of the contract
    const contract_mode = _map_contract_mode(payload)
    let header1 = contract_mode << 6
    header1 |= signalled_signatures & 0x3f
    let buffer = Buffer.from([MAGIC, header0, header1, RESERVED])

    buffer = address.encode_address(buffer, payload.from_address())
    if (num_transfers > 1) {
        buffer = integer.encode_integer(buffer, new BN(num_transfers - 2))
    }

    for (let [key, value] of Object.entries(payload._transfers)) {
        buffer = address.encode_address(buffer, key)
        buffer = integer.encode_integer(buffer, value)
    }

    if (has_valid_from) {
        buffer = integer.encode_integer(buffer, new BN(payload.valid_from()))
    }

    buffer = integer.encode_integer(buffer, payload.valid_until())
    buffer = integer.encode_integer(buffer, payload.charge_rate())
    buffer = integer.encode_integer(buffer, payload.charge_limit())
    if (NO_CONTRACT !== contract_mode) {
        let shard_mask = payload.shard_mask()
        let shard_mask_length = shard_mask.__len__()
        if (shard_mask_length <= 1) {
            // signal this is a wildcard transaction
            buffer = Buffer.concat([buffer, Buffer.from([0x80])])
        } else {

            let shard_mask_bytes = shard_mask.__bytes__()
            let log2_mask_length = log2(shard_mask_length)
            let contract_header

            if (shard_mask_length < 8) {

                assert(Buffer.byteLength(shard_mask_bytes) === 1)
                contract_header = shard_mask_bytes.readUIntBE(0, 1) & 0xf

                if (log2_mask_length === 2) {
                    contract_header |= 0x10
                }

                // write the mask to the stream
                buffer = Buffer.concat([buffer, Buffer.from([contract_header])])
            } else {
                assert(shard_mask_length <= 512)
                contract_header = 0x40 | ((log2_mask_length - 3) & 0x3f)
                buffer = Buffer.concat([buffer, Buffer.from([contract_header])])
                buffer = Buffer.concat([buffer, shard_mask_bytes])
            }
        }

        if (SMART_CONTRACT === contract_mode || SYNERGETIC === contract_mode) {
            buffer = address.encode_address(buffer, payload.contract_digest())
            buffer = address.encode_address(buffer, payload.contract_address())
        } else if (CHAIN_CODE === contract_mode) {
            let encoded_chain_code = Buffer.from(payload.chain_code(), 'ascii')
            buffer = bytearray.encode_bytearray(buffer, encoded_chain_code)
        } else {
            assert(false)
        }

        buffer = bytearray.encode_bytearray(
            buffer,
            Buffer.from(payload.action(), 'ascii')
        )
        const data = Buffer.from(payload.data())
        buffer = bytearray.encode_bytearray(buffer, data)
    }

    buffer = Buffer.concat([buffer, payload.counter().toBuffer('be', 8)])


    if (num_extra_signatures > 0) {
        buffer = integer.encode_integer(buffer, new BN(num_extra_signatures))
    }

    // write all the signers public keys
    for (let signer of Object.keys(payload._signers)) {
        buffer = identity.encode_identity(
            buffer,
            Buffer.from(
                signer,
                'hex'
            )
        )
    }
    logger.info(`\n encoded payload: ${buffer.toString('hex')} \n`)
    return buffer
}

const encode_transaction = (payload, signers) => {
    // encode the contents of the transaction
    let buffer = encode_payload(payload)
    // extract the payload buffer
    let payload_bytes = _calc_digest_utf(buffer)

    // append all the signatures of the signers in order
    for (let signer of Object.keys(payload._signers)) {

        let hex_key
        let flag = false
        for (let i = 0; i < signers.length; i++) {
            hex_key = signers[i].pubKey.toString('hex')
            // check if payload sig matches one passed in this param.
            if (signer === hex_key) {
                flag = true
                const sign_obj = signers[i].sign(payload_bytes)
                buffer = bytearray.encode_bytearray(buffer, sign_obj.signature)
            }
        }

        if (!flag) {
            throw new ValidationError('Missing signer signing set')
        }

    }
    logger.info(`\n encoded transaction: ${buffer.toString('hex')} \n`)
    // return the encoded transaction
    return buffer
}


const decode_transaction = (buffer) => {
    // we use the origin later to determine the payload
    const input_buffer = buffer
    // ensure the at the magic is correctly configured
    const magic = buffer.slice(0, 1)
    buffer = buffer.slice(1)
    const magic_integer = magic.readUIntBE(0, 1)

    if (magic_integer !== MAGIC) {
        throw new ValidationError('Missing signer signing set')
    }

    //extract the header bytes
    const header_first_buffer = buffer.slice(0, 1)
    const header_second_buffer = buffer.slice(1, 2)
    buffer = buffer.slice(2)

    const header_first = header_first_buffer.readUIntBE(0, 1)
    const header_second = header_second_buffer.readUIntBE(0, 1)
    const version = (header_first & 0xE0) >> 5
    // const charge_unit_flag = Boolean((header_first & 0x08) >> 3)
    // assert(!charge_unit_flag);
    const transfer_flag = Boolean((header_first & 0x04) >> 2)
    const multiple_transfers_flag = Boolean((header_first & 0x02) >> 1)
    const valid_from_flag = Boolean((header_first & 0x01))
    const contract_type = (header_second & 0xC0) >> 6
    const signature_count_minus1 = (header_second & 0x3F)
    let num_signatures = signature_count_minus1 + 1

    if (version !== VERSION) {
        throw new ValidationError('Unable to parse transaction from stream, incompatible version')
    }

    // discard the reserved byte
    buffer = buffer.slice(1)

    const tx = new Transaction()
    // decode the address from the buffer
    let address_decoded;
    [address_decoded, buffer] = address.decode_address(buffer)
    tx.from_address(address_decoded)

    if (transfer_flag) {
        let transfer_count
        if (multiple_transfers_flag) {
            [transfer_count, buffer] = integer.decode_integer(buffer)
            transfer_count = transfer_count.toNumber() + 2
        } else {
            transfer_count = 1
        }

        let to, amount
        for (let i = 0; i < transfer_count; i++) {
            [to, buffer] = address.decode_address(buffer);
            [amount, buffer] = integer.decode_integer(buffer)
            tx.add_transfer(to, amount)
        }
    }

    if (valid_from_flag) {
        let valid_from;
        [valid_from, buffer] = integer.decode_integer(buffer)
        tx.valid_from(valid_from)
    }
    let valid_until, charge_rate, charge_limit;
    [valid_until, buffer] = integer.decode_integer(buffer)
    tx.valid_until(valid_until);
    [charge_rate, buffer] = integer.decode_integer(buffer)
    tx.charge_rate(charge_rate);

    //  assert not charge_unit_flag, "Currently the charge unit field is not supported"
    [charge_limit, buffer] = integer.decode_integer(buffer)
    tx.charge_limit(charge_limit)
    if (contract_type != NO_CONTRACT) {

        const contract_header = buffer.slice(0, 1)
        buffer = buffer.slice(1)
        const contract_header_int = contract_header.readUIntBE(0, 1)
        const wildcard = Boolean(contract_header_int & 0x80)
        let shard_mask = new BitVector()

        if (!wildcard) {
            const extended_shard_mask_flag = Boolean(contract_header_int & 0x40)

            if (!extended_shard_mask_flag) {
                let mask, bit_size
                if (contract_header_int & 0x10) {
                    mask = 0xf
                    bit_size = 4
                } else {
                    mask = 0x3
                    bit_size = 2
                }

                // extract the shard mask from the header
                const toHex = (d) => ('0' + (Number(d).toString(16))).slice(-2).toUpperCase()
                let decoded_bytes = Buffer.from(toHex(contract_header_int & mask), 'hex')
                shard_mask = BitVector.from_bytes(decoded_bytes, bit_size)

            } else {
                const bit_length = 1 << ((contract_header_int & 0x3F) + 3)
                const byte_length = Math.floor(bit_length / 8)
                assert((bit_length % 8) == 0)  //this should be enforced as part of the spec
                shard_mask = BitVector.from_bytes(buffer.slice(0, byte_length), bit_length)
                buffer = buffer.slice(byte_length)
            }
        }
        if (contract_type == SMART_CONTRACT || contract_type == SYNERGETIC) {
            let contract_digest, contract_address;
            [contract_digest, buffer] = address.decode_address(buffer);
            [contract_address, buffer] = address.decode_address(buffer)
            tx.target_contract(contract_digest, contract_address, shard_mask)

        } else if (contract_type == CHAIN_CODE) {
            let encoded_chain_code_name;
            [encoded_chain_code_name, buffer] = bytearray.decode_bytearray(buffer)
            tx.target_chain_code(encoded_chain_code_name.toString(), shard_mask)
        } else {
            // this is mostly a guard against a desync between this function and `_map_contract_mode`
            throw new RunTimeError('Unhandled contract type')
        }
        let action
        let data;
        [action, buffer] = bytearray.decode_bytearray(buffer);
        [data, buffer] = bytearray.decode_bytearray(buffer)
        tx.action(action.toString())
        tx.data(data.toString())

    }

    tx.counter(new BN(buffer.slice(0, 8)))
    buffer = buffer.slice(8)

    if (signature_count_minus1 == 0x3F) {
        let additional_signatures;
        [additional_signatures, buffer] = bytearray.decode_bytearray(buffer)
        num_signatures = num_signatures + additional_signatures
    }
    const public_keys = []

    let pk
    for (let i = 0; i < num_signatures; i++) {
        [pk, buffer] = identity.decode_identity(buffer)
        public_keys.push(pk)
    }

    const signatures_serial_length = EXPECTED_SERIAL_SIGNATURE_LENGTH * num_signatures
    const expected_payload_end = Buffer.byteLength(input_buffer) - signatures_serial_length
    const payload_bytes = input_buffer.slice(0, expected_payload_end)
    const verified = []


    public_keys.forEach((ident) => {
        let identity, signature;
        [signature, buffer] = bytearray.decode_bytearray(buffer)
        identity = new Identity(ident)
        let payload_bytes_digest = _calc_digest_utf(payload_bytes)
        verified.push(identity.verify(payload_bytes_digest, signature))
        tx.add_signer(identity.public_key_hex())
    })

    const success = verified.every((verified) => verified === true)
    return [success, tx]
}

export {encode_transaction, decode_transaction}
