import axios from 'axios'
import {ApiError, NetworkUnavailableError} from '../errors'
import {Address} from '../crypto/address'
import {BN} from 'bn.js'
import {ApiEndpoint} from './common'

const SUCCESSFUL_TERMINAL_STATES = ['Executed', 'Submitted']
const NON_TERMINAL_STATES = ['Unknown', 'Pending']

/*
takes an array and turns it into an object, setting the to field and the amount field.
 */
const tx_array_to_object = (array) =>
    array.reduce((obj, item) => {
        obj[item.to] = new BN(item.amount)
        return obj
    }, {})

export class TxStatus {

    constructor(digest, status, exit_code, charge, charge_rate, fee) {
        this.digest_bytes = digest
        this.digest_hex = this.digest_bytes.toString('hex')
        this.status = status
        this.exit_code = exit_code
        this.charge = new BN(charge)
        this.charge_rate = new BN(charge_rate)
        this.fee = new BN(fee)
    }

    get_status() {
        return this.status;
    }

    get_exit_code() {
        return this.exit_code;
    }

    successful() {
        return SUCCESSFUL_TERMINAL_STATES.includes(this.status)
    }

    failed() {
        return (!NON_TERMINAL_STATES.includes(this.status) &&
            !SUCCESSFUL_TERMINAL_STATES.includes(this.status))
    }

    non_terminal() {
        return NON_TERMINAL_STATES.includes(this.status)
    }


    get_digest_hex() {
        return this.digest_hex
    }

    get_digest_bytes() {
        return this.digest_bytes
    }
}

export class TxContents {

    constructor(digest,
                action,
                chain_code,
                from_address,
                contract_address,
                valid_from,
                valid_until,
                charge,
                charge_limit,
                transfers,
                signatories,
                data) {

        this.digest_bytes = digest
        this.digest_hex = this.digest_bytes.toString('hex')
        this.action = action
        this.chain_code = chain_code
        this.from_address = new Address(from_address)
        this.contract_address = (contract_address) ? new Address(contract_address) : null
        this.valid_from = valid_from
        this.valid_until = valid_until
        this.charge = charge
        this.charge_limit = charge_limit
        this.transfers = tx_array_to_object(transfers)
        this.signatories = signatories
        this.data = data
    }

    /**
     *  Returns the amount of FET transferred to an address by this transaction, if any
     */
    transfers_to(address) {
        if (address instanceof Address) {
            address = address.toHex()
        }
        if (this.transfers[address]) return this.transfers[address]
        return new BN(0)
    }

    /**
     *Creates a TxContents from a json string or an object
     */

    static from_json(data) {
        if (typeof data === 'string') {
            data = JSON.parse(data)
        }
        if (data.digest.toUpperCase().substring(0, 2) === '0X') data.digest = data.digest.substring(2)

        //  Extract contents from json, converting as necessary
        return new TxContents(
            Buffer.from(data.digest, 'hex'),
            data.action,
            data.chainCode,
            data.from,
            data.contractAddress,
            data.validFrom,
            data.validUntil,
            data.charge,
            data.chargeLimit,
            data.transfers,
            data.signatories,
            data.data
        )
    }
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

        if (200 !== resp.status) {
            throw new NetworkUnavailableError('Failed to get status from txs hash')
        }

        return new TxStatus(
            Buffer.from(resp.data.tx, 'hex'),
            resp.data.status,
            resp.data.tx,
            resp.data.exit_code,
            resp.data.charge,
            resp.data.charge_rate,
            resp.data.fee)
    }


    async contents(tx_digest) {
        let url = `${this.protocol()}://${this.host()}:${this.port()}/api/tx/${tx_digest}`
        let resp
        try {
            resp = await axios({
                method: 'get',
                url: url
            })
        } catch (error) {
            throw new ApiError('Malformed response from server')
        }

        if (200 !== resp.status) {
            throw new NetworkUnavailableError('Failed to get contents from txs hash')
        }
        return resp.data
    }
}
