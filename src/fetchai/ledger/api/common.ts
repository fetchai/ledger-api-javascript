import axios from 'axios'
import {ApiError} from '../errors'
import {BN} from 'bn.js'
import {logger} from '../utils'
import {Transaction} from '../transaction'
import assert from 'assert'
import {encode, ExtensionCodec} from '@msgpack/msgpack'
import {Address, Entity} from '../crypto'
import {BitVector} from '../bitvector'
import {encode_multisig_transaction} from '../serialization/transaction'
import {LedgerApi} from "./init";
type Tuple = [boolean, Object];

function format_contract_url(host: string, port: number, prefix: string | null = null, endpoint: string | null = null, protocol: string = 'http') : string {
    let canonical_name, url

    if (endpoint === null || endpoint === '') {
        url = `${protocol}://${host}:${port}/api/contract/submit`
    } else {
        if (prefix == null) {
            canonical_name = endpoint
        } else {
            canonical_name = `${prefix}.${endpoint}`
        }
        url = `${protocol}://${host}:${port}/api/contract/${canonical_name.replace(/\./g, '/')}`
    }
    return url
}

/**
 * This class for all ledger endpoints operations
 *
 * @public
 * @class
 */
export class ApiEndpoint {
	public _protocol: string;
	public prefix: PREFIX;
	public _host: string;
	public _port: number;
	public readonly DEFAULT_BLOCK_VALIDITY_PERIOD = 100
	public parent_api: LedgerApi;

    constructor(host: string, port: number, api: LedgerApi) {

        let protocol
        if (host.includes('://')) {
            [protocol, host] = host.split('://')
        } else {
            protocol = 'http'
        }

        this._protocol = protocol
        this.prefix = PREFIX.TOKEN
        this._host = host
        this._port = port
        this.parent_api = api
    }

    protocol() : string {
        return this._protocol
    }

    host() : string {
        return this._host
    }

    port(): number {
        return this._port
    }

    /**
     * request to ledger
     *
     * @public
     * @method
     * @param  {endpoint} endpoint of the url.
     * @param  {data} data for request body.
     * @param  {prefix} prefix of the url.
     */
    async post_json(endpoint : string, data = {}, prefix = this.prefix) : Promise<Tuple>{

        // format and make the request
        const url = format_contract_url(this._host, this._port, prefix, endpoint, this._protocol)
        // define the request headers

        let request_headers = {
            'Content-Type': 'application/json; charset=utf-8'
        }

        // make the request
        let resp
        try {
            resp = await axios({
                method: 'post',
                url: url,
                data: data,
                headers: request_headers
            })
        } catch (error) {
            throw new ApiError('Malformed response from server')
        }

        // check the status code
        if (200 <= resp.status && resp.status < 300) {
            return [true, resp.data]
        }

        // in python add later perhaps

        // # Allow for additional data to be transferred
        // response = None
        // try:
        //     response = json.loads(raw_response.text)
        // except:
        //     pass
        //
        // return False, response

        return [false, resp.data]
    }

    async create_skeleton_tx(fee: number, validity_period = null) : Promise<Transaction> {
        if (!validity_period) {
            validity_period = this.DEFAULT_BLOCK_VALIDITY_PERIOD
        }

        // query what the current block number is on the node
        let current_block = await this.current_block_number()
        if (current_block < 0) {
            throw new ApiError('Unable to query current block number')
        }

        // build up the basic transaction information
        let tx = new Transaction()
        tx.valid_until(new BN(current_block + validity_period))
        tx.charge_rate(new BN(1))
        tx.charge_limit(new BN(fee))
        return tx
    }

    /**
     *Appends signatures to a transaction and submits it, returning the transaction digest
     *
     * @param tx    A pre-assembled transaction
     * @param signatures    signers signatures
     * @returns {Promise<*>}    The digest of the submitted transaction
     */
    async submit_signed_tx(tx: Transaction, signatures) {
        // Encode transaction and append signatures
        const encoded_tx = encode_multisig_transaction(tx, signatures)
        // Submit and return digest
        return this.post_tx_json(encoded_tx, tx.action())
    }

    // tx is transaction
    async set_validity_period(tx: Transaction, validity_period: number | null = null) : Promise<BN> {
        if (!validity_period) {
            validity_period = this.DEFAULT_BLOCK_VALIDITY_PERIOD
        }

        // query what the current block number is on the node
        const current_block = await this.current_block_number()
        tx.valid_until(new BN(current_block + validity_period))
        return tx.valid_until()
    }

    async current_block_number() : Promise<number> {
        let response = await this._get_json('status/chain', {size: 1})
        let block_number = -1
        if (response) {
            block_number = response.data['chain'][0].blockNumber
        }
        return block_number
    }

    async _get_json(path: string, data: any) {
        let url = `http://${this._host}:${this._port}/api/${path}`

        // define the request headers
        let request_headers = {
            'Content-Type': 'application/json; charset=utf-8'
        }

        let resp
        try {
            resp = await axios({
                method: 'get',
                url: url,
                params: data,
                headers: request_headers
            })
        } catch (error) {
            throw new ApiError('Malformed response from server')
        }

        if (200 <= resp.status && resp.status < 300) {
            return resp
        }
        return null
    }

    /**
     * Submits a transaction to the a ledger endpoint
     *
     * @param tx_data
     * @param endpoint
     * @returns {Promise<null|*>} Promise resolves to the hexadecimal digest of the submitted transaction
     */

    async post_tx_json(tx_data: Buffer, endpoint: string) : Promise<any | null> {
        let request_headers = {
            'content-type': 'application/vnd+fetch.transaction+json'
        }

        let tx_payload = {
            ver: '1.2',
            data: tx_data.toString('base64')
        }


        // format the URL
        const url = format_contract_url(this._host, this._port, this.prefix, endpoint, this._protocol)
        // make the request
        let resp: any;
        try {
            resp = await axios({
                method: 'post',
                url: url,
                data: tx_payload,
                headers: request_headers
            })
        } catch (error) {
            throw new ApiError('Malformed response from server')
        }

        if (200 <= resp.status && resp.status < 300) {

            //TODO WHY DOES ED CHECK in python that there is a hash, else there is no return.
            //TODO confirm that is as intended.
            logger.info(`\n Transactions hash is ${resp.data.txs} \n`)
            return resp.data.txs[0]
        }
        return null
    }
}

export class TransactionFactory {

    static create_skeleton_tx(fee :  BN | number) : Transaction {
        // build up the basic transaction information
        const tx = new Transaction()
        tx.charge_rate(new BN(1))
        tx.charge_limit(new BN(fee))
        return tx
    }

    static create_action_tx(fee: BN | number, entity: Entity, action: string, prefix: string, shard_mask = null) : Transaction  {
        const mask = (shard_mask === null) ? new BitVector() : shard_mask
        const tx = TransactionFactory.create_skeleton_tx(fee)
        tx.from_address(new Address(entity))
        tx.target_chain_code(prefix, mask)
        tx.action(action)
        return tx
    }

    static encode_msgpack_payload(args: Array<Address | string | number>) : Uint8Array {
        assert(Array.isArray(args))
        const extensionCodec = new ExtensionCodec()
        extensionCodec.register({
            type: 77,
            encode: object => {
                if (object instanceof Address) {
                    return object.toBytes()
                } else {
                    return null
                }
            },
            decode: ()=>{}
        })
        return encode(args, {extensionCodec})
    }
}
