import assert from 'assert'
import * as address from './address'
import * as integer from './integer'
import * as bytearray from './bytearray'
import * as identity from './identity'
import { ValidationError } from '../errors'
import { logger } from '../utils'
import { createHash } from 'crypto'

// *******************************
// ********** Constants **********
// *******************************
const MAGIC = 0xa1
const VERSION = 1

const NO_CONTRACT = 0
const SMART_CONTRACT = 1
const CHAIN_CODE = 2
const SYNERGETIC = 3

const log2 = value => {
	let count = 0
	while (value > 1) {
		value >>= 1
		count += 1
	}
	return count
}

const _map_contract_mode = payload => {
	if (payload.action) {
		if (payload.chain_code) {
			return CHAIN_CODE
		}
		assert(payload.contract_digest != null)

		return payload.contract_address ? SMART_CONTRACT : SYNERGETIC
	} else {
		return NO_CONTRACT
	}
}

// Encoded transaction payload
const encode_payload = payload => {
	const num_transfers = Object.keys(payload._transfers).length
	const num_signatures = Object.keys(payload._signers).length

	// sanity check
	assert(num_signatures >= 1)

	const num_extra_signatures =
        num_signatures > 0x40 ? num_signatures - 0x40 : 0
	const signalled_signatures = num_signatures - (num_extra_signatures + 1)
	const has_valid_from = payload._valid_from != 0

	let header0 = VERSION << 5
	header0 |= (num_transfers > 0 ? 1 : 0) << 2
	header0 |= (num_transfers > 0 ? 1 : 0) << 1
	header0 |= has_valid_from ? 1 : 0

	// determine the mode of the contract
	const contract_mode = _map_contract_mode(payload)
	let header1 = contract_mode << 6
	header1 |= signalled_signatures & 0x3f

	let buffer = new Buffer([MAGIC, header0, header1])

	// payload._from is hex of address
	buffer = address.encode(buffer, payload._from)
	if (num_transfers > 1) {
		buffer = integer.encode(buffer, num_transfers - 2)
	}

	for (let [key, value] of Object.entries(payload._transfers)) {
		buffer = address.encode(buffer, key)
		buffer = integer.encode(buffer, value)
	}

	if (has_valid_from) {
		buffer = integer.encode(buffer, payload._valid_from)
	}

	buffer = integer.encode(buffer, payload.valid_until)
	buffer = integer.encode(buffer, payload.charge_rate)
	buffer = integer.encode(buffer, payload.charge_limit)

	if (NO_CONTRACT != contract_mode) {
		let shard_mask_length = payload.shard_mask.length
		if (shard_mask_length <= 1) {
			// signal this is a wildcard transaction
			buffer = Buffer.concat([buffer, new Buffer([0x80])])
		} else {
			let shard_mask_bytes = new Buffer(payload.shard_mask)
			let log2_mask_length = log2(shard_mask_length)

			let contract_header
			if (shard_mask_length < 8) {
				assert(shard_mask_bytes.length == 1)

				contract_header = shard_mask_bytes[0] & 0xf

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
			buffer = address.encode(buffer, payload._contract_digest)
			buffer = address.encode(buffer, payload._contract_address)
		} else if (CHAIN_CODE == contract_mode) {
			let encoded_chain_code = new Buffer(payload._chain_code, 'ascii')
			buffer = bytearray.encode(buffer, encoded_chain_code)
		} else {
			assert(false)
		}
	}

	buffer = bytearray.encode(buffer, new Buffer(payload.action, 'ascii'))

	buffer = bytearray.encode(buffer, payload.data)

	if (num_extra_signatures > 0) {
		buffer = integer.encode(buffer, num_extra_signatures)
	}

	// write all the signers public keys
	for (let signer of Object.keys(payload._signers)) {
		// public key hex of signer
		buffer = identity.encode(buffer, new Buffer(signer, 'hex'))
	}

	logger.info(`\n encoded payload: ${buffer.toString('hex')} \n`)
	return buffer
}

// Encoded transaction
const encode_transaction = (payload, signers) => {
	// encode the contents of the transaction
	let buffer = encode_payload(payload)

	// append all the signatures of the signers in order
	for (let signer of Object.keys(payload._signers)) {
		if (!signer === signers.pubKey.toString('hex')) {
			throw new ValidationError('Missing signer signing set')
		}
		// extract the payload buffer
		let payload_bytes = createHash('sha256')
			.update(buffer.toString(), 'utf8')
			.digest()
		// sign the payload contents and add it to the buffer
		buffer = bytearray.encode(
			buffer,
			signers.sign(payload_bytes).signature
		)
	}
	logger.info(`\n encoded transaction: ${buffer.toString('hex')} \n`)
	// return the encoded transaction
	return buffer
}

export { encode_transaction }
