import {ApiError, ValidationError} from '../errors'
import {convert_number, logger} from '../utils'
import {ApiEndpoint, TransactionFactory} from './common'
import {encode_transaction} from '../serialization/transaction'
import {Address} from '../crypto/address'
import {Entity} from '../crypto/entity'
import {BN} from 'bn.js'
import assert from 'assert'
import {Transaction} from "../transaction";
import {Deed} from "../crypto/deed";





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
    constructor(host, port, api?) {
        super(host, port, api)
        this.prefix = PREFIX.TOKEN
    }

    /**
     * Query the balance for a given address from the remote node.
     * @async
     * @method
     * @param {Object} address base64 encoded string containing the address of the node.
     * @returns {Number} The balance value retried.
     * @throws {ApiError} ApiError on any failures.
     */
    async balance(address: AddressLike) : BN {
        // convert the input to an address
        address = new Address(address)
        // format and make the request
        let request = {address: address.toString()}

        let [, data] = await super.post_json(ENDPOINT.BALANCE, request, this.prefix)

        if (!('balance' in data)) {
            throw new ApiError('Malformed response from server (no balance)')
        }

        // return the balance
        return new BN(data['balance'])
    }

    /**
     *
     * @param address
     * @returns {Promise<BN|BN.props>}
     */
    async stake(address: AddressLike) : BN {
        // convert the input to an address
        address = new Address(address)

        // format and make the request
        const request = {
            'address': address.toString()
        }
        const [success, data] = await super.post_json(ENDPOINT.STAKE, request)

        // check for error cases
        if (!success) {
            throw new ApiError('Failed to request balance for address ' + address.toString())
        }

        if (!('stake' in data)) {
            throw new ApiError('Malformed response from server')
        }

        // return the balance
        return new BN(data['stake'])
    }

    /**
     * Query the stake on cooldown for a given address from the remote node
     *
     * @param address  The base58 encoded string containing the address of the node
     * @returns {Promise<void>}
     */
    async stake_cooldown(address: AddressLike) : Promise<any> {
        // convert the input to an address
        address = new Address(address)

        const request = {
            'address': address.toString()
        }
        const [success, data] = await super.post_json(ENDPOINT.COOLDOWNSTAKE, request)

        // check for error cases
        if (!success) {
            throw new ApiError('Failed to request cooldown stake for address ' + address.toString())
        }

        if (!('cooldownStake' in data)) {
            throw new ApiError('Malformed response from server')
        }
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
    async deed(entity: Entity, deed: Deed, signatories: Entity[] | null = null, allow_no_amend : boolean = false) : Promise<any | null> {

        const tx = await TokenTxFactory.deed(entity, deed, signatories, allow_no_amend)
        await super.set_validity_period(tx)

        signatories = (signatories === null) ? [entity] : signatories
        const encoded_tx = encode_transaction(tx, signatories)
        return await super.post_tx_json(encoded_tx, ENDPOINT.DEED)
    }

    /**
     * Transfers FET from one account to another account.
     *
     * @param {Object} entity Entity bytes of the private key of the source address.
     * @param {Object} to to bytes of the targeted address to send funds to.
     * @param {Number} amount amount of funds being transferred.
     * @param {Number} fee fee associated with the transfer.
     * @returns The digest of the submitted transaction.
     * @throws {ApiError} ApiError on any failures.
     */
    async transfer(entity: Entity, to: AddressLike, amount: NumericInput, fee: NumericInput, signatories: Entity[] | null = null) : Promise<any | null> {
        amount = convert_number(amount)
        fee = convert_number(fee)
        const tx = TokenTxFactory.transfer(entity, to, amount, fee, signatories)
        await this.set_validity_period(tx)
        if (signatories == null) {
            signatories = [entity]
        }
        const encoded_tx = encode_transaction(tx, signatories)
        //submit the transaction
        return await this.post_tx_json(encoded_tx, ENDPOINT.TRANSFER)
    }

    /**
     * Stakes a specific amount of
     *
     * @param entity The entity object that desires to stake
     * @param amount The amount to stake
     * @param fee
     */
    async add_stake(entity: Entity, amount: NumericInput, fee: NumericInput)  : Promise<any | null> {
        amount = convert_number(amount)
        fee = convert_number(fee)
        const tx = await TokenTxFactory.add_stake(entity, amount, fee)
        await super.set_validity_period(tx)
        // encode and sign the transaction
        const encoded_tx = encode_transaction(tx, [entity])
        // submit the transaction
        return await super.post_tx_json(encoded_tx, ENDPOINT.ADDSTAKE)
    }

    /**
     * Destakes a specific amount of tokens from a staking miner. This will put the tokens in a cool down period
     *
     * @param entity The entity object that desires to destake
     * @param amount The amount of tokens to destake
     * @param fee
     * @returns {Promise<*>} The digest of the submitted transaction
     */
    async de_stake(entity, amount:  NumericInput, fee: NumericInput) : Promise<any | null> {
        fee = convert_number(fee)
        amount = convert_number(amount)
        const tx = TokenTxFactory.de_stake(entity, amount, fee)
        await super.set_validity_period(tx)
        // encode and sign the transaction
        const encoded_tx = encode_transaction(tx, [entity])
        // submit the transaction
        return await super.post_tx_json(encoded_tx, ENDPOINT.DESTAKE)
    }

    /**
     * Collect all stakes that have reached the end of the cooldown period
     *
     * @param entity The entity object that desires to collect
     * @param fee
     * @returns {Promise<*>}
     */
    async collect_stake(entity: Entity, fee: NumericInput) {
        fee = convert_number(fee)
        const tx = TokenTxFactory.collect_stake(entity, fee)
        await super.set_validity_period(tx)
        // encode and sign the transaction
        const encoded_tx = encode_transaction(tx, [entity])
        // submit the transaction
        return await super.post_tx_json(encoded_tx, ENDPOINT.COLLECTSTAKE)
    }

}

