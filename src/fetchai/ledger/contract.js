import {Address} from "./crypto/address";
import {RunTimeError} from "./errors";
import {logger} from "./utils";
import {BitVector} from "./bitvector";
import {default as btoa} from 'btoa';
import * as  fs from 'fs'
import {createHash, randomBytes} from 'crypto'
import assert from 'assert'
import {ContractsApi} from "./api/contracts";
import {LedgerApi} from "./api";
import {default as atob} from 'atob';


const _compute_digest = (source) => {
        const hash_func = createHash('sha256')
        hash_func.update(source, 'ascii')
    console.log('before digest hex')
    const d = hash_func.digest()
    console.log(d.toString('hex'))
    console.log('after digest hex')
        return new Address(d)
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
            assert(typeof source === "string")
            // convert to ascii
            const r = Buffer.from(source, 'utf8');
            this._source =  r.toString('ascii')
            this._digest = _compute_digest(source)
            this._owner = new Address(owner);
            this._nonce = nonce || randomBytes(8);
            this._address = new Address(calc_address(this._owner, this._nonce));

            //TODO add etch parser
            //this._parser = new EtchParser(this._source)
        //TODO get rest of this constructor when we add etch parser
        }

        name(){
            return this._digest.toBytes().toString('hex') + this._address.toHex();
        }

         encoded_source() {
                 return btoa(this._source);
         }

       // combined getter/setter mimicing the python.
       owner(owner = null) {
            if(owner !== null) this._owner = new Address(owner)
            return this._owner;
       }

       digest() {
           return this._digest;
       }

       source() {
           return this._source;
       }

       dumps() {
           console.log("STARTS HERE !!!");
           console.log(JSON.stringify(this._to_json_object()))
           console.log("AND IT ENDS ABOUT HERE !!!");
           return JSON.stringify(this._to_json_object());
       }

       dump(fp) {
           fs.writeFileSync(fp, JSON.stringify(this._to_json_object()));
       }

      static loads(s) {
          return Contract._from_json_object(JSON.parse(s));
      }

      static load(fp) {
            const obj = JSON.parse(fs.readFileSync(fp, 'utf8'))
          return Contract._from_json_object(obj);
      }

        nonce() {
            return btoa(this._nonce);
        }

        nonce_bytes() {
            return this._nonce
        }

        address() {
            return this._address
        }

        /*
         def create(self, api: ContractsApiLike, owner: Entity, fee: int):
         */
        async create(api, owner, fee) {
         // Set contract owner (required for resource prefix)
        this.owner(owner);

        if(this._init === null){
             throw new RunTimeError('Contract has no initialisation function')
        }

        let shard_mask
        try{
           // const resource_addresses = ['fetch.contract.state.' + this.digest.toHex()];
            // temp we put empty shard mask.
            shard_mask = new BitVector();
            // resource_addresses.extend(ShardMask.state_to_address(address, self) for address in
            //                           self._parser.used_globals_to_addresses(self._init, [self._owner]))
        } catch(e) {
            /*  except (UnparsableAddress, UseWildcardShardMask): */
             logger.info(`WARNING: Couldn't auto-detect used shards, using wildcard shard mask`)
            shard_mask = new BitVector();
        }
return Contract._api(api).create(owner, fee, this, shard_mask)
        }

        async query(api, name, data) {
            //notetoself: can this be null?? maybe undefined would be better.
          if(this._owner === null){

             throw new RunTimeError('Contract has no owner, unable to perform any queries. Did you deploy it?')
        }

        // if(!this.queries.contains(name)){
        //     throw new RunTimeError(name + ' is not an valid query name. Valid options are: ' + this.queries.join(','))
        // }

        // make the required query on the API
            let tester = Contract._api(api);
            let success, response, respons2, y;

            try {
                y = this._digest.toHex();
                console.log('y is ' + y)
                respons2 = await tester.query(this._digest, this._owner, name, data)
            } catch (e) {
                debugger;

            }

            if (!respons2) {
            if(typeof response !== null && "msg" in response) {
                throw new RunTimeError('Failed to make requested query: ' + response["msg"])
            } else {
                 throw new RunTimeError('Failed to make requested query with no error message.')
            }
      }
            return respons2['result']
        }

// (self, api: ContractsApiLike, name: str, fee: int, signers: List[Entity], *args):
        async action(api, name, fee, signers, args) {
            // verify if we are used undefined
      if(this._owner === null) {
           throw new RunTimeError('Contract has no owner, unable to perform any actions. Did you deploy it?')
      }

            // if(!name in this._actions){
            //      throw new RunTimeError(`${name} is not an valid action name. Valid options are: ${this._actions.join(',')}`)
            //  }
// (self, api: ContractsApiLike, name: str, fee: int, signers: List[Entity], *args):
       let shard_mask;
       try {
             // Generate resource addresses used by persistent globals
            // const resource_addresses = [ShardMask.state_to_address(address, self) for address in
            //                       self._parser.used_globals_to_addresses(name, list(args))]

           // Generate shard mask from resource addresses
          //   const shard_mask = ShardMask.resources_to_shard_mask(resource_addresses, api.server.num_lanes())
            shard_mask = new BitVector();
       }
       catch(e){
            logger.info("WARNING: Couldn't auto-detect used shards, using wildcard shard mask")
            shard_mask = new BitVector();
       }
            // self._digest, self.address, name, fee, self.owner, signers, *args,
            //                                      shard_mask=shard_mask

            // return self._api(api).action(self._digest, self.address, name, fee, self.owner, signers, *args,
            //    shard_mask=shard_mask)

            return Contract._api(api).action(this._digest, this._address, name, fee, this._owner, signers, args, shard_mask)
}


        static _api(ContractsApiLike){
            if(ContractsApiLike instanceof ContractsApi){
                return ContractsApiLike;
            } else if(ContractsApiLike instanceof LedgerApi){
                return ContractsApiLike.contracts
            } else {
                assert(false)
            }
        }

        static  _from_json_object(obj) {
            assert(obj['version'] === 1)
            const source = atob(obj.source)
            const owner = obj['owner']
            const nonce = atob(obj['nonce'])
            return new Contract(
                source,
                owner,
                nonce)

            return
        }

    _to_json_object(){
        return {
            'version': 1,
            'owner': this._owner.toString(), // None if self._owner is None else str(self._owner),
            'source': this.encoded_source(),
            'nonce': this.nonce(),
        }
    }

    }

