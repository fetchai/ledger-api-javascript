import assert from 'assert'
import {encode, ExtensionCodec} from "@msgpack/msgpack";
import {Address} from "../crypto";
import {ApiEndpoint} from "./common";
import {BitVector} from "../bitvector";
import {Contract} from "../contract";
import {default as btoa} from 'btoa';
import {encode_transaction} from "../serialization/transaction";
import {logger} from '../utils'


export class ContractsApi extends ApiEndpoint {

    constructor(HOST, PORT) {
        super(HOST, PORT);
        // tidy up before submitting
        this.prefix = 'fetch.contract';
    }


    //params: owner: Entity, contract: 'Contract', fee: int, shard_mask: BitVector = None
    async create(owner, fee, contract, shard_mask = null) {
        assert(contract instanceof Contract)
        const ENDPOINT = 'create';
        // Default to wildcard shard mask if none supplied
        if (shard_mask = null) {
            logger.info("WARNING: defaulting to wildcard shard mask as none supplied")
            shard_mask = new BitVector()
        }

        const tx = await this.create_skeleton_tx(fee);
        tx.from_address(owner)
        tx.target_chain_code(this.prefix, shard_mask)
        tx.action(ENDPOINT);

        tx.data(JSON.stringify({
            'text': contract.encoded_source(),
            'digest': contract.digest().toHex(),
            'nonce': btoa("foo")
        }))
        tx.add_signer(owner.public_key_hex())
        const encoded_tx = encode_transaction(tx, [owner])
        contract.owner(owner)
        return await this._post_tx_json(encoded_tx, ENDPOINT)
    }


    async query(contract_digest, contract_owner, query, data) {
        assert(this.IsJsonObject(data))
        const prefix = `${contract_digest.toHex()}.${contract_owner.toString()}`
        const encoded = this._encode_json_payload(data);
        console.log('encoded : ' + JSON.stringify(encoded));
        return await this._post_json(query, encoded, prefix)
    }


    async action(contract_digest, contract_address, action, fee, from_address, signers, args, shard_mask = null) {
        debugger;
        if (shard_mask === null) {
            // logger.info('WARNING: defaulting to wildcard shard mask as none supplied');
            shard_mask = new BitVector()
        }
        // build up the basic transaction information
        const tx = await this.create_skeleton_tx(fee);
        tx.from_address(from_address)
        tx.target_contract(contract_digest, contract_address, shard_mask)
        tx.action(action)
        tx.data(this._encode_msgpack_payload(args))
        for (let i = 0; i < signers.length; i++) {
            tx.add_signer(signers[i].public_key_hex())
        }

        const encoded_tx = encode_transaction(tx, signers);
        return await this._post_tx_json(encoded_tx, null)
    }

    _encode_msgpack_payload(args) {
        assert(Array.isArray(args))
        const extensionCodec = new ExtensionCodec();
        extensionCodec.register({
            type: 77,
            encode: (object) => {
                if (object instanceof Address) {
                    return object.toBytes();
                } else {
                    return null;
                }
            }
        });
        return encode(args, {extensionCodec});
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
                params[key] = value
            } else if (value instanceof Address) {
                params[key] = value.toString()
            } else {
                params[key] = this._encode_json_payload(value)
            }
        }
        return params;
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

