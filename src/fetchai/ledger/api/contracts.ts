import assert from 'assert'
import {Address} from '../crypto/address'
import {ApiEndpoint, TransactionFactory} from './common'
import {BitVector} from '../bitvector'
import {Contract} from '../contract'
import {encode_transaction} from '../serialization/transaction'
import {logger} from '../utils'
import {LedgerApi} from "./init";
import {Entity} from "../crypto/entity";
import {BN} from 'bn.js'
import {Transaction} from "../transaction";


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
    constructor(host: string, port: number, api?: LedgerApi) {
        super(host, port, api)
        // tidy up before submitting
        this.prefix =  PREFIX.CONTRACT
    }

    /**
     * Create contract
     * @param {Object} owner Entity object
     * @param {Number} fee fee associated with the contract creation.
     * @param {String} contract contract
     * @param {Object} [shard_mask=null] BitVector object
     */
    async create(owner: Entity, contract: Contract, fee: NumericInput, signers : Array<Entity> | null = null, shard_mask : BitVectorLike = null) :  Promise<any | null>  {
        assert(contract instanceof Contract)
        // todo verify this at runtime is correct then remove comment. I think the bug is in python.
        const ENDPOINT = 'create'
        const contractTxFactory = new ContractTxFactory(this.parent_api)
        const tx = await contractTxFactory.create(owner, contract, fee, null, shard_mask)
        signers = (signers !== null) ? signers : [owner]
        const encoded_tx = encode_transaction(tx, signers)
        contract.owner(owner)
        return await this.post_tx_json(encoded_tx)
    }

    /**
     * Query on contract
     * @param {Object} contract_owner Address object
     * @param {String} query query string
     * @param {JSON} data json payload
     */
    async query(contract_owner: Address, query: string, data:  JSONEncodable) : Promise<Array<boolean | Object>> {
        assert(this.isJSON(data))
        const encoded = this._encode_json_payload(data)
        return await this.post_json(query, encoded, contract_owner.toString())
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
        contract_address,
        action,
        fee,
        from_address,
        signers,
        args,
        shard_mask = null
    ) {
        const contractTxFactory = new ContractTxFactory(this.parent_api)
        let tx = await contractTxFactory.action(contract_address, action, fee, from_address, args, signers, shard_mask)
        for (let i = 0; i < signers.length; i++) {
            tx.add_signer(signers[i].public_key_hex())
        }
        await this.set_validity_period(tx)

        const encoded_tx = encode_transaction(tx, signers)
        return await this.post_tx_json(encoded_tx)
    }


    _encode_json_payload(data: JSONEncodable) {
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

    static _is_primitive(test: string | number) {
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


    async post_tx_json(tx_data: Buffer) : Promise<any | null>{
        return super.post_tx_json(tx_data, null)
    }


}

export class ContractTxFactory extends TransactionFactory {
	public api: LedgerApi;
	public prefix: PREFIX;

    constructor(api: LedgerApi) {
        super()
        this.api = api
        this.prefix = PREFIX.CONTRACT
    }

    /**
     * Replicate server interface for fetching number of lanes
     *
     * @returns {*}
     */
    server() {
        return this.api.server
    }

    /**
     * Replicate setting of validity period using server
     *
     * @param tx
     * @param validity_period
     */
    async set_validity_period(tx: Transaction, validity_period: number | null = null) : Promise<BN> {
        await this.api.server.set_validity_period(tx, validity_period)
    }

    async action(contract_address: Address, action: string,
        fee: NumericInput, from_address: AddressLike, args: MessagePackable,
        signers : Array<Entity> | null = null,
        shard_mask: BitVectorLike = null) {

        // build up the basic transaction information
        const tx = TransactionFactory.create_action_tx(fee, from_address, action, PREFIX.CONTRACT, shard_mask)
        tx.target_contract(contract_address, shard_mask)
        tx.data(TransactionFactory.encode_msgpack_payload(args))
        await this.set_validity_period(tx)

        if (signers !== null) {
            signers.forEach((signer) => {
                tx.add_signer(signer.public_key_hex())
            })
        }

        return tx
    }


    async create(owner: Entity, contract: Contract, fee: NumericInput, signers: Array<Entity> | null = null,
        shard_mask: BitVectorLike = null) {
        // build up the basic transaction information
        const tx = TransactionFactory.create_action_tx(fee, owner, ENDPOINT.CREATE, PREFIX.CONTRACT , shard_mask)
        const data = JSON.stringify({
            'text': contract.encoded_source(),
            'nonce': contract.nonce(),
            'digest': contract.digest().toHex()
        })

        tx.data(data)
        await this.set_validity_period(tx)

        if (signers !== null) {
            signers.forEach((signer) => {
                tx.add_signer(signer.public_key_hex())
            })
        } else {
            tx.add_signer(owner.public_key_hex())
        }

        return tx

    }
}

