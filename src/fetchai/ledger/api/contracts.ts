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

type Tuple = [boolean, any];

interface CreateContractsOptions {
    owner: AddressLike;
    contract: Contract;
    fee: BN;
    signers: Array<Entity> | null;
    shard_mask: BitVectorLike;
}

interface CreateFactoryContractsOptions
{
    from_address: AddressLike;
    contract: Contract;
    fee: BN;
    signers: Array<Entity> | null;
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
        // tidy up before submitting
        this.prefix = PREFIX.CONTRACT
    }

    //static _is_primitive(test: string | number) {
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

    async create({owner, contract, fee, signers = null, shard_mask = null}: CreateContractsOptions): Promise<any | null> {
        assert(contract instanceof Contract)
        // todo verify this at runtime is correct then remove comment. I think the bug is in python.
        const contractTxFactory = new ContractTxFactory(this.parent_api)
        const tx = await contractTxFactory.create({
            owner: new Address(owner),
            contract: contract,
            fee: fee,
            signers: null,
            shard_mask: shard_mask
        })
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
            from_address,
            args,
            signers,
            shard_mask = null
        }: ActionContractsOptions
    ): Promise<any> {
        const contractTxFactory = new ContractTxFactory(this.parent_api)
        const tx = await contractTxFactory.action({
            contract_address: contract_address,
            action: action,
            fee: fee,
            from_address: from_address,
            args: args,
            signers: signers,
            shard_mask: shard_mask
        })
        for (let i = 0; i < signers.length; i++) {
            tx.add_signer(signers[i].public_key_hex())
        }
        await this.set_validity_period(tx)

        const encoded_tx = encode_transaction(tx, signers)
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

    //todo refactor out .
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
    public prefix: PREFIX;

    constructor(api: LedgerApi) {
        super()
        this.api = api
        this.prefix = PREFIX.CONTRACT
    }

    /**
     * Replicate setting of validity period using server
     *
     * @param tx
     * @param validity_period
     */
    async set_validity_period(tx: Transaction, validity_period: number | null = null): Promise<BN> {
        return await this.api.server.set_validity_period(tx, validity_period)
    }


    async create({owner, contract, fee, signers = null, shard_mask = null}: CreateContractsOptions): Promise<Transaction> {

        shard_mask = shard_mask || new BitVector()

        // build up the basic transaction information
        const tx = TransactionFactory.create_chain_code_action_tx({fee: fee, from_address: owner,
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

    async action({
        contract_address, action,
        fee, from_address = null, args,
        signers = null,
        shard_mask = null
    }: ActionContractsOptions): Promise<Transaction> {

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

