import axios from 'axios'
import {ApiError} from '../errors'
import {BN} from 'bn.js'
import {logger} from '../utils'
import {Transaction} from '../transaction'

function format_contract_url(host, port, prefix = null, endpoint = null, protocol = 'http') {
    let canonical_name, url

    if (endpoint === null) {
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
    constructor(host, port, api) {
        logger.info(
            `Creating new api endpoint object with host:${host} and port:${port}`
        )

        let protocol
        if (host.includes('://')) {
            [protocol, host] = host.split('://')
        } else {
            protocol = 'http'
        }

        this._protocol = protocol
        this.prefix = 'fetch/token'
        this._host = host
        this._port = port
        this.DEFAULT_BLOCK_VALIDITY_PERIOD = 100
    }

    protocol() {
        return this._protocol
    }

    host() {
        return this._host
    }

    port() {
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
    async _post_json(endpoint, data = {}, prefix = this.prefix) {
        // format and make the request
        //  let url = `http://${this._host}:${this._port}/api/contract/${prefix}/${endpoint}`
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
        if (200 <= resp.status < 300) {
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

    async create_skeleton_tx(fee, validity_period = null) {
        if (!validity_period) {
            validity_period = this.DEFAULT_BLOCK_VALIDITY_PERIOD
        }

        // query what the current block number is on the node
        let current_block = await this._current_block_number()
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

    // tx is transaction
    async set_validity_period(tx, validity_period = null){
         if (!validity_period) {
            validity_period = this.DEFAULT_BLOCK_VALIDITY_PERIOD
        }

        // query what the current block number is on the node
        const current_block = await this._current_block_number()

        tx.valid_until(current_block + validity_period)

        return tx.valid_until()
}
    async _current_block_number() {
        let response = await this._get_json('status/chain', {size: 1})
        let block_number = -1
        if (response) {
            block_number = response.data['chain'][0].blockNumber
        }
        return block_number
    }

    async _get_json(path, data) {
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

        if (200 <= resp.status < 300) {
            return resp
        }
        return null
    }

    async _post_tx_json(tx_data, endpoint) {
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
        let resp
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

        if (200 <= resp.status < 300) {
            logger.info(`\n Transactions hash is ${resp.data.txs} \n`)
            return await resp.data
        }
        return null
    }


 // before submot consider refactoring this to static as in pythn.
    _encode_json(obj) {
        return Buffer.from(JSON.stringify(obj), 'ascii')
    }
}


export class TransactionFactory {
   //python API_PREFIX = None
   const API_PREFIX = ""

    @classmethod
    static create_skeleton_tx(cls, fee: int):
        # build up the basic transaction information
        tx = Transaction()
        tx.charge_rate = 1
        tx.charge_limit = fee

        return tx

    @classmethod
    def _create_action_tx(cls, fee: int, entity: AddressLike, action: str, shard_mask: Optional[BitVector] = None):
        tx = cls._create_skeleton_tx(fee)
        tx.from_address = Address(entity)
        tx.target_chain_code(cls.API_PREFIX, shard_mask if shard_mask else BitVector())
        tx.action = action
        return tx

    @classmethod
    def _encode_json(cls, obj):
        return json.dumps(obj).encode('ascii')

    @classmethod
    def _encode_msgpack_payload(cls, *args):
        items = []
        for value in args:
            if cls._is_primitive(value):
                items.append(value)
            elif isinstance(value, Address):
                items.append(msgpack.ExtType(77, bytes(value)))
            else:
                raise RuntimeError('Unknown item to pack: ' + value.__class__.__name__)
        return msgpack.packb(items)

    @staticmethod
    def _is_primitive(value):
        for type in (bool, int, float, str):
            if isinstance(value, type):
                return True
        return False
