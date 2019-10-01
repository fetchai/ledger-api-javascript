import { logger } from '../utils'
import { NotImplementedError, ValidationError, ApiError } from '../errors'
import { default as of } from 'await-of';
import axios from 'axios'

/**
 * This class for all ledger endpoints operations
 *
 * @public
 * @class
 */
export class ApiEndpoint {

    constructor(host, port) {
        logger.info(`Creating new api endpoint object with host:${host} and port:${port}`)
        this._host = String(host)
        this._port = Number(port)
    };

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
            "Content-Type": "application/json; charset=utf-8"
        }

        // make the request
        let [resp, err] = await of(axios({
            method: 'post',
            url: url,
            data: data,
            headers: request_headers
        }))

        if (err) {
            throw new ApiError(`Malformed response from server`)
        }
        return resp.data
    }

}