import * as  fs from 'fs'
import assert from 'assert'
import {Address} from './crypto/address'
import {BitVector} from './bitvector'
import {ContractsApi, ContractTxFactory} from './api/contracts'
import {createHash, randomBytes} from 'crypto'
import {default as atob} from 'atob'
import {default as btoa} from 'btoa'
import {LedgerApi} from './api'
import {calc_digest, convert_number, logger} from './utils'
import {RunTimeError, ValidationError} from './errors'
import {Parser} from './parser/parser'
import {ShardMask} from './serialization/shardmask'
import {Entity} from './crypto/entity'
import {ServerApi} from './api/server'

interface ContractJSONSerialized {
    readonly version: number;
    readonly owner: string;
    readonly source: string;
    readonly nonce: string;
}

interface CreateContractOptions {
    api: ContractsApiLike;
    owner: Entity;
    fee: NumericInput;
    signers?: Array<Entity> | null;
}

interface QueryContractOptions {
    api: ContractsApiLike;
    name: string;
    data: any;
}

interface ActionContractOptions {
    api: ContractsApiLike;
    name: string;
    fee: NumericInput;
    args: MessagePackable;
    signers: Array<Entity> | null;
}

type ContractsApiLike = ContractTxFactory | LedgerApi

const calc_address = (owner: Address, nonce: Buffer): Buffer => {
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

    constructor(source: string, owner: AddressLike, nonce?: Buffer) {
        assert(typeof source === 'string')
        this._source = source
        this._digest = new Address(calc_digest(source))
        this._owner = new Address(owner)
        this._nonce = nonce || randomBytes(8)
        this._address = new Address(calc_address(this._owner, this._nonce))
    }

    static loads(s: string): Contract {
        return Contract.from_json_object(JSON.parse(s))
    }

    static load(fp: string): Contract {
        const obj = JSON.parse(fs.readFileSync(fp, 'utf8'))
        return Contract.from_json_object(obj)
    }

    static api(ContractsApiLike: ContractsApiLike): ContractTxFactory | LedgerApi['contracts'] {
        if (ContractsApiLike instanceof ContractTxFactory) {
            return ContractsApiLike
        } else if (ContractsApiLike instanceof LedgerApi) {
            return ContractsApiLike.contracts
        } else {
            throw new ValidationError('')
        }
    }

    static from_json_object(obj: ContractJSONSerialized): Contract {
        assert(obj['version'] === 1)
        const source = atob(obj.source)
        const owner = obj['owner']
        const nonce = atob(obj['nonce'])
        return new Contract(
            source,
            owner,
            Buffer.from(nonce, 'base64'))
    }

    name(): string {
        return this._digest.toBytes().toString('hex') + this._address.toHex()
    }

    encoded_source(): string {
        return btoa(this._source)
    }

    // combined getter/setter mimicking the python.
    owner(owner: AddressLike | null = null): Address {
        if (owner !== null) this._owner = new Address(owner)
        return this._owner
    }

    digest(): Address {
        return this._digest
    }

    source(): string {
        return this._source
    }

    dumps(): string {
        return JSON.stringify(this.to_json_object())
    }

    dump(fp: string): void {
        fs.writeFileSync(fp, JSON.stringify(this.to_json_object()))
    }

    nonce(): string {
        return btoa(this._nonce)
    }

    nonce_bytes(): Buffer {
        return this._nonce
    }

    address(): Address {
        return this._address
    }

    async create({api, owner, fee, signers = null}: CreateContractOptions ): Promise<string> {
        this.owner(owner)
        fee = convert_number(fee)
        //todo THIS LOOKS LIKE BUG, look at later. It can never == null so unreachable at present.
        if (this._init === null) {
            throw new RunTimeError('Contract has no initialisation function')
        }

        let shard_mask
        try {
            //todo todo todo todo todo
            //TODO modify hen added etch parser
            // temp we put empty shard mask.
            shard_mask = new BitVector()
        } catch (e) {
            logger.info('WARNING: Couldn\'t auto-detect used shards, using wildcard shard mask')
            shard_mask = new BitVector()
        }
        return Contract.api(api).create({owner: owner, contract: this, fee: fee, signers: signers, shard_mask: shard_mask})
    }


    //todo should this data be optional param.
    async query({api, name, data}: QueryContractOptions): Promise<any> {

        if (this._owner === null) {
            throw new RunTimeError('Contract has no owner, unable to perform any queries. Did you deploy it?')
        }

        const annotations = Parser.get_annotations(this._source)

        if (typeof annotations['@query'] === 'undefined' || !annotations['@query'].includes(name)) {
            throw new ValidationError(
                `Contract does not contain function: ${name} with annotation @query`
            )
        }
        const [success, response] = await (Contract.api(api) as ContractsApi).query({contract_owner: this._address, query: name, data: data})

        if (!success) {
            if (response !== null && 'msg' in response) {
                throw new RunTimeError('Failed to make requested query: ' + response['msg'])
            } else {
                throw new RunTimeError('Failed to make requested query with no error message.')
            }
        }
        return response['result']
    }



    async action({api, name, fee, args, signers = null}: ActionContractOptions): Promise<any> {

        fee = convert_number(fee)
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
        const num_lanes = await (api.server as ServerApi).num_lanes()
        const shard_mask = ShardMask.resources_to_shard_mask(resource_addresses, num_lanes)
        const from_address = (signers.length === 1) ? new Address(signers[0]) : new Address(this._owner)
        return Contract.api(api).action({contract_address: this._address, action: name, fee: fee, from_address: from_address, args: args, signers: signers, shard_mask: shard_mask})
    }

    to_json_object(): ContractJSONSerialized {
        return {
            'version': 1,
            'owner': this._owner.toString(), // None if self._owner is None else str(self._owner),
            'source': this.encoded_source(),
            'nonce': this.nonce(),
        }
    }

}

