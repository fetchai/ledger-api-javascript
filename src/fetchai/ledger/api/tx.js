import axios from 'axios'
import {ApiEndpoint} from './common'
import {ApiError} from '../errors'

export class TransactionApi extends ApiEndpoint {

    async status(tx_digest) {

        let url = `${this.protocol()}://${this.host()}:${this.port()}/api/status/tx/${tx_digest}`
        let request_headers = {
            'Content-Type': 'application/json; charset=utf-8'
        }

        let resp
        try {
            resp = await axios({
                method: 'get',
                url: url,
                request_headers
            })
        } catch (error) {
            throw new ApiError('Malformed response from server')
        }
        return resp.data.status
    }
}
