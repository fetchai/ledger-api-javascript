import assert from 'assert'
import {createHash} from "crypto";
import {BitVector} from '../bitvector'

const _compute_digest = (source) => {
    const hash_func = createHash('sha256')
    hash_func.update(source)
    const digest = hash_func.digest()
    return digest
}

function powerOfTwo(x) {
    return Math.log2(x) % 1 === 0;
}

export class ShardMask {

    static state_to_address(state, contract) {
        // TODO: note circular dependency, as this will be called by contract
        assert(contract.owner);
        return `${contract.digest().toString('hex')}.${contract.owner()}.state.${state}`;
    }

    static state_to_address(state, contract) {
        // TODO: note circular dependency, as this will be called by contract
        assert(contract.owner())
        // .state then
        return `${contract.digest().toString('hex')}.${contract.owner()}.state.${state}`;
    }

    static resources_to_shard_mask(resource_addresses, num_lanes) {
        const shards = []
        for(let i = 0; i < resource_addresses.length; i++) {
            shards.push(ShardMask.resource_to_shard(resource_addresses[i], num_lanes));
        }
        console.log("THE NUMBER OF LANES:: " + num_lanes);
        return BitVector.from_indices(shards, num_lanes)
    }

    static resource_to_shard(resource_address, num_lanes) {
         assert(num_lanes > 0 && powerOfTwo(num_lanes))
        //Resource ID from address.
        const resource_id =  _compute_digest(String(resource_address))
        // Take last 4 bytes
        const group = resource_id.readUIntLE(0,4)
        // modulo number of lanes
        let shard = group & (num_lanes - 1)
        return shard
    }
}
