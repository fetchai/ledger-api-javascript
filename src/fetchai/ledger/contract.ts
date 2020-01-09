import * as  fs from 'fs'
import assert from 'assert'
import {Address} from './crypto/address'
import {BitVector} from './bitvector'
import {ContractTxFactory} from './api/contracts'
import {createHash, randomBytes} from 'crypto'
import {default as atob} from 'atob'
import {default as btoa} from 'btoa'
import {LedgerApi} from './api'
import {logger} from './utils'
import {RunTimeError, ValidationError} from './errors'
import {Parser} from './parser/parser'
import {ShardMask} from './serialization/shardmask'
import {Identity} from "./crypto";

interface ContractJSONSerialized {
      readonly version: number,
      readonly owner: string,
      readonly source: string,
      readonly nonce: string,
}

type ContractsApiLike = ContractTxFactory | LedgerApi

const compute_digest = (source) : Address => {
    const hash_func = createHash('sha256')
    hash_func.update(source)
    const digest = hash_func.digest()
    return new Address(digest)
}


const calc_address = (owner, nonce) => {
    assert(owner instanceof Address)
    const hash_func = createHash('sha256')
    hash_func.update(owner.toBytes())
    hash_func.update(nonce)
    return hash_func.digest()
}

export class Contract {
	public _address: Address;
	public _digest: Address;
	public _init: any;
	public _nonce: Buffer;
	public _owner: Address;
	public _source: string;

    constructor(source : string, owner: Identity | Address | string, nonce: Buffer = null) {
        assert(typeof source === 'string')
        this._source = source
        this._digest = compute_digest(source)
        this._owner = new Address(owner)
        this._nonce = nonce || randomBytes(8)
        this._address = new Address(calc_address(this._owner, this._nonce))
    }

    name() : string {
        return this._digest.toBytes().toString('hex') + this._address.toHex()
    }

    encoded_source() : string {
        return btoa(this._source)
    }

    // combined getter/setter mimicking the python.
    owner(owner = null) : Address {
        if (owner !== null) this._owner = new Address(owner)
        return this._owner
    }

    digest() : Address {
        return this._digest
    }

    source() : string {
        return this._source
    }

    dumps() : string {
        return JSON.stringify(this.to_json_object())
    }

    dump(fp: string ) : void {
        fs.writeFileSync(fp, JSON.stringify(this.to_json_object()))
    }

    static loads(s: string ) : Contract {
        return Contract.from_json_object(JSON.parse(s))
    }

    static load(fp: string) : Contract {
        const obj = JSON.parse(fs.readFileSync(fp, 'utf8'))
        return Contract.from_json_object(obj)
    }

    nonce() : string {
        return btoa(this._nonce)
    }

    nonce_bytes() : Buffer {
        return this._nonce
    }

    address() : Address {
        return this._address
    }

    async create(api: ContractsApiLike, owner, fee, signers = null) : Promise<string> {
        this.owner(owner)
         //todo THIS LOOKS LIKE BUG, look at later. It can never == null so unreachable at present.
        if (this._init === null) {
            throw new RunTimeError('Contract has no initialisation function')
        }

        let shard_mask
        try {

            //TODO modify hen added etch parser
            // temp we put empty shard mask.
            shard_mask = new BitVector()
        } catch (e) {
            logger.info('WARNING: Couldn\'t auto-detect used shards, using wildcard shard mask')
            shard_mask = new BitVector()
        }
        return Contract.api(api).create(owner, this, fee, signers, shard_mask)
    }

    async query(api: ContractsApiLike, name, data) {

        if (this._owner === null) {
            throw new RunTimeError('Contract has no owner, unable to perform any queries. Did you deploy it?')
        }

        const annotations = Parser.get_annotations(this._source)

        if (typeof annotations['@query'] === 'undefined' || !annotations['@query'].includes(name)){
            throw new ValidationError(
                `Contract does not contain function: ${name} with annotation @query`
            )
        }


        const [success, response] = await Contract.api(api).query(this._address, name, data)

        if (!success) {
            if (response !== null && 'msg' in response) {
                throw new RunTimeError('Failed to make requested query: ' + response['msg'])
            } else {
                throw new RunTimeError('Failed to make requested query with no error message.')
            }
        }
        return response['result']
    }

    async action(api: ContractsApiLike, name, fee, args, signers = null) {
        // verify if we are used undefined
        if (this._owner === null) {
            throw new RunTimeError('Contract has no owner, unable to perform any actions. Did you deploy it?')
        }

        const annotations = Parser.get_annotations(this._source)

        if (typeof annotations['@action'] === 'undefined' || !annotations['@action'].includes(name)) {
            throw new ValidationError(
                `Contract does not contain function: ${name} with annotation @action`
            )
        }

        // now lets validate the args
        const resource_addresses = Parser.get_resource_addresses(this._source, name, args)
        const num_lanes = await api.server.num_lanes()
        let shard_mask = ShardMask.resources_to_shard_mask(resource_addresses, num_lanes)
        const from_address = (signers.length === 1)? new Address(signers[0]) : new Address(this._owner)
        return Contract.api(api).action(this._address, name, fee, from_address, args, signers, shard_mask)
    }


    static api(ContractsApiLike: ContractsApiLike) {
        if (ContractsApiLike instanceof ContractTxFactory) {
            return ContractsApiLike
        } else if (ContractsApiLike instanceof LedgerApi) {
            return ContractsApiLike.contracts
        } else {
            throw new ValidationError("")
        }
    }

    static from_json_object(obj: ContractJSONSerialized) : Contract {
        assert(obj['version'] === 1)
        const source = atob(obj.source)
        const owner = obj['owner']
        const nonce = atob(obj['nonce'])
        return new Contract(
            source,
            owner,
            nonce)
    }

    to_json_object() : ContractJSONSerialized {
        return {
            'version': 1,
            'owner': this._owner.toString(), // None if self._owner is None else str(self._owner),
            'source': this.encoded_source(),
            'nonce': this.nonce(),
        }
    }

}

