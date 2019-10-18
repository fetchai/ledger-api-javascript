import { ApiError } from '../errors'
import { logger } from '../utils'
import { ApiEndpoint } from './common'
import { BitVector } from '../bitvector'
import { encode_transaction } from '../serialization/transaction'

/**
 * This class for all tokens operations
 *
 * @public
 * @class
 */
export class TokenApi extends ApiEndpoint {
	constructor(host, port) {
		logger.info(
			`Creating new Token api object with host:${host} and port:${port}`
		)
		super(host, port)
		this.API_PREFIX = 'fetch/token'
	}

	/**
     * Get the balance of address
     *
     * @public
     * @method
     * @param  {address} address for get the balance.
     */
	async balance(address) {
		logger.info(`request for check balance of address: ${address}`)

		// format and make the request
		let request = { address: String(address) }
		let data = await super._post_json('balance', request, this.API_PREFIX)
		logger.info(`Balance of ${address} is ${data.balance}`)

		if (!('balance' in data)) {
			throw new ApiError('Malformed response from server')
		}

		// return the balance
		return Number(data['balance'])
	}

	/**
     * Creates wealth for specified account
     *
     * @public
     * @method
     * @param  {address} The entity object to create wealth for
     * @param  {amount} The amount of wealth to be generated
     */
	async wealth(entity, amount) {
		logger.info(
			`request for creating wealth of address ${entity.public_key_hex()} for amount ${amount}`
		)

		// wildcard for the moment
		let shard_mask = new BitVector()
		let tx = await super.create_skeleton_tx(1)
		tx.from_address(entity.pubKey)
		tx.target_chain_code(this.API_PREFIX, shard_mask)
		tx.action = 'wealth'
		tx.add_signer(entity.public_key_hex())

		// format the transaction payload
		tx.data = super._encode_json({
			address: entity.public_key_hex(),
			amount: amount
		})
		logger.info(`Transactions object for sign and encode: ${JSON.stringify(tx, null, '\t')}`)

		// WIP:  encode and sign the transaction
		const encoded_tx = await encode_transaction(tx, [entity])
		logger.info(`Encoded Transactions ${encoded_tx}`)

		// WIP: submit the transaction
		return this._post_tx_json(encoded_tx, 'wealth')
	}
}
