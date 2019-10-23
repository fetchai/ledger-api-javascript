import assert from 'assert'
import * as address from './address'
import * as integer from './integer'
import * as bytearray from './bytearray'
import * as identity from './identity'
import { ValidationError } from '../errors'
import { RunTimeError } from '../errors'
import { logger } from '../utils'
import { createHash } from 'crypto'
import { BitVector } from '../bitvector'
import { Identity } from '../crypto/identity'


// *******************************
// ********** Constants **********
// *******************************
const MAGIC = 0xa1
const VERSION = 1
const BYTE_LENGTH = 32;

const NO_CONTRACT = 0
const SMART_CONTRACT = 1
const CHAIN_CODE = 2
const SYNERGETIC = 3
const UNCOMPRESSED_SCEP256K1_PUBLIC_KEY_LEN = 64;

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
        num_signatures > 0x40 ? (num_signatures - 0x40) : 0
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
		buffer =  integer.encode(buffer, num_transfers - 2)
	}

	for (let [key, value] of Object.entries(payload._transfers)) {
		buffer = address.encode(buffer, key)
		buffer = integer.encode(buffer, value)
	}

	if (has_valid_from) {
		buffer =  integer.encode(buffer, payload._valid_from)
	}

	buffer =  integer.encode(buffer, payload.valid_until)
	buffer =  integer.encode(buffer, payload.charge_rate)
	buffer =  integer.encode(buffer, payload.charge_limit)

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
			buffer =  address.encode(buffer, payload._contract_digest)
			buffer =  address.encode(buffer, payload._contract_address)
		} else if (CHAIN_CODE == contract_mode) {
			let encoded_chain_code = new Buffer(payload._chain_code, 'ascii')
			buffer =  bytearray.encode(buffer, encoded_chain_code)
		} else {
			assert(false)
		}
	}


	buffer =  bytearray.encode(
		buffer,
		new Buffer(payload.action, 'ascii')
	)

	buffer = bytearray.encode(buffer, payload.data)


	if (num_extra_signatures > 0) {
		buffer =  integer.encode(buffer, num_extra_signatures)
	}

	// write all the signers public keys
	for (let signer of Object.keys(payload._signers)) {
		// public key hex of signer
		buffer =  identity.encode(
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

// Encoded transaction
const encode_transaction =  (payload, signers) => {
	// encode the contents of the transaction
	let buffer = encode_payload(payload)

	// append all the signatures of the signers in order
	for  (let signer of Object.keys(payload._signers)) {
		if (!signer === signers.pubKey.toString('hex')) {
			throw new ValidationError('Missing signer signing set')
		}
		// extract the payload buffer
		let payload_bytes = createHash('sha256')
			.update(buffer.toString(), 'utf8')
			.digest()
		// sign the payload contents and add it to the buffer
		buffer =  bytearray.encode(
			buffer,
			signers.sign(payload_bytes).signature
		)
	}
	logger.info(`\n encoded transaction: ${buffer.toString('hex')} \n`)
	// return the encoded transaction
	return buffer
}


const decode_transaction = (buffer) => {
    const container = { buffer: buffer };
    // ensure the at the magic is correctly configured
    const magic = container.buffer.slice(0,1);
    container.buffer = container.buffer.slice(1);

    if(magic !== MAGIC){
         throw new ValidationError('Missing signer signing set')
    }

    //extract the header bytes
     const header = container.buffer.slice(2);

    // parse the header types
    const version = (header[0] & 0xE0) >> 5;
    const charge_unit_flag = bool((header[0] & 0x08) >> 3);
    const transfer_flag = bool((header[0] & 0x04) >> 2);
    const multiple_transfers_flag = bool((header[0] & 0x02) >> 1);
    const valid_from_flag = bool((header[0] & 0x01));
    const contract_type = (header[1] & 0xC0) >> 6;
    const signature_count_minus1 = (header[1] & 0x3F);
    let num_signatures = signature_count_minus1 + 1;

     if(version != VERSION) {
         throw new RunTimeError('Unable to parse transaction from stream, incompatible version');
     }

    const tx = Transaction();
    // decode the address from the buffer

    tx.from_address = address.decode(buffer);
    buffer = buffer.slice(0, BYTE_LENGTH);

     if(transfer_flag){

         if(multiple_transfers_flag){
             let transfer_count = integer.decode(container) + 2;
         } else {
             let transfer_count = 1;
         }

         let to, amount;

         for(let i =0; i < transfer_count; i++){
             to = address.decode(buffer);
             container.buffer = container.buffer.slice(BYTE_LENGTH);
             amount = integer.decode(container);
             tx.add_transfer(to, amount);
         }
     }

     if(valid_from_flag){
         tx.valid_from = integer.decode(container);
           const value = container.buffer.slice(1);
           // then return the length of bytes specified in the header
           value.slice(0, len);
     }

    tx.valid_until = integer.decode(container.buffer)
    tx.charge_rate = integer.decode(container.buffer)

    //  assert not charge_unit_flag, "Currently the charge unit field is not supported"

    tx.charge_limit = integer.decode(container.buffer)

    if (contract_type != NO_CONTRACT){
        // these two lines are for this one line: const contract_header = int(stream.read(1)[0])
         const contract_header = container.buffer.slice(0, 1);
         container.buffer = container.buffer.slice(1);
         const wildcard = Boolean(contract_header & 0x80);
         const shard_mask = new BitVector();

         if(!wildcard){
             const extended_shard_mask_flag = Boolean(contract_header & 0x40);
             let shard_mask;

             if(!extended_shard_mask_flag){
                 let mask, bit_size;
                 if(contract_header & 0x40){
                     mask = 0xf
                     bit_size = 4
                 } else {
                      mask = 0x3
                      bit_size = 2
                 }

                // extract the shard mask from the header
                const hex_data = contract_header & mask;
                const data = Buffer.from(hex_data, 'hex');
                shard_mask = BitVector.from_bytes(data, bit_size);

             } else {
                 const bit_length = 1 << ((contract_header & 0x3F) + 3)
                 const byte_length = bit_length // 8

                assert((bit_length % 8) == 0)  //this should be enforced as part of the spec
                // extract the mask from the next N bytes
                shard_mask = BitVector.from_bytes(byte_length, bit_length)
             }

              if (contract_type == SMART_CONTRACT || contract_type == SYNERGETIC)
             {
                 const contract_digest = address.decode(container)
                 const contract_address = address.decode(container)
                 tx.target_contract(contract_digest, contract_address, shard_mask)

             } else if (contract_type == CHAIN_CODE) {

                 const encoded_chain_code_name = bytearray.decode(container)
                 tx.target_chain_code(encoded_chain_code_name.decode('ascii'), shard_mask)
             } else {
            // this is mostly a guard against a desync between this function and `_map_contract_mode`
            throw new RunTimeError("Unhandled contract type");
            }

        tx.action = bytearray.decode(container).decode('ascii')
        tx.data = bytearray.decode(container)

         }
    }

     if (signature_count_minus1 == 0x3F){
         const additional_signatures = integer.decode(container);
         num_signatures += additional_signatures;
     }

     // extract all the signing public keys from the stream
     const public_keys = {};
     // we take the value we are tracking out the container
     let temp_buffer = container.buffer;
     let pk;
      for(let i =0; i < num_signatures; i++){
            pk = identity.decode(temp_buffer);
            public_keys.push(pk);
            // pop the header
            temp_buffer = temp_buffer.slice(1);
            // already taken header, now take the rest
            temp_buffer = temp_buffer.slice(UNCOMPRESSED_SCEP256K1_PUBLIC_KEY_LEN +1)
      }
      // we pass it back into the container
      container.buffer = temp_buffer;

    //extract full copy of the payload
    /// this python line: payload_bytes = stream.getvalue()[:stream.tell()]
    const payload_bytes = container.buffer;
      const verified = [];
      let temporyToDel;
      let signature;
      public_keys.forEach((Ident) => {
          // for n in range(num_signatures):
        // extract the signature from the stream
      signature = bytearray.decode(container);
       // verify if this signature is correct
      temporyToDel = ident.verify(payload_bytes, signature);
      verified.push(temporyToDel);
      // build a metadata object to store in the tx
      Ident

      });

    /**
    for ident in public_keys:
        # for n in range(num_signatures):

        # extract the signature from the stream
        signature = bytearray.decode(stream)

        # verify if this signature is correct
        verified.append(ident.verify(payload_bytes, signature))

        # build a metadata object to store in the tx
        tx._signers[ident] = {
            'signature': signature,
            'verified': verified[-1],
        }

    return all(verified), tx
     */
        // if this works directly return it.
   const v = verified.every((flag) => flag === true);

    return [v , tx];


}

/**
 *
def decode_transaction(stream: io.BytesIO) -> (bool, Transaction):
    # ensure the at the magic is correctly configured
    magic = stream.read(1)[0]
    if magic != MAGIC:
        raise RuntimeError('Unable to parse transaction from stream, invalid magic')

    # extract the header bytes
    header = stream.read(2)

    # parse the header types
    version = (header[0] & 0xE0) >> 5
    charge_unit_flag = bool((header[0] & 0x08) >> 3)
    transfer_flag = bool((header[0] & 0x04) >> 2)
    multiple_transfers_flag = bool((header[0] & 0x02) >> 1)
    valid_from_flag = bool((header[0] & 0x01))

    contract_type = (header[1] & 0xC0) >> 6
    signature_count_minus1 = (header[1] & 0x3F)

    num_signatures = signature_count_minus1 + 1

    # ensure that the version is correct
    if version != VERSION:
        raise RuntimeError('Unable to parse transaction from stream, incompatible version')

    tx = Transaction()

    # decode the address from the thread
    tx.from_address = address.decode(stream)

    if transfer_flag:

        # determine the number of transfers that are present in the transaction
        if multiple_transfers_flag:
            transfer_count = integer.decode(stream) + 2
        else:
            transfer_count = 1

        for n in range(transfer_count):
            to = address.decode(stream)
            amount = integer.decode(stream)

            tx.add_transfer(to, amount)

    if valid_from_flag:
        tx.valid_from = integer.decode(stream)

    tx.valid_until = integer.decode(stream)
    tx.charge_rate = integer.decode(stream)

    assert not charge_unit_flag, "Currently the charge unit field is not supported"

    tx.charge_limit = integer.decode(stream)

    if contract_type != NO_CONTRACT:
        contract_header = int(stream.read(1)[0])

        wildcard = bool(contract_header & 0x80)

        shard_mask = BitVector()
        if not wildcard:
            extended_shard_mask_flag = bool(contract_header & 0x40)

            if not extended_shard_mask_flag:

                if contract_header & 0x10:
                    mask = 0xf
                    bit_size = 4
                else:
                    mask = 0x3
                    bit_size = 2

                # extract the shard mask from the header
                shard_mask = BitVector.from_bytes(bytes([contract_header & mask]), bit_size)

            else:
                bit_length = 1 << ((contract_header & 0x3F) + 3)
                byte_length = bit_length // 8

                assert (bit_length % 8) == 0  # this should be enforced as part of the spec

                # extract the mask from the next N bytes
                shard_mask = BitVector.from_bytes(stream.read(byte_length), bit_length)

        if contract_type == SMART_CONTRACT or contract_type == SYNERGETIC:
            contract_digest = address.decode(stream)
            contract_address = address.decode(stream)

            tx.target_contract(contract_digest, contract_address, shard_mask)

        elif contract_type == CHAIN_CODE:
            encoded_chain_code_name = bytearray.decode(stream)

            tx.target_chain_code(encoded_chain_code_name.decode('ascii'), shard_mask)

        else:
            # this is mostly a guard against a desync between this function and `_map_contract_mode`
            raise RuntimeError("Unhandled contract type")

        tx.action = bytearray.decode(stream).decode('ascii')
        tx.data = bytearray.decode(stream)

    if signature_count_minus1 == 0x3F:
        additional_signatures = integer.decode(stream)
        num_signatures += additional_signatures

    # extract all the signing public keys from the stream
    public_keys = [identity.decode(stream) for _ in range(num_signatures)]

    # extract full copy of the payload
    payload_bytes = stream.getvalue()[:stream.tell()]

    verified = []
    for ident in public_keys:
        # for n in range(num_signatures):

        # extract the signature from the stream
        signature = bytearray.decode(stream)

        # verify if this signature is correct
        verified.append(ident.verify(payload_bytes, signature))

        # build a metadata object to store in the tx
        tx._signers[ident] = {
            'signature': signature,
            'verified': verified[-1],
        }

    return all(verified), tx
 */


export { encode_transaction, decode_transaction }
