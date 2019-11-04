import axios from 'axios'
import {ApiEndpoint} from './common'
import {ApiError} from '../errors'

export class TransactionApi extends ApiEndpoint{

	async status(tx_digest){

		let url = `${this.protocol()}://${this.host()}:${this.port()}/api/status/tx/${tx_digest}`

		let request_headers = {
			'Content-Type': 'application/json; charset=utf-8'
		}

		let resp
		debugger
		try {
			resp  = await axios({
				method: 'get',
				url: url,
				request_headers
			})
		} catch(error){
			throw new ApiError('Malformed response from server')
		}


		//_get_json
		console.log('status' + resp.data.status)
		console.log('status' + resp.status)
		return resp.data.status
	}

}
//
// class TransactionApi(ApiEndpoint):
//     def status(self, tx_digest):
//         """
//         Determines the status of the transaction at the node
//
//         :param tx_digest: The hex-encoded string of the target tx digest
//         :return:
//         """
//
//         url = '{}://{}:{}/api/status/tx/{}'.format(self.protocol, self.host, self.port, tx_digest)
//
//         response = self._session.get(url).json()
//         return response.get('status')
