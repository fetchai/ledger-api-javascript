import {Address} from "./crypto/address";
import {RunTimeError} from "./errors";
import {logger} from "./utils";
import {BitVector} from "./bitvector";
 import {default as btoa} from 'btoa';
import * as  fs from 'fs'
import {createHash} from 'crypto'
import assert from 'assert'
import {ContractsApi} from "./api/contracts";
import {LedgerApi} from "./api";

const _compute_digest = (source) => {
        const hash_func = createHash('sha256')
        hash_func.update(source, 'ascii')
    console.log('before digest hex')
    const d = hash_func.digest()
    console.log(d.toString('hex'))
    console.log('after digest hex')
        return new Address(d)
    }

    export class Contract {

        constructor(source) {
            assert(typeof source === "string")

            // convert to ascii
            const r = Buffer.from(source, 'utf8');
            this._source =  r.toString('ascii')
            this._digest = _compute_digest(source)
            debugger;
            this._owner = null

            /*
            //TODO add etch parser
          // Etch parser for analysing contract
        this._parser = new EtchParser(this._source)
        //TODO get rest of this constructor when we add etch parser
             */
        }

        name(){
            return this._digest.toBytes().toString('hex') + this._owner;
        }

         encoded_source() {
            //  btoa takes buffer also, and probably ideally.
             console.log('beforeb64');
             console.log(btoa(this._source));
              console.log('afterb64');
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
           return this._digest;
       }

       dumps() {
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
          return Contract._from_json_object(JSON.parse(obj));
      }

        /*
         def create(self, api: ContractsApiLike, owner: Entity, fee: int):
         */
create(api, owner, fee){
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

query(api, name, ...data){
            //notetoself: can this be null?? maybe undefined would be better.
          if(this._owner === null){

             throw new RunTimeError('Contract has no owner, unable to perform any queries. Did you deploy it?')
        }

        // if(!this.queries.contains(name)){
        //     throw new RunTimeError(name + ' is not an valid query name. Valid options are: ' + this.queries.join(','))
        // }

        // make the required query on the API

    debugger;
        const [success, response] = Contract._api(api).query(this._digest, this._owner, name, ...data)

      if(!success){
            if(typeof response !== null && "msg" in response) {
                throw new RunTimeError('Failed to make requested query: ' + response["msg"])
            } else {
                 throw new RunTimeError('Failed to make requested query with no error message.')
            }
      }
        return response['result']
}


action(api, name, fee, signers, ...args){
            // verify if we are used undefined
      if(this._owner === null) {
           throw new RunTimeError('Contract has no owner, unable to perform any actions. Did you deploy it?')
      }

       if(!name in this._actions){
            throw new RunTimeError(`${name} is not an valid action name. Valid options are: ${this._actions.join(',')}`)
        }
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
       return Contract._api(api).action(this._digest, this._owner, name, fee, signers, shard_mask, ...args)
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
            const source = obj.source
            // add this.
            // source = base64.b64decode(obj['source']).decode()
            const sc = new Contract(source);

            const owner = obj['owner']
            if (owner !== null) {
                sc.owner = owner;
            }
            return sc;
        }

    _to_json_object(){
        return {
            'version': 1,
            'owner': this.owner, // None if self._owner is None else str(self._owner),
            'source': this.encoded_source()
        }
    }

    }

