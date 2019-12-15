import {ApiError} from '../errors'
import {logger} from '../utils'
import {ApiEndpoint} from './common'
import {BitVector} from '../bitvector'
import {encode_transaction} from '../serialization/transaction'
import {Address} from '../crypto'
import {BN} from 'bn.js'

/**
 * This class for all Tokens APIs.
 *
 * @public
 * @class
 */
export class TokenApi extends ApiEndpoint {
    /**
     * Create new TokenApi object with host and port.
     * @constructor
     * @param {String} host ledger host
     * @param {Number} port ledger port
     */
    constructor(host, port) {
        logger.info(
            `Creating new Token api object with host:${host} and port:${port}`
        )
        super(host, port)
        this.API_PREFIX = 'fetch.token'
    }

    /**
     * Query the balance for a given address from the remote node.
     * @async
     * @method
     * @param {Object} address base64 encoded string containing the address of the node.
     * @returns {Number} The balance value retried.
     * @throws {ApiError} ApiError on any failures.
     */
    async balance(address) {
        logger.info(`request for check balance of address: ${address}`)
        // convert the input to an address
        address = new Address(address)
        // format and make the request
        let request = {address: address.toString()}

        let [, data] = await super._post_json('balance', request, this.prefix)
        logger.info(`Balance of ${address} is ${data.balance}`)

        if (!('balance' in data)) {
            throw new ApiError('Malformed response from server (no balance)')
        }

        // return the balance
        return data['balance']
    }

    /**
     *   :param address: The base58 encoded string containing the address of the node
        :return: The balance value retried
        :raises: ApiError on any failures
        Query the stake for a given address from the remote node
     */
   async stake(address) {
        // convert the input to an address
        address = new Address(address)

        // format and make the request
        const request = {
            'address': address.toString()
        }
        const [success, data] = await super._post_json('stake', request)

        // check for error cases
        if (!success) {
            throw new ApiError('Failed to request balance for address ' + address.toString())
        }

        if (!('stake' in data)) {
            throw new ApiError('Malformed response from server')
        }

        // return the balance
        return parseInt(data['stake'])
    }

    /**
     *   """
        Query the stake on cooldown for a given address from the remote node

        :param address: The base58 encoded string containing the address of the node
        :return: The balance value retried
        :raises: ApiError on any failures
        """
     */
    async stake_cooldown(address){
        // convert the input to an address
        address = new Address(address)

        // format and make the request
        const request = {
            'address': address.toString()
        }
        const [success, data] =  await super._post_json('cooldownStake', request)

        // check for error cases
        if(!success) {
            throw new ApiError('Failed to request cooldown stake for address ' + address.toString())
        }

        if (!('cooldownStake' in data)) {
            throw new ApiError('Malformed response from server')
        }
        // return the result
        return data
}



    /**
     * Creates wealth for specified account.
     * @async
     * @method
     * @param {Object} entity Entity object to create wealth for.
     * @param {Number} amount amount of wealth to be generated
     * @returns The digest of the submitted transaction.
     * @throws {ApiError} ApiError on any failures.
     */
    async wealth(entity, amount) {
        logger.info(
            `request for creating wealth of address ${entity.public_key_hex()} for amount ${amount}`
        )
        // wildcard for the moment
        let shard_mask = new BitVector()
        let tx = await super.create_skeleton_tx(1)
        tx.from_address(entity)
        tx.target_chain_code(this.API_PREFIX, shard_mask)
        tx.action('wealth')
        tx.add_signer(entity.public_key_hex())

        let s = `{"amount": ${amount}, "timestamp": ${Date.now()}}`
        tx.data(s)
        const encoded_tx = encode_transaction(tx, [entity])

        // submit the transaction
        return await this._post_tx_json(encoded_tx, 'wealth')
    }

    /**
     *  """
        Sets the deed for a multi-sig account

        :param entity: The entity object to create wealth for
        :param deed: The deed to set
        :param signatories: The entities that will sign this action
        :return: The digest of the submitted transaction
        :raises: ApiError on any failures
        """
     * @param entity
     * @param deed
     * @param signatories
     */
    async deed(entity, deed, signatories = null){

        const ENDPOINT = 'deed'

        const tx = await TokenTxFactory.deed(entity, deed, signatories)
        await super.set_validity_period(tx)

        signatories = (signatories === null)? [entity] : signatories;
       const encoded_tx = encode_transaction(tx, signatories)
        return await super._post_tx_json(encoded_tx, ENDPOINT)
}
    /**
     * Transfers wealth from one account to another account.
     * @param {Object} entity Entity bytes of the private key of the source address.
     * @param {Object} to to bytes of the targeted address to send funds to.
     * @param {Number} amount amount of funds being transferred.
     * @param {Number} fee fee associated with the transfer.
     * @returns The digest of the submitted transaction.
     * @throws {ApiError} ApiError on any failures.
     */
    async transfer(entity, to, amount, fee) {
        // format the data to be closed by the transaction
        logger.info(
            `request for transferring ${amount} wealth from ${entity.public_key_hex()} to ${to} with fee ${fee}`
        )

        // build up the basic transaction information
        let tx = await super.create_skeleton_tx(fee)
        tx.from_address(entity) //hex of address
        tx.add_transfer(to, new BN(amount))
        tx.add_signer(entity.public_key_hex()) // hex of public key

        const encoded = super._encode_json({
            address: entity.public_key(), //base64 encoded public key
            amount: amount
        })
        tx.data(encoded)

        const encoded_tx = encode_transaction(tx, [entity])

        // submit the transaction
        return await this._post_tx_json(encoded_tx, 'transfer')
    }


      add_stake(entity, amount: int, fee: int):
        """
        Stakes a specific amount of

        :param entity: The entity object that desires to stake
        :param amount: The amount to stake
        :return: The digest of the submitted transaction
        :raises: ApiError on any failures
        """

        ENDPOINT = 'addStake'

        tx = TokenTxFactory.add_stake(entity, amount, fee)
        self._set_validity_period(tx)

        // encode and sign the transaction
        encoded_tx = transaction.encode_transaction(tx, [entity])

        // submit the transaction
        return self._post_tx_json(encoded_tx, ENDPOINT)

    /**
     * """
        Destakes a specific amount of tokens from a staking miner. This will put the
        tokens in a cool down period

        :param entity: The entity object that desires to destake
        :param amount: The amount of tokens to destake
        :return: The digest of the submitted transaction
        :raises: ApiError on any failures
        """
     * @param self
     * @param entity
     * @param amount
     * @param fee
     */
     de_stake(self, entity: Entity, amount: int, fee: int) {


       const ENDPOINT = 'deStake'

        tx = TokenTxFactory.de_stake(entity, amount, fee)
        self._set_validity_period(tx)

        // encode and sign the transaction
        encoded_tx = transaction.encode_transaction(tx, [entity])

        // submit the transaction
        return self._post_tx_json(encoded_tx, ENDPOINT)

     collect_stake(self, entity: Entity, fee: int):
        """
        Collect all stakes that have reached the end of the cooldown period

        :param entity: The entity object that desires to collect
        :return: The digest of the submitted transaction
        :raises: ApiError on any failures
        """

        ENDPOINT = 'collectStake'

        tx = TokenTxFactory.collect_stake(entity, fee)
        self._set_validity_period(tx)

        // encode and sign the transaction
        encoded_tx = transaction.encode_transaction(tx, [entity])

        // submit the transaction
        return self._post_tx_json(encoded_tx, ENDPOINT)



}