export class TokenTxFactory extends TransactionFactory {
	public prefix: PREFIX;

    constructor() {
        super()
        this.prefix = PREFIX.TOKEN
    }

    static deed(entity: Entity, deed: Deed, signatories : Array<Entity> | null = null, allow_no_amend: boolean = false) : Transaction {
        const tx = TransactionFactory.create_action_tx(10000, entity, ENDPOINT.DEED, PREFIX.TOKEN)

        if (signatories !== null) {

            signatories.forEach(sig => tx.add_signer(sig.public_key_hex()))
        } else {
            tx.add_signer(entity.public_key_hex())
        }
        const deed_json = deed.deed_creation_json(allow_no_amend)
        tx.data(JSON.stringify(deed_json))
        return tx
    }

    static transfer(entity: Entity, to: AddressLike, amount: NumericInput, fee: NumericInput, signatories: Array<Entity> | null = null) : Transaction {
        fee = convert_number(fee)
        amount = convert_number(amount)
        // build up the basic transaction information
        const tx = super.create_skeleton_tx(fee)
        tx.from_address(new Address(entity))
        tx.add_transfer(to, amount)
        if (signatories !== null) {
            signatories.forEach((ent) => tx.add_signer(ent.public_key_hex()))
        } else {
            tx.add_signer(entity.public_key_hex())
        }
        return tx
    }

    static add_stake(entity: Entity, amount: BN, fee: BN, signatories: Entity[] | null = null) : Transaction {
        // build up the basic transaction information
        fee = convert_number(fee)
        amount = convert_number(amount)

        const tx = TransactionFactory.create_action_tx(fee, entity, ENDPOINT.ADDSTAKE, 'fetch.token')

        if (signatories !== null) {
            signatories.forEach((ent) => tx.add_signer(ent.public_key_hex()))
        } else {
            tx.add_signer(entity.public_key_hex())
        }

        const encoded = JSON.stringify({
            address: entity.public_key_base64(),
            amount: amount.toNumber()
        })

        tx.data(encoded)
        return tx
    }

    static de_stake(entity: Entity, amount: BN, fee: BN, signatories: Entity[] | null = null) : Transaction {
        assert(BN.isBN(amount))
        assert(BN.isBN(fee))
        // build up the basic transaction information
        const tx = TransactionFactory.create_action_tx(fee, entity, ENDPOINT.DESTAKE, 'fetch.token')

        if (signatories !== null) {
            signatories.forEach((ent) => tx.add_signer(ent.public_key_hex()))
        } else {
            tx.add_signer(entity.public_key_hex())
        }

        // format the transaction payload
        tx.data(JSON.stringify({
            'address': entity.public_key_base64(),
            'amount': amount.toNumber()
        }))

        return tx
    }

    static collect_stake(entity: Entity, fee: BN, signatories : Entity[] | null = null) : Transaction {
        assert(BN.isBN(fee))
        // build up the basic transaction information
        const tx = TransactionFactory.create_action_tx(fee, entity, ENDPOINT.COLLECTSTAKE, 'fetch.token')

        if (signatories !== null) {
            signatories.forEach((ent) => tx.add_signer(ent.public_key_hex()))
        } else {
            tx.add_signer(entity.public_key_hex())
        }
        return tx
    }
}
