import assert from 'assert'
import {Address} from '../crypto/address'
import {ApiEndpoint, TransactionFactory} from './common'
import {Contract} from '../contract'
import {encode_transaction} from '../serialization/transaction'
import {ENDPOINT, PREFIX} from '../utils'
import {LedgerApi} from './init'
import {Entity} from '../crypto/entity'
import {BN} from 'bn.js'
import {Transaction} from '../transaction'
import {BitVector} from '../bitvector'
import {RunTimeError} from '../errors'
import {Identity} from "../crypto";

type Tuple = [boolean, any];

interface CreateContractsOptions {
    owner: Entity;
    contract: Contract;
    fee: BN;
    shard_mask: BitVectorLike;
}

interface CreateFactoryContractsOptions
{
    from_address: AddressLike;
    contract: Contract;
    fee: BN;
    signers: Array<Identity> | null;
    shard_mask: BitVectorLike;
}

interface QueryContractsOptions {
    contract_owner: Address;
    query: string;
    data: any;
}

interface ActionContractsOptions {
    contract_address: Address;
    action: string;
    fee: BN;
    args: MessagePackable;
    signer: Entity;
    shard_mask: BitVectorLike;
}

interface ActionFactoryContractsOptions {
    contract_address: Address;
    action: string;
    fee: BN;
    from_address: Address;
    args: MessagePackable;
    signers: Array<Entity>;
    shard_mask: BitVectorLike;
}

interface JsonPayload {
    [key: string]: JsonPrimitive | JsonPayload;
}

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
        this.prefix = PREFIX.CONTRACT
    }

    static is_primitive(test: unknown): boolean {
        return test !== Object(test)
    }

    /**
     * Create contract
     * @param {Object} owner Entity object
     * @param {Number} fee fee associated with the contract creation.
     * @param {String} contract contract
     * @param {Object} [shard_mask=null] BitVector object
     */

    async create({owner, contract, fee, shard_mask = null}: CreateContractsOptions): Promise<any | null> {
        assert(contract instanceof Contract)
        // todo verify this at runtime is correct then remove comment. I think the bug is in python.
        const tx = await ContractTxFactory.create({
            from_address: owner,
            contract: contract,
            fee: fee,
            signers: [owner],
            shard_mask: shard_mask
        })
        tx.sign(owner)

        const encoded_tx = encode_transaction(tx)
        contract.owner(owner)
        return await this.post_tx_json(encoded_tx)
    }

    /**
     * Query on contract
     * @param {Object} contract_owner Address object
     * @param {String} query query string
     * @param {JSON} data json payload
     */
    async query({contract_owner, query, data}: QueryContractsOptions): Promise<Tuple> {
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
        {
            contract_address,
            action,
            fee,
            args,
            signer,
            shard_mask = null
        }: ActionContractsOptions
    ): Promise<any> {
        const tx = await ContractTxFactory.action({
            from_address: new Address(signer),
            contract_address: contract_address,
            action: action,
            fee: fee,
            args: args,
            signers: [signer],
            shard_mask: shard_mask
        })

        await this.set_validity_period(tx)
        tx.sign(signer)

        const encoded_tx = encode_transaction(tx)
        return await this.post_tx_json(encoded_tx)
    }

    _encode_json_payload(data: any): JsonPayload {
        assert(typeof data === 'object' && data !== null)
        const params: any = {}

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

            if (ContractsApi.is_primitive(value)) {
                params[key] = value
            } else if (value instanceof Address) {
                params[key] = value.toString()
            } else {
                params[key] = this._encode_json_payload(value)
            }
        }
        return params
    }

    isJSON(o: unknown): boolean {
        if (typeof o !== 'string') {
            try {
                o = JSON.stringify(o)
                return true
            } catch (e) {
                return false
            }
        }

        try {
            JSON.parse(o as string)
            return true
        } catch (e) {
            return false
        }
    }


    async post_tx_json(tx_data: Buffer): Promise<any | null> {
        return super.post_tx_json(tx_data, null)
    }


}

export class ContractTxFactory extends TransactionFactory {
    public api: LedgerApi;
    public prefix: PREFIX = PREFIX.CONTRACT;

    static async create({from_address, contract, fee, signers = null, shard_mask = null}: CreateFactoryContractsOptions): Promise<Transaction> {

        shard_mask = shard_mask || new BitVector()

        // build up the basic transaction information
        const tx = TransactionFactory.create_chain_code_action_tx({fee: fee, from_address: from_address,
            action: ENDPOINT.CREATE,  prefix: PREFIX.CONTRACT, signatories: signers,
            shard_mask: shard_mask })
        const data = JSON.stringify({
            'text': contract.encoded_source(),
            'nonce': contract.nonce(),
            'digest': contract.digest().toHex()
        })

        tx.data(data)
        return tx
    }

    static async action({
        contract_address, action,
        fee, from_address = null, args,
        signers = null,
        shard_mask = null
    }: ActionFactoryContractsOptions): Promise<Transaction> {

        shard_mask = shard_mask || new BitVector()

        if(from_address === null) {
            if(signers.length === 1) {
                from_address = new Address(signers[0])
            } else {
                throw new RunTimeError('Unable to determine from field for transaction, more than 1 signer provided')
            }
        }


        // build up the basic transaction information
        const tx = TransactionFactory.create_smart_contract_action_tx({fee: fee, from_address: from_address, contract_address: contract_address,
            action: action, signatories: signers, shard_mask: shard_mask})

        tx.data(TransactionFactory.encode_msgpack_payload(args))
        return tx
    }


}

