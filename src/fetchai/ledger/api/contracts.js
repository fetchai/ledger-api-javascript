import assert from 'assert'
import {encode, ExtensionCodec} from '@msgpack/msgpack'
import {Address} from '../crypto/address'
import {ApiEndpoint} from './common'
import {BitVector} from '../bitvector'
import {Contract} from '../contract'
import {encode_transaction} from '../serialization/transaction'
import {logger} from '../utils'

/**
 * This class for all Tokens APIs.
 *
 * @public
 * @class
 */
export class ContractsApi extends ApiEndpoint {
    /**
     *
     * @param {String} HOST Ledger host.
     * @param {String} PORT Ledger port.
     */
    constructor(HOST, PORT) {
        super(HOST, PORT)
        // tidy up before submitting
        this.prefix = 'fetch.contract'
    }

    /**
     * Create contract
     * @param {Object} owner Entity object
     * @param {Number} fee fee associated with the contract creation.
     * @param {String} contract contract
     * @param {Object} [shard_mask=null] BitVector object
     */
    async create(owner, fee, contract, signers = null, shard_mask = null) {
        assert(contract instanceof Contract)
        const ENDPOINT = 'create'
        // Default to wildcard shard mask if none supplied
        // if (shard_mask === null) {
        //     logger.info(
        //         'WARNING: defaulting to wildcard shard mask as none supplied'
        //     )
        //     shard_mask = new BitVector()
        // }
        //
        //
        // const tx = await this.create_skeleton_tx(fee)
        // tx.from_address(owner)
        // tx.target_chain_code(this.prefix, shard_mask)
        // tx.action(ENDPOINT)
        //
        // tx.data(
        //     JSON.stringify({
        //         text: contract.encoded_source(),
        //         digest: contract.digest().toHex(),
        //         nonce: contract.nonce()
        //     })
        // )
        // tx.add_signer(owner.public_key_hex())
        const contractTxFactory = new ContractTxFactory(self._parent_api);
        const tx = contractTxFactory.create(owner, contract, fee, shard_mask)
       // const encoded_tx = encode_transaction(tx, [owner])
         // TODO: Is multisig contract creation possible?
        signers = (signers !== null) ? signers : [owner]
        const encoded_tx = transaction.encode_transaction(tx, signers)
        contract.owner(owner)
        return await this._post_tx_json(encoded_tx, ENDPOINT)
    }

    /**
     * Query on contract
     * @param {Object} contract_digest Address object
     * @param {Object} contract_owner Address object
     * @param {String} query query string
     * @param {JSON} data json payload
     */
    async query(contract_digest, contract_owner, query, data) {
        assert(this.isJSON(data))
        const prefix = `${contract_digest.toHex()}.${contract_owner.toString()}`
        const encoded = this._encode_json_payload(data)
        return await this._post_json(query, encoded, prefix)
    }

    /**
     * Action on ledger/contract
     * @param {Object} contract_digest Address class object
     * @param {Object} contract_address Address class object
     * @param {String} action action
     * @param {Number} fee fee associated with the action.
     * @param {Object} from_address from address
     * @param {Array} signers Entity list
     * @param {*} args arguments
     * @param {Object} shard_mask BitVector object
     */
    async action(
        contract_digest,
        contract_address,
        action,
        fee,
        from_address,
        signers,
        args,
        shard_mask = null
    ) {

        /*
            def action(self, contract_address: Address, action: str,
               fee: int, from_address: Address, *args,
               signers: EntityList, shard_mask: BitVector = None):

        tx = ContractTxFactory(self._parent_api).action(contract_address,
                                                        action, fee, from_address, *args,
                                                        signers=signers, shard_mask=shard_mask)
        tx.data = self._encode_msgpack_payload(*args)
        self._set_validity_period(tx)

        for signer in signers:
            tx.add_signer(signer)

        encoded_tx = transaction.encode_transaction(tx, signers)

        return self._post_tx_json(encoded_tx, None)
         */

        // if (shard_mask === null) {
        //     shard_mask = new BitVector()
        // }
        // build up the basic transaction information
        // const tx = await this.create_skeleton_tx(fee)
        // tx.from_address(from_address)
        // tx.target_contract(contract_digest, contract_address, shard_mask)
        // tx.action(action)
         const contractTxFactory = new ContractTxFactory(this.parent_api);
        let tx = contractTxFactory.action(contract_address,action, fee, from_address, args, signers, shard_mask)
        tx.data(TransactionFactory.encode_msgpack_payload(args))
        for (let i = 0; i < signers.length; i++) {
            tx.add_signer(signers[i].public_key_hex())
        }
                tx.set_validity_period(tx)

        const encoded_tx = encode_transaction(tx, signers)
        return await this._post_tx_json(encoded_tx, null)
    }



