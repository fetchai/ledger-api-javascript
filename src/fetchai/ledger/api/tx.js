import axios from 'axios'
import {ApiEndpoint} from './common'
import {ApiError} from '../errors'
import {Address} from "../crypto/address";

const SUCCESSFUL_TERMINAL_STATES = ('Executed', 'Submitted')
const NON_TERMINAL_STATES = ('Unknown', 'Pending')

export class TxStatus {

    constructor(digest, status, exit_code, charge, charge_rate, fee) {
        this.digest_bytes = digest
        this.digest_hex = this.digest_bytes.toString('hex')
        this.status = status
        this.exit_code = exit_code
        this.charge = charge
        this.charge_rate = charge_rate
        this.fee = fee
    }


    successful() {
        return SUCCESSFUL_TERMINAL_STATES.includes(this.status)
    }

    failed() {
        return (!NON_TERMINAL_STATES.includes(this.status) &&
            !SUCCESSFUL_TERMINAL_STATES.includes(this.status))
    }

    digest_hex() {
        return this.digest_hex
    }

    digest_bytes() {
        return this.digest_bytes
    }
}

export class TxContents {

    construct(digest,
              action,
              chain_code,
              from_address,
              contract_digest,
              contract_address,
              valid_from,
              valid_until,
              charge,
              charge_limit,
              transfers,
              signatories,
              data) {

        this._digest_bytes = digest
        this._digest_hex = this._digest_bytes.toString('hex')
        this.action = action
        this.chain_code = chain_code
        this.from_address = new Address(from_address)
        this.contract_digest = (contract_digest) ? contract_digest : null;
        this.contract_address = (contract_address) ? new Address(contract_address) : null;
        this.valid_from = valid_from
        this.valid_until = valid_until
        this.charge = charge
        this.charge_limit = charge_limit
        this.transfers = {Address(t['to']
    ):
        t['amount']
        for t in transfers}
        this.signatories = signatories
        this.data = data
    }

    /**
     *  Returns the amount of FET transferred to an address by this transaction, if any
     */
    function

    transfers_to(address) {
        address = new Address(address)
        return this.transfers.get(address, 0)
    }

    /**
     *Creates a TxContents from a json string or dict object
     */
    function

    from_json(data):

    if

    isinstance(data, str):
        data

=
    json
.

    loads(data)

    # Extract
    contents
    from
    json
,
    converting
    as
    necessary
    return

    TxContents(
        bytes

.

    fromhex(data

.

    get(

    'digest'
).

    lstrip(

    '0x'
)),
    data
.

    get(

    'action'
),
    data
.

    get(

    'chainCode'
),
    data
.

    get(

    'from'
),
    data
.

    get(

    'contractDigest'
),
    data
.

    get(

    'contractAddress'
),

    int(data

.

    get(

    'validFrom'
,
    0
)),

    int(data

.

    get(

    'validUntil'
,
    0
)),

    int(data

.

    get(

    'charge'
)),

    int(data

.

    get(

    'chargeLimit'
)),
    [t
    for
    t
    in
    data
.

    get(

    'transfers'
)],
    data
.

    get(

    'signatories'
),
    data
.

    get(

    'data'
)
)

}

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
