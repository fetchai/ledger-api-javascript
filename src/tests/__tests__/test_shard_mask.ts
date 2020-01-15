import { Contract, TRANSFER_CONTRACT} from '../../fetchai/ledger'
import {calc_digest, ENTITIES} from '../utils/helpers'
import {ShardMask} from '../../fetchai/ledger/serialization/shardmask'


describe(':Test ShardMask', () => {

    test('test state to address', () => {
        debugger;
        const nonce = calc_digest('random').slice(0, 8)
        const contract = new Contract(TRANSFER_CONTRACT, ENTITIES[0], nonce)
        const address = ShardMask.state_to_address('xyz', contract)
        expect(address).toEqual('ee6bb75e0ffe50fa0b4df5be9e43110908cfb85ea8e13889690b883fa3e37220.dcgBKQnx4i3ayLbqcqstt4kSHNfDC4Am9TgyhF4RimY1eNHTP.state.xyz')
    })

    test('test resource to shard', () => {
        expect(() => {
            ShardMask.resource_to_shard('abc', 3)
        }).toThrow()

        //Test known addresses
        const addresses = ['abc', 'def', 'XYZ']
        const shards = [2, 3, 1]
        //swap to https://stackoverflow.com/questions/45713938/jest-looping-through-dynamic-test-cases

        for(let i = 0; i < shards.length; i++){
            expect(ShardMask.resource_to_shard(addresses[i], 4)).toBe(shards[i])
        }

        const  addresses2 = ['abc', 'def', 'XYZ']
        const shards2 = [10, 11, 13]

        for(let i = 0; i < shards2.length; i++) {
            expect(ShardMask.resource_to_shard(addresses2[i], 16)).toBe(shards2[i])
        }
    })

    test('test resources to shard mask', () => {
        const num_lanes = 4
        const bv = ShardMask.resources_to_shard_mask(['abc', 'def', 'XYZ'], num_lanes)
        expect(bv._size).toBe(num_lanes)
        expect(bv.as_binary()).toBe('00001110')
    })
})

