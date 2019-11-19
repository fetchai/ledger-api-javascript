import {ApiEndpoint} from './common'
import axios from 'axios'
import {ApiError} from '../errors'


export class ServerApi extends ApiEndpoint {

    async status() {
        // Gets the status of a constellation server
        let url = `${this.protocol()}://${this.host()}:${this.port()}/api/status`

        let response
        try {
            response = await axios({
                method: 'get',
                url: url
            })
        } catch (error) {
            throw new ApiError('Malformed response from server')
        }
        return response.data
    }

    async num_lanes() {
        // Queries the ledger for the number of lanes currently active
        const status = await this.status()
        return status.lanes
    }

    async version() {
        const status = await this.status()
        return status.version
    }
}
