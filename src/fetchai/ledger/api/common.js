import {logger} from '../utils'
import {ApiError} from '../errors'
import {default as of} from 'await-of'
import axios from 'axios'
import {Transaction} from '../transaction'

/**
 * This class for all ledger endpoints operations
 *
 * @public
 * @class
 */
export class ApiEndpoint {
    constructor(host, port) {
        logger.info(
            `Creating new api endpoint object with host:${host} and port:${port}`
        )
        this.prefix = 'fetch/token'
        this._host = String(host)
        this._port = Number(port)
        this.default_block_validity_period = 100
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
    async _post_json(endpoint, data, prefix) {
        // format and make the request
        let url = `http://${this._host}:${this._port}/api/contract/${prefix}/${endpoint}`

        // define the request headers
        let request_headers = {
            'Content-Type': 'application/json; charset=utf-8'
        }

        // make the request
        let [resp, err] = await of(
            axios({
                method: 'post',
                url: url,
                data: data,
                headers: request_headers
            })
        )

        if (err) {
            throw new ApiError('Malformed response from server')
        }
        return resp.data
    }

    async create_skeleton_tx(fee, validity_period = null) {
        if (!validity_period) {
            validity_period = this.default_block_validity_period
        }

        // query what the current block number is on the node
        let current_block = await this._current_block_number()
        if (current_block < 0) {
            throw new ApiError('Unable to query current block number')
        }

        // build up the basic transaction information
        let tx = new Transaction()
        tx.valid_until = current_block + validity_period
        tx.charge_rate = 1
        tx.charge_limit = fee
        return tx
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

        // make the request
        let [resp, err] = await of(
            axios({
                method: 'get',
                url: url,
                params: data,
                headers: request_headers
            })
        )

        if (err) {
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
        logger.info(`\n Transaction payload: ${JSON.stringify(tx_payload, null, '\t')} \n`)

        // format the URL
        let url = `http://${this._host}:${this._port}/api/contract/${this.prefix}/${endpoint}`

        // make the request
        let [resp, err] = await of(
            axios({
                method: 'post',
                url: url,
                data: tx_payload,
                headers: request_headers
            })
        )

        if (err) {
            logger.error(err)
            throw new ApiError('Unable to fulfil transaction request')
        }

        if (200 <= resp.status < 300) {
            logger.info(`\n Transactions hash is ${resp.data.txs} \n`)
            return resp
        }
        return null
    }

    _encode_json(obj) {
        return Buffer.from(JSON.stringify(obj), 'ascii')
    }
}
