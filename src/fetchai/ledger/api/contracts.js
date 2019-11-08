import {BitVector} from "../bitvector";
import {ApiEndpoint} from "./common";
import {logger} from '../utils'
import {Address} from "../crypto";
import {encode_transaction} from "../serialization/transaction";
import {default as btoa} from 'btoa';
import assert from 'assert'
import {RunTimeError} from "../errors";

// const API_PREFIX = 'fetch.contract';

export class ContractsApi extends ApiEndpoint {

    constructor(HOST, PORT) {
        super(HOST, PORT);
        // tidy up before submitting
        this.prefix = 'fetch.contract';
    }


    //params: owner: Entity, contract: 'Contract', fee: int, shard_mask: BitVector = None
    async create(owner, fee, contract, shard_mask = null) {
        //assert(contract instanceof Co)

        const ENDPOINT = 'create';
        // format the data to be closed by the transaction
        // Default to wildcard shard mask if none supplied
        if (shard_mask = null) {
            logger.info("WARNING: defaulting to wildcard shard mask as none supplied")
            shard_mask = new BitVector()
        }

        const tx = await this.create_skeleton_tx(fee);
        tx.from_address(new Address(owner))
        tx.target_chain_code(this.prefix, shard_mask)
        tx.action(ENDPOINT);
        // payload.data('{"value": 1234}') //

        console.log('data start')
        console.log(contract.encoded_source())
        console.log(contract.digest().toHex())
        console.log('data end')

        tx.data(JSON.stringify({
            'text': contract.encoded_source(),
            'digest': contract.digest().toHex(),
            'nonce': btoa("foo")
        }))
        // tx.data('{"text": "CnBlcnNpc3RlbnQgc2hhcmRlZCBiYWxhbmNlIDogVUludDY0OwoKQGluaXQKZnVuY3Rpb24gc2V0dXAob3duZXIgOiBBZGRyZXNzKQogIHVzZSBiYWxhbmNlW293bmVyXTsKICBiYWxhbmNlLnNldChvd25lciwgMTAwMDAwMHU2NCk7CmVuZGZ1bmN0aW9uCgpAYWN0aW9uCmZ1bmN0aW9uIHRyYW5zZmVyKGZyb206IEFkZHJlc3MsIHRvOiBBZGRyZXNzLCBhbW91bnQ6IFVJbnQ2NCkKCiAgdXNlIGJhbGFuY2VbZnJvbSwgdG9dOwogIAogIC8vIENoZWNrIGlmIHRoZSBzZW5kZXIgaGFzIGVub3VnaCBiYWxhbmNlIHRvIHByb2NlZWQKICBpZiAoYmFsYW5jZS5nZXQoZnJvbSkgPj0gYW1vdW50KQoKICAgIC8vIHVwZGF0ZSB0aGUgYWNjb3VudCBiYWxhbmNlcwogICAgYmFsYW5jZS5zZXQoZnJvbSwgYmFsYW5jZS5nZXQoZnJvbSkgLSBhbW91bnQpOwogICAgYmFsYW5jZS5zZXQodG8sIGJhbGFuY2UuZ2V0KHRvLCAwdTY0KSArIGFtb3VudCk7CiAgZW5kaWYKCmVuZGZ1bmN0aW9uCgpAcXVlcnkKZnVuY3Rpb24gYmFsYW5jZShhZGRyZXNzOiBBZGRyZXNzKSA6IFVJbnQ2NAogICAgdXNlIGJhbGFuY2VbYWRkcmVzc107CiAgICByZXR1cm4gYmFsYW5jZS5nZXQoYWRkcmVzcywgMHU2NCk7CmVuZGZ1bmN0aW9uCgo=", "digest": "462d40cf1e280f8c6fcf557292bd93d183014a368046e3fb5a8c1e02cef3f33e"}')
        tx.add_signer(owner.public_key_hex())
        // encode and sign the transaction
        //const encoded_tx = encode_transaction(tx, [owner]);
        const encoded_tx = encode_transaction(tx, [owner])
        // update the contracts owner
        contract.owner(owner)
        // submit the transaction
        return await this._post_tx_json(encoded_tx, ENDPOINT)
    }


    async query(contract_digest, contract_owner, query, data) {
        assert(this.IsJsonObject(data))
        const prefix = `${contract_digest.toHex()}.${contract_owner.toString()}`
        debugger;
        return await this._post_json(query, this._encode_json_payload(data), prefix)
    }

    action(contract_digest, contract_owner, action, fee, signers, shard_mask = null, ...args) {
        if (shard_mask === null) {
            logger.info('WARNING: defaulting to wildcard shard mask as none supplied');
            const shard_mask = new BitVector()
        }
    }

    _encode_json_payload(data) {
        assert(typeof data === 'object' && data !== null)
        const params = {}

        let new_key;
        //generic object/array loop
        for (let [key, value] of Object.entries(data)) {
            assert(typeof key === 'string')

            if (key.endsWith('_')) {
                new_key = key.substring(0, key.length - 1);
                // mutate key name
                delete Object.assign(data, {[new_key]: data[key]})[new_key];
                key = new_key;
            }
            if (ContractsApi._is_primitive(value)) {
                data[key] = value
            } else if (value instanceof Address) {
                params[key] = value.toString()
            } else if (Object(value)) {
                params[key] = this._encode_json_payload(value)
            } else {
                throw new RunTimeError('Unknown item to pack:' + value)
            }
        }
        return params
    }

    static _is_primitive(test) {
        return (test !== Object(test))
    };


    IsJsonObject(o) {
        try {
            JSON.stringify(o);
        } catch (e) {
            return false;
        }
        return true;
    }


}

