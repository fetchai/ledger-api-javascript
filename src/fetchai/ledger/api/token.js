import { NotImplementedError, ValidationError, ApiError } from '../errors'
import { logger } from '../utils'
import { ApiEndpoint } from './common'


/**
 * This class for all tokens operations
 *
 * @public
 * @class
 */
export class TokenApi extends ApiEndpoint {

    constructor(host, port) {
        logger.info(`Creating new Token api object with host:${host} and port:${port}`)
        super(host, port)
        this.API_PREFIX = 'fetch/token'
    };

    /**
   * Get the balance of address
   *
   * @public
   * @method
   * @param  {address} address for get the balance.
   */
    async balance(address) {

        logger.info(`request for check balance of address: ${address}`)

        // format and make the request
        let request = { 'address': String(address) }
        let data = await super._post_json('balance', request, this.API_PREFIX)
        logger.info(`Balance of ${address} is ${data.balance}`)

        if (!'balance' in data) {
            throw new ApiError(`Malformed response from server`)
        }

        // return the balance
        return Number(data['balance'])
    }
}