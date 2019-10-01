import assert from 'assert'
import {BitVector} from '../bitvector'
import {Contract} from '../contract'
import {calc_digest} from '../utils'

function powerOfTwo(x: number): boolean {
    return Math.log2(x) % 1 === 0
}

export class ShardMask {

    static state_to_address(state: string, contract: Contract): string {
        assert(contract.owner())
        return `${contract.digest().toHex()}.${contract.owner()}.state.${state}`
    }

    static resources_to_shard_mask(resource_addresses: Array<string>, num_lanes: number): BitVector {
        const shards = []
        for (let i = 0; i < resource_addresses.length; i++) {
            shards.push(ShardMask.resource_to_shard(resource_addresses[i], num_lanes))
        }
        return BitVector.from_indices(shards, num_lanes)
    }

    static resource_to_shard(resource_address: string, num_lanes: number): number {
        assert(num_lanes > 0 && powerOfTwo(num_lanes))
        //Resource ID from address.
        const resource_id = calc_digest(resource_address)
        // Take last 4 bytes
        const group = resource_id.readUIntLE(0, 4)
        // modulo number of lanes
        const shard = group & (num_lanes - 1)
        return shard
    }
}
