import * as  fs from 'fs'
import assert from 'assert'
import {Address} from './crypto/address'
import {BitVector} from './bitvector'
import {ContractsApi} from './api/contracts'
import {createHash, randomBytes} from 'crypto'
import {default as atob} from 'atob'
import {default as btoa} from 'btoa'
import {LedgerApi} from './api'
import {logger} from './utils'
import {RunTimeError} from './errors'


const _compute_digest = (source) => {
    const hash_func = createHash('sha256')
    hash_func.update(source, 'utf')
    const digest = hash_func.digest()
    return new Address(digest)
}


const calc_address = (owner, nonce) => {
    assert(owner instanceof Address)
    const hash_func = createHash('sha256')
    hash_func.update(owner.toBytes(), 'utf')
    hash_func.update(nonce, 'utf')
    return hash_func.digest()
}

export class Contract {

    constructor(source, owner, nonce = null) {
        assert(typeof source === 'string')
        this._source = source
        this._digest = _compute_digest(source)
        this._owner = new Address(owner)
        this._nonce = nonce || randomBytes(8)
        this._address = new Address(calc_address(this._owner, this._nonce))
        //TODO add etch parser
        //this._parser = new EtchParser(this._source)
        //TODO get rest of this constructor when we add etch parser
    }

    name() {
        return this._digest.toBytes().toString('hex') + this._address.toHex()
    }

    encoded_source() {
        return btoa(this._source)
    }

    // combined getter/setter mimicking the python.
    owner(owner = null) {
        if (owner !== null) this._owner = new Address(owner)
        return this._owner
    }

    digest() {
        return this._digest
    }

    source() {
        return this._source
    }

    dumps() {
        return JSON.stringify(this._to_json_object())
    }

    dump(fp) {
        fs.writeFileSync(fp, JSON.stringify(this._to_json_object()))
    }

    static loads(s) {
        return Contract._from_json_object(JSON.parse(s))
    }

    static load(fp) {
        const obj = JSON.parse(fs.readFileSync(fp, 'utf8'))
        return Contract._from_json_object(obj)
    }

    nonce() {
        return btoa(this._nonce)
    }

    nonce_bytes() {
        return this._nonce
    }

    address() {
        return this._address
    }

    async create(api, owner, fee) {
        this.owner(owner)

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
        return Contract._api(api).create(owner, fee, this, shard_mask)
    }

    async query(api, name, data) {

        if (this._owner === null) {
            throw new RunTimeError('Contract has no owner, unable to perform any queries. Did you deploy it?')
        }

        // if(!this.queries.contains(name)){
        //     throw new RunTimeError(name + ' is not an valid query name. Valid options are: ' + this.queries.join(','))
        // }
        const [success, response] = await Contract._api(api).query(this._digest, this._address, name, data)

        if (!success) {
            if (response !== null && 'msg' in response) {
                throw new RunTimeError('Failed to make requested query: ' + response['msg'])
            } else {
                throw new RunTimeError('Failed to make requested query with no error message.')
            }
        }
        return response['result']
    }

    async action(api, name, fee, signers, args) {
        // verify if we are used undefined
        if (this._owner === null) {
            throw new RunTimeError('Contract has no owner, unable to perform any actions. Did you deploy it?')
        }

        // if(!name in this._actions){
        //      throw new RunTimeError(`${name} is not an valid action name. Valid options are: ${this._actions.join(',')}`)
        //  }
        // (self, api: ContractsApiLike, name: str, fee: int, signers: List[Entity], *args):
        let shard_mask
        try {
            // Generate resource addresses used by persistent globals
            // const resource_addresses = [ShardMask.state_to_address(address, self) for address in
            //                       self._parser.used_globals_to_addresses(name, list(args))]
            // Generate shard mask from resource addresses
            //   const shard_mask = ShardMask.resources_to_shard_mask(resource_addresses, api.server.num_lanes())
            shard_mask = new BitVector()
        } catch (e) {
            logger.info('WARNING: Couldn\'t auto-detect used shards, using wildcard shard mask')
            shard_mask = new BitVector()
        }
        return Contract._api(api).action(this._digest, this._address, name, fee, this._owner, signers, args, shard_mask)
    }


    static _api(ContractsApiLike) {
        if (ContractsApiLike instanceof ContractsApi) {
            return ContractsApiLike
        } else if (ContractsApiLike instanceof LedgerApi) {
            return ContractsApiLike.contracts
        } else {
            assert(false)
        }
    }

    static _from_json_object(obj) {
        assert(obj['version'] === 1)
        const source = atob(obj.source)
        const owner = obj['owner']
        const nonce = atob(obj['nonce'])
        return new Contract(
            source,
            owner,
            nonce)
    }

    _to_json_object() {
        return {
            'version': 1,
            'owner': this._owner.toString(), // None if self._owner is None else str(self._owner),
            'source': this.encoded_source(),
            'nonce': this.nonce(),
        }
    }

}

