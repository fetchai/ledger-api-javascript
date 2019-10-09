import { ApiError } from '../errors'
import { logger } from '../utils'
import { ApiEndpoint } from './common'
import { BitVector } from '../bitvector'

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
	async wealth(address, amount) {
		logger.info(
			`request for creating wealth of address ${address} for amount ${amount}`
		)

		// wildcard for the moment
		let shard_mask = new BitVector()
		let tx = super.create_skeleton_tx(1)
		tx.target_chain_code(this.API_PREFIX, shard_mask)
		tx.action = 'wealth'
		tx.add_signer(address)

		// format the transaction payload
		tx.data = super._encode_json({
			address: address,
			amount: amount
		})

		// Todo:  encode and sign the transaction
		// let encoded_tx = encode_transaction(tx, [entity])

		// Todo: submit the transaction
		// return this._post_tx_json(encoded_tx, endpoint)
	}
}
