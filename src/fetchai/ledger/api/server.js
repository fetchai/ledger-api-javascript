import {ApiEndpoint} from "./common";
import axios from 'axios'


export class ServerApi extends ApiEndpoint {

    async status() {
        // Gets the status of a constellation server
        // return: dict of info returned by the /api/status endpoint
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
        return response
    }

    num_lanes() {
        // Queries the ledger for the number of lanes currently active
        const status = this.status();
        return status.lanes;
    }

    version() {
        const status = this.status();
        return status.version;
    }
}
