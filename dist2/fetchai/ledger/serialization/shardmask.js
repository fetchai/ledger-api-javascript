"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var crypto_1 = require("crypto");
var bitvector_1 = require("../bitvector");
var _compute_digest = function (source) {
    var hash_func = crypto_1.createHash('sha256');
    hash_func.update(source);
    return hash_func.digest();
};
function powerOfTwo(x) {
    return Math.log2(x) % 1 === 0;
}
var ShardMask = /** @class */ (function () {
    function ShardMask() {
    }
    ShardMask.state_to_address = function (state, contract) {
        assert_1.default(contract.owner());
        return contract.digest().toString('hex') + "." + contract.owner() + ".state." + state;
    };
    ShardMask.resources_to_shard_mask = function (resource_addresses, num_lanes) {
        var shards = [];
        for (var i = 0; i < resource_addresses.length; i++) {
            shards.push(ShardMask.resource_to_shard(resource_addresses[i], num_lanes));
        }
        return bitvector_1.BitVector.from_indices(shards, num_lanes);
    };
    ShardMask.resource_to_shard = function (resource_address, num_lanes) {
        assert_1.default(num_lanes > 0 && powerOfTwo(num_lanes));
        //Resource ID from address.
        var resource_id = _compute_digest(String(resource_address));
        // Take last 4 bytes
        var group = resource_id.readUIntLE(0, 4);
        // modulo number of lanes
        var shard = group & (num_lanes - 1);
        return shard;
    };
    return ShardMask;
}());
exports.ShardMask = ShardMask;
//# sourceMappingURL=shardmask.js.map