    _encode_json_payload(data) {
        assert(typeof data === 'object' && data !== null)
        const params = {}

        let new_key
        //generic object/array loop
        for (let [key, value] of Object.entries(data)) {
            assert(typeof key === 'string')

            if (key.endsWith('_')) {
                new_key = key.substring(0, key.length - 1)
                // mutate key name
                delete Object.assign(data, {[new_key]: data[key]})[new_key]
                key = new_key
            }

            if (ContractsApi._is_primitive(value)) {
                params[key] = value
            } else if (value instanceof Address) {
                params[key] = value.toString()
            } else {
                params[key] = this._encode_json_payload(value)
            }
        }
        return params
    }

    static _is_primitive(test) {
        return test !== Object(test)
    }

    // taken from http://stackz.ru/en/4295386/how-can-i-check-if-a-value-is-a-json-object
    isJSON(o) {
        if (typeof o != 'string') {
            o = JSON.stringify(o)
        }

        try {
            JSON.parse(o)
            return true
        } catch (e) {
            return false
        }
    }



  post_tx_json(tx_data, endpoint = null){
        return super._post_tx_json(tx_data, endpoint)
}




export class ContractTxFactory extends TransactionFactory {

const API_PREFIX = 'fetch.contract'

    constructor(api) {
        super()
        this.api = api
    }

    //"""Replicate server interface for fetching number of lanes"""
    server() {
        return this.api.server
    }

    /**
     * Replicate setting of validity period using server
     *
     * @param tx
     * @param validity_period
     */
    set_validity_period(tx, validity_period = null) {
        this.api.server.set_validity_period(tx, validity_period)
    }

     action(contract_address, action,
               fee, from_address, args,
               signers = null,
               shard_mask = null){

        // Default to wildcard shard mask if none supplied
        if(shard_mask === null) {
            logger.info("Defaulting to wildcard shard mask as none supplied")
            shard_mask = new BitVector()
        }

        // build up the basic transaction information
        const tx = TransactionFactory.create_action_tx(fee, from_address, action, shard_mask)
        tx.target_contract(contract_address, shard_mask)
        tx.data(TransactionFactory.encode_msgpack_payload(args))
        this.set_validity_period(tx)

        if(signers !== null) {
            signers.forEach((signer) => {tx.add_signer(signer)})
        } else {
            tx.add_signer(from_address)
        }
        return tx
}



create(owner, contract, fee, signers = null,
               shard_mask = null){
        // Default to wildcard shard mask if none supplied
        if(shard_mask === null) {
            logger.info("Defaulting to wildcard shard mask as none supplied")
            shard_mask = new BitVector()
        }

        // build up the basic transaction information
        tx = this._create_action_tx(fee, owner, 'create', shard_mask)
        tx.data = this._encode_json({
            'nonce': contract.nonce,
            'text': contract.encoded_source,
            'digest': contract.digest.to_hex()
        })
        this.set_validity_period(tx)

         if(signers !== null) {
            signers.forEach((signer) => {tx.add_signer(signer)})
        } else {
            tx.add_signer(owner)
        }

        return tx

}

