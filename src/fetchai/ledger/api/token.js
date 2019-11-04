import {ApiError} from '../errors'
import {logger} from '../utils'
import {ApiEndpoint} from './common'
import {BitVector} from '../bitvector'
import {encode_transaction} from '../serialization/transaction'
import { Address } from '../crypto/address'

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
        this.API_PREFIX = 'fetch.token'
    }

    /**
     * Query the balance for a given address from the remote node
     *
     * @public
     * @method
     * @param  {address} The base64 encoded string containing the address of the node
     */
    async balance(address) {

        // format and make the request
        address =  new Address(address.privKey)
        let request = { address: address._display }
        logger.info(`request for check balance of address: ${address._display}`)
        let data = await super._post_json('balance', request, this.prefix)
        logger.info(`Balance of ${address} is ${data.balance}`)

        if (!('balance' in data)) {
            logger.error('No response data from server.')
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

        let address =  new Address(entity.privKey)
        // wildcard for the moment
        let shard_mask = new BitVector()
        let tx = await super.create_skeleton_tx(1)
        tx.from_address(address._address) //hex of address
        tx.target_chain_code(this.API_PREFIX, shard_mask)
        tx.action = 'wealth'
        tx.add_signer(entity.public_key_hex()) // hex of public key

        // format the transaction payload
        tx.data = super._encode_json({
            address: entity.pubKey.toString('base64'), //base64 encoded public key
            amount: amount
        })
        logger.info(
            `Transactions object for sign and encode: ${JSON.stringify(
                tx,
                null,
                '\t'
            )}`
        )

        // encode and sign the transaction
        const encoded_tx = encode_transaction(tx, entity)

        // submit the transaction
        return await this._post_tx_json(encoded_tx, 'wealth')
    }

    /**
     * Transfers wealth from one account to another account
     *
     * @public
     * @method
     * @param  {entity} The bytes of the private key of the source address
     * @param  {to} The bytes of the targeted address to send funds to
     * @param  {amount} The amount of funds being transferred
     * @param  {fee} The fee associated with the transfer
     */
    async transfer(entity, to, amount, fee) {
        // format the data to be closed by the transaction
        logger.info(
            `request for transferring ${amount} wealth from ${entity.public_key_hex()} to ${to} with fee ${fee}`
        )

        let address =  new Address(entity.privKey)
        // build up the basic transaction information
        let tx = await super.create_skeleton_tx(fee)
        tx.from_address(address._address) //hex of address
        tx.add_transfer(to, amount)
        tx.add_signer(entity.public_key_hex()) // hex of public key

        // format the transaction payload
        tx.data = super._encode_json({
            address: entity.pubKey.toString('base64'), //base64 encoded public key
            amount: amount
        })
        logger.info(
            `Transactions object for sign and encode: ${JSON.stringify(
                tx,
                null,
                '\t'
            )}`
        )

        // encode and sign the transaction
        const encoded_tx = encode_transaction(tx, entity)

        // submit the transaction
        return await this._post_tx_json(encoded_tx, 'transfer')
    }
}

// Important
process.on('unhandledRejection', reason => {
    console.log('Error details:', reason || reason.stack)
})
