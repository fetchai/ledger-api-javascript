"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ledger_1 = require("../../fetchai/ledger");
var helpers_1 = require("../utils/helpers");
var shardmask_1 = require("../../fetchai/ledger/serialization/shardmask");
describe(':Test ShardMask', function () {
    test('test state to address', function () {
        var nonce = helpers_1.calc_digest('random').slice(0, 8);
        var contract = new ledger_1.Contract(ledger_1.TRANSFER_CONTRACT, helpers_1.ENTITIES[0], nonce);
        var address = shardmask_1.ShardMask.state_to_address('xyz', contract);
        expect(address).toEqual('2p192tJM2ySFt2P4pC7HL5YSKMgzsDxgRQzwVgoCZU6dsVF2UR.dcgBKQnx4i3ayLbqcqstt4kSHNfDC4Am9TgyhF4RimY1eNHTP.state.xyz');
    });
    test('test resource to shard', function () {
        expect(function () {
            shardmask_1.ShardMask.resource_to_shard('abc', 3);
        }).toThrow();
        //Test known addresses
        var addresses = ['abc', 'def', 'XYZ'];
        var shards = [2, 3, 1];
        //swap to https://stackoverflow.com/questions/45713938/jest-looping-through-dynamic-test-cases
        for (var i = 0; i < shards.length; i++) {
            expect(shardmask_1.ShardMask.resource_to_shard(addresses[i], 4)).toBe(shards[i]);
        }
        var addresses2 = ['abc', 'def', 'XYZ'];
        var shards2 = [10, 11, 13];
        for (var i = 0; i < shards2.length; i++) {
            expect(shardmask_1.ShardMask.resource_to_shard(addresses2[i], 16)).toBe(shards2[i]);
        }
    });
    test('test resources to shard mask', function () {
        var num_lanes = 4;
        var bv = shardmask_1.ShardMask.resources_to_shard_mask(['abc', 'def', 'XYZ'], num_lanes);
        expect(bv._size).toBe(num_lanes);
        expect(bv.as_binary()).toBe('00001110');
    });
});
//# sourceMappingURL=test_shard_mask.js.map