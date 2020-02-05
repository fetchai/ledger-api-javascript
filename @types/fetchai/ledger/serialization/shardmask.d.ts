import { BitVector } from '../bitvector';
import { Contract } from '../contract';
export declare class ShardMask {
    static state_to_address(state: string, contract: Contract): string;
    static resources_to_shard_mask(resource_addresses: Array<string>, num_lanes: number): BitVector;
    static resource_to_shard(resource_address: string, num_lanes: number): number;
}
