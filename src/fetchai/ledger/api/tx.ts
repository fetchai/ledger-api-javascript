import axios from 'axios'
import {ApiError, NetworkUnavailableError} from '../errors'
import {Address} from '../crypto/address'
import {BN} from 'bn.js'
import {ApiEndpoint} from './common'
import {convert_number} from "../utils";

enum NON_TERMINAL_STATES {
   UNKNOWN = 'Unknown',
 PENDING = 'Pending'
}

enum SUCCESSFUL_TERMINAL_STATES {
   EXECUTED = 'Executed',
   SUBMITTED ='Submitted'
}

/*
takes an array and turns it into an object, setting the to field and the amount field.
//TODO ASK ED IF THIS OK?, since we want insertion order, which plain objects don't.
 */
const tx_array_to_object = (array: Array<any>) =>
    array.reduce((obj: any, item: any) => {
        obj[item.to] = new BN(item.amount)
        return obj
    }, {})

export class TxStatus {
	public digest_bytes: Buffer;
	public digest_hex: string;
	public status: string;
	public exit_code: string;
	public charge: BN;
	public charge_rate: BN;
	public fee: BN;

    constructor(digest: Buffer, status: string, exit_code: string, charge: number, charge_rate: number, fee: number) {
        this.digest_bytes = digest
        this.digest_hex = this.digest_bytes.toString('hex')
        this.status = status
        this.exit_code = exit_code
        this.charge = new BN(charge)
        this.charge_rate = new BN(charge_rate)
        this.fee = new BN(fee)
    }

    get_status() : string {
        return this.status
    }

    get_exit_code() {
        return this.exit_code
    }

    successful() : boolean {
        return (<any>Object).values(SUCCESSFUL_TERMINAL_STATES).includes(this.status)
    }

    failed() : boolean {
        return (!(<any>Object).values(NON_TERMINAL_STATES).includes(this.status) &&
                !(<any>Object).values(SUCCESSFUL_TERMINAL_STATES).includes(this.status))
    }

    non_terminal() : boolean {
        return (<any>Object).values(NON_TERMINAL_STATES).includes(this.status)
    }


    get_digest_hex() : string {
        return this.digest_hex
    }

    get_digest_bytes() : Buffer {
        return this.digest_bytes
    }
}

export class TxContents {
	public digest_bytes: any;
	public digest_hex: string;
	public action: any;
	public chain_code: any;
	public from_address: Address;
	public contract_address: Address | null;
	public valid_from: BN;
	public valid_until: BN;
	public charge: BN;
	public charge_limit: BN;
	public transfers: any;
	public signatories: any;
	public data: any;

    constructor(digest: Buffer,
        action: string,
        chain_code: string,
        from_address: string,
        contract_address: string,
        valid_from: number,
        valid_until: number,
        charge: number,
        charge_limit: number,
        transfers: Array<string>,
        signatories: string,
        data: string ) {

        this.digest_bytes = digest
        this.digest_hex = this.digest_bytes.toString('hex')
        this.action = action
        this.chain_code = chain_code
        this.from_address = new Address(from_address)
        this.contract_address = (contract_address) ? new Address(contract_address) : null
        this.valid_from = convert_number(valid_from)
        this.valid_until = convert_number(valid_until)
        this.charge = convert_number(charge)
        this.charge_limit = convert_number(charge_limit)
        this.transfers = tx_array_to_object(transfers)
        this.signatories = signatories
        this.data = data
    }

    /**
     *  Returns the amount of FET transferred to an address by this transaction, if any
     */
    transfers_to(address: AddressLike) {
        const hex = new Address(address).toHex()
        return (this.transfers[hex]) ? this.transfers[hex] : new BN(0)
    }

    /**
     *Creates a TxContents from a json string or an object
     */

    static from_json(data: any) : TxContents {
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

    async status(tx_digest: string) : Promise<TxStatus> {

        let url = `${this.protocol()}://${this.host()}:${this.port()}/api/status/tx/${tx_digest}`
        let request_headers = {
            'Content-Type': 'application/json; charset=utf-8'
        }

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
            throw new NetworkUnavailableError('Failed to get status from txs hash')
        }

        return new TxStatus(
            Buffer.from(resp.data.tx, 'hex'),
            resp.data.status,
            resp.data.exit_code,
            resp.data.charge,
            resp.data.charge_rate,
            resp.data.fee)
    }


    async contents(tx_digest: string) : Promise<TxContents> {
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
        return TxContents.from_json(resp.data)
    }
}
