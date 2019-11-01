import axios from 'axios'
import {default as of} from "await-of";
import {ApiEndpoint} from "./common";

export class TransactionApi extends ApiEndpoint{

   async status(tx_digest){
       debugger;

        let url = `${this.protocol()}://${this.host()}:${this.port()}/api/status/tx/${tx_digest}`;

       let request_headers = {
			'Content-Type': 'application/json; charset=utf-8'
		}

		// make the request
		let [resp, err] = await of(
			axios({
				method: 'get',
				url: url,
                request_headers
			})
		)

       //_get_json

       console.log('status' + resp.status);
       debugger;

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
