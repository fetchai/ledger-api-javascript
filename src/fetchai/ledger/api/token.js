import {ApiError} from '../errors'
import {logger} from '../utils'
import {ApiEndpoint, TransactionFactory} from './common'
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
    constructor(host, port, api) {
        logger.info(
            `Creating new Token api object with host:${host} and port:${port}`
        )
        super(host, port, api)
        this.prefix = 'fetch.token'
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

        let [, data] = await super.post_json('balance', request, this.prefix)
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
        const [success, data] = await super.post_json('stake', request)

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
     * Query the stake on cooldown for a given address from the remote node
     *
     * @param address  The base58 encoded string containing the address of the node
     * @returns {Promise<void>}
     */
    async stake_cooldown(address) {
        // convert the input to an address
        address = new Address(address)

        // format and make the request
        const request = {
            'address': address.toString()
        }
        const [success, data] = await super.post_json('cooldownStake', request)

        // check for error cases
        if (!success) {
            throw new ApiError('Failed to request cooldown stake for address ' + address.toString())
        }

        if (!('cooldownStake' in data)) {
            throw new ApiError('Malformed response from server')
        }
        // return the result
        return data
    }

    /**
     * Sets the deed for a multi-sig account
     *
     * @param entity The entity object to create deed for
     * @param deed The deed to set
     * @param signatories The entities that will sign this action
     * @param allow_no_amend if true will not be able to ammend deed
     * @returns {Promise<*>} The digest of the submitted transaction
     */
    async deed(entity, deed, signatories = null, allow_no_amend = false) {

        const ENDPOINT = 'deed'
        const tx = await TokenTxFactory.deed(entity, deed, signatories, allow_no_amend)
        await super.set_validity_period(tx)

        signatories = (signatories === null) ? [entity] : signatories;
        const encoded_tx = encode_transaction(tx, signatories)
        return await super.post_tx_json(encoded_tx, ENDPOINT)
    }

    /**
     * Transfers FET from one account to another account.
     * @param {Object} entity Entity bytes of the private key of the source address.
     * @param {Object} to to bytes of the targeted address to send funds to.
     * @param {Number} amount amount of funds being transferred.
     * @param {Number} fee fee associated with the transfer.
     * @returns The digest of the submitted transaction.
     * @throws {ApiError} ApiError on any failures.
     */
    async transfer(entity, to, amount, fee, signatories = null) {
        const ENDPOINT = 'transfer'

        const tx = TokenTxFactory.transfer(entity, to, amount, fee, signatories)
        await this.set_validity_period(tx)

        // encode and sign the transaction

        if(signatories == null){
            signatories = [entity]
        }
        const encoded_tx = encode_transaction(tx, signatories)
        //submit the transaction
        return await this.post_tx_json(encoded_tx, ENDPOINT)
    }

    /**
     * Stakes a specific amount of
     *
     * @param entity The entity object that desires to stake
     * @param amount The amount to stake
     * @param fee
     */
    async add_stake(entity, amount, fee) {
        const ENDPOINT = 'addStake'
        const tx = await TokenTxFactory.add_stake(entity, amount, fee)
        await super.set_validity_period(tx)
        // encode and sign the transaction
        const encoded_tx = encode_transaction(tx, [entity])
        // submit the transaction
        return await super.post_tx_json(encoded_tx, ENDPOINT)
    }

    /**
     * Destakes a specific amount of tokens from a staking miner. This will put the tokens in a cool down period
     *
     * @param entity The entity object that desires to destake
     * @param amount The amount of tokens to destake
     * @param fee
     * @returns {Promise<*>} The digest of the submitted transaction
     */
    async de_stake(entity, amount, fee) {
        const ENDPOINT = 'deStake'

        const tx = TokenTxFactory.de_stake(entity, amount, fee)
        await super.set_validity_period(tx)

        // encode and sign the transaction
        const encoded_tx = encode_transaction(tx, [entity])

        // submit the transaction
        return await super.post_tx_json(encoded_tx, ENDPOINT)
    }

    /**
     * Collect all stakes that have reached the end of the cooldown period
     *
     * @param entity The entity object that desires to collect
     * @param fee
     * @returns {Promise<*>}
     */
    async collect_stake(entity, fee) {
        const ENDPOINT = 'collectStake'
        const tx = TokenTxFactory.collect_stake(entity, fee)
        await super.set_validity_period(tx)
        // encode and sign the transaction
        const encoded_tx = encode_transaction(tx, [entity])
        // submit the transaction
        return await super.post_tx_json(encoded_tx, ENDPOINT)
    }

}

export class TokenTxFactory extends TransactionFactory {

    constructor() {
        super('fetch.token')
        this.prefix = 'fetch.token'
    }

    static deed(entity, deed, signatories = null, allow_no_amend = false) {
        const tx = TransactionFactory.create_action_tx(10000, entity,'deed', 'fetch.token')

        if (signatories !== null) {

            signatories.forEach(sig => tx.add_signer(sig.public_key_hex()))
        } else {
            tx.add_signer(entity.public_key_hex())
        }
        const deed_json = deed.deed_creation_json(allow_no_amend)
        tx.data(JSON.stringify(deed_json))
        return tx
    }

    static transfer(entity, to, amount, fee, signatories = null) {

        // build up the basic transaction information
        const tx = super.create_skeleton_tx(fee)
        tx.from_address(new Address(entity))
        tx.add_transfer(to, new BN(amount))
        if (signatories !== null) {
            signatories.forEach((ent) => tx.add_signer(ent.public_key_hex()))
        } else {
            tx.add_signer(entity.public_key_hex())
        }
        return tx
    }

    static add_stake(entity, amount, fee, signatories = null) {
        // build up the basic transaction information
        const tx = TransactionFactory.create_action_tx(fee, entity, 'addStake', 'fetch.token')

        if (signatories !== null) {
            signatories.forEach((ent) => tx.add_signer(ent.public_key_hex()))
        } else {
            tx.add_signer(entity.public_key_hex())
        }

        const encoded = JSON.stringify({
            address: entity.public_key_base64(), //base64 encoded public key
            amount: amount
        })

        tx.data(encoded)
        return tx
    }

    static de_stake(entity, amount, fee, signatories = null) {
        // build up the basic transaction information
        const tx = TransactionFactory.create_action_tx(fee, entity, 'deStake', 'fetch.token')

        if (signatories !== null) {
            signatories.forEach((ent) => tx.add_signer(ent.public_key_hex()))
        } else {
            tx.add_signer(entity.public_key_hex())
        }

        // format the transaction payload
        tx.data(JSON.stringify({
            'address': entity.public_key_base64(),
            'amount': amount
        }))

        return tx
    }

    static collect_stake(entity, fee, signatories = null) {
        // build up the basic transaction information
        const tx = TransactionFactory.create_action_tx(fee, entity, 'collectStake', 'fetch.token')

        if (signatories !== null) {
            signatories.forEach((ent) => tx.add_signer(ent.public_key_hex()))
        } else {
            tx.add_signer(entity.public_key_hex())
        }
        return tx
    }
}
