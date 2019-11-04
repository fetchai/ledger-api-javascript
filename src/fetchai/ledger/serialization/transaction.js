import assert from 'assert'
import * as address from './address'
import * as integer from './integer'
import * as bytearray from './bytearray'
import * as identity from './identity'
import {ValidationError} from '../errors'
import {RunTimeError} from '../errors'
import {logger} from '../utils'
import {createHash} from 'crypto'
import {BitVector} from '../bitvector'
import {Identity} from '../crypto/identity'
import {Transaction} from '../transaction'

// *******************************
// ********** Constants **********
// *******************************
const MAGIC = 0xa1
const VERSION = 1
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
	const digest = hash_func.digest()
	return digest
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
	const has_valid_from = payload._valid_from != 0

	let header0 = VERSION << 5 /// ??
	header0 |= (num_transfers > 0 ? 1 : 0) << 2
	header0 |= (num_transfers > 1 ? 1 : 0) << 1
	header0 |= has_valid_from ? 1 : 0
	// determine the mode of the contract
	const contract_mode = _map_contract_mode(payload)
	let header1 = contract_mode << 6
	header1 |= signalled_signatures & 0x3f
	let buffer = new Buffer([MAGIC, header0, header1])

	buffer = address.encode(buffer, payload.from_address())
	if (num_transfers > 1) {
		buffer = integer.encode(buffer, num_transfers - 2)
	}

	for (let [key, value] of Object.entries(payload._transfers)) {
		buffer = address.encode(buffer, key)
		buffer = integer.encode(buffer, value)
	}

	if (has_valid_from) {
		buffer = integer.encode(buffer, payload.valid_from())
	}

	buffer = integer.encode(buffer, payload.valid_until())
	buffer = integer.encode(buffer, payload.charge_rate())
	buffer = integer.encode(buffer, payload.charge_limit())
	if (NO_CONTRACT != contract_mode) {
		let shard_mask = payload.shard_mask()
		let shard_mask_length = shard_mask.__len__()
		if (shard_mask_length <= 1) {
			// signal this is a wildcard transaction
			buffer = Buffer.concat([buffer, new Buffer([0x80])])
		} else {

			let shard_mask_bytes = shard_mask.__bytes__()
			let log2_mask_length = log2(shard_mask_length)
			let contract_header

			if (shard_mask_length < 8) {

				assert(Buffer.byteLength(shard_mask_bytes) == 1)
				contract_header = shard_mask_bytes.readUIntBE(0, 1) & 0xf

				if (log2_mask_length == 2) {
					contract_header |= 0x10
				}

				// write the mask to the stream
				buffer = Buffer.concat([buffer, new Buffer([contract_header])])
			} else {
				assert(shard_mask_length <= 512)
				contract_header = 0x40 | ((log2_mask_length - 3) & 0x3f)
				buffer = Buffer.concat([buffer, new Buffer([contract_header])])
				buffer = Buffer.concat([buffer, shard_mask_bytes])
			}
		}

		if (SMART_CONTRACT == contract_mode || SYNERGETIC == contract_mode) {
			buffer = address.encode(buffer, payload.contract_digest())
			buffer = address.encode(buffer, payload.contract_address())
		} else if (CHAIN_CODE == contract_mode) {
			let encoded_chain_code = new Buffer(payload.chain_code(), 'ascii')
			buffer = bytearray.encode(buffer, encoded_chain_code)
		} else {
			assert(false)
		}

		buffer = bytearray.encode(
			buffer,
			new Buffer(payload.action(), 'ascii')
		)
		const data = new Buffer(payload.data(), 'utf8')
		buffer = bytearray.encode(buffer, data)
	}

	if (num_extra_signatures > 0) {
		buffer = integer.encode(buffer, num_extra_signatures)
	}

	// write all the signers public keys
	for (let signer of Object.keys(payload._signers)) {
		buffer = identity.encode(
			buffer,
			new Buffer(
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
				let hs = Buffer.from(sign_obj.signature)
				buffer = bytearray.encode(buffer, sign_obj.signature)
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

	const container = {buffer: buffer}
	// ensure the at the magic is correctly configured
	const magic = container.buffer.slice(0, 1)
	container.buffer = container.buffer.slice(1)
	const magic_integer = magic.readUIntBE(0, 1)

	if (magic_integer !== MAGIC) {
		throw new ValidationError('Missing signer signing set')
	}

	//extract the header bytes
	const header_first_buffer = container.buffer.slice(0, 1)
	const header_second_buffer = container.buffer.slice(1, 2)
	container.buffer = container.buffer.slice(2)

	const header_first = header_first_buffer.readUIntBE(0, 1)
	const header_second = header_second_buffer.readUIntBE(0, 1)
	const version = (header_first & 0xE0) >> 5
	const charge_unit_flag = Boolean((header_first & 0x08) >> 3)
	// assert(!charge_unit_flag);
	const transfer_flag = Boolean((header_first & 0x04) >> 2)
	const multiple_transfers_flag = Boolean((header_first & 0x02) >> 1)
	const valid_from_flag = Boolean((header_first & 0x01))
	const contract_type = (header_second & 0xC0) >> 6
	const signature_count_minus1 = (header_second & 0x3F)
	let num_signatures = signature_count_minus1 + 1

	if (version != VERSION) {
		throw new ValidationError('Unable to parse transaction from stream, incompatible version')
	}

	const tx = new Transaction()
	// decode the address from the buffer
	tx.from_address(address.decode(container))

	if (transfer_flag) {
		let transfer_count
		if (multiple_transfers_flag) {
			transfer_count = integer.decode(container) + 2
		} else {
			transfer_count = 1
		}

		let to, amount
		for (let i = 0; i < transfer_count; i++) {
			to = address.decode(container)
			amount = integer.decode(container)
			tx.add_transfer(to, amount)
		}
	}

	if (valid_from_flag) {
		tx.valid_from(integer.decode(container))
	}

	tx.valid_until(integer.decode(container))
	tx.charge_rate(integer.decode(container))

	//  assert not charge_unit_flag, "Currently the charge unit field is not supported"
	tx.charge_limit(integer.decode(container))
	if (contract_type != NO_CONTRACT) {

		const contract_header = container.buffer.slice(0, 1)
		container.buffer = container.buffer.slice(1)
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
				const toHex = (d) =>  ('0' + (Number(d).toString(16))).slice(-2).toUpperCase()
				let decoded_bytes = Buffer.from(toHex(contract_header_int & mask), 'hex')
				shard_mask = BitVector.from_bytes(decoded_bytes, bit_size)

			} else {
				const bit_length = 1 << ((contract_header_int & 0x3F) + 3)
				const byte_length = Math.floor(bit_length / 8)
				assert((bit_length % 8) == 0)  //this should be enforced as part of the spec
				shard_mask = BitVector.from_bytes(container.buffer.slice(0, byte_length), bit_length)
				container.buffer = container.buffer.slice(byte_length)
			}
		}
		if (contract_type == SMART_CONTRACT || contract_type == SYNERGETIC) {
			const contract_digest = address.decode(container)
			const contract_address = address.decode(container)
			tx.target_contract(contract_digest, contract_address, shard_mask)

		} else if (contract_type == CHAIN_CODE) {

			const encoded_chain_code_name = bytearray.decode(container)
			tx.target_chain_code(encoded_chain_code_name.toString(), shard_mask)
		} else {
			// this is mostly a guard against a desync between this function and `_map_contract_mode`
			throw new RunTimeError('Unhandled contract type')
		}
		tx.action(bytearray.decode(container).toString())
		tx.data(bytearray.decode(container).toString())

	}

	if (signature_count_minus1 == 0x3F) {
		const additional_signatures = integer.decode(container)
		num_signatures += additional_signatures
	}
	const public_keys = []

	let pk
	for (let i = 0; i < num_signatures; i++) {
		pk = identity.decode(container)
		public_keys.push(pk)
	}

	const signatures_serial_length = EXPECTED_SERIAL_SIGNATURE_LENGTH * num_signatures
	const expected_payload_end = Buffer.byteLength(buffer) - signatures_serial_length
	const payload_bytes = buffer.slice(0, expected_payload_end)
	const verified = []
	let temporyToDel
	let signature

	public_keys.forEach((ident) => {
		let identity
		signature = bytearray.decode(container)
		identity = new Identity(ident)
		let payload_bytes_digest = _calc_digest_utf(payload_bytes)
		temporyToDel = identity.verify(payload_bytes_digest, signature)
		verified.push(identity.verify(payload_bytes_digest, signature))
		tx.add_signer(identity.public_key_hex())
	})

	const every_flag = verified.every((flag) => flag === true)
	return [every_flag, tx]
}

export {encode_transaction, decode_transaction}
