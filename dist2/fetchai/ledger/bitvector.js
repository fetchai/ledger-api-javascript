"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var buffer_reverse_1 = __importDefault(require("buffer-reverse"));
/**
 * This class for bitVector related operations
 *
 * @public
 * @class
 */
var BitVector = /** @class */ (function () {
    //TODO add rest of the methods from the python
    function BitVector(size) {
        if (size === void 0) { size = null; }
        if (size instanceof BitVector) {
            this._size = size._size;
            this._byte_size = size._byte_size;
            this._buffer = Buffer.from(size._buffer);
        }
        else {
            this._size = Number(size);
            this._byte_size = Math.floor((this._size + 7) / 8);
            this._buffer = Buffer.alloc(this._byte_size);
        }
    }
    BitVector.prototype.__len__ = function () {
        return this._size;
    };
    BitVector.prototype.__bytes__ = function () {
        return buffer_reverse_1.default(this._buffer);
    };
    // Get bytes of this instance
    BitVector.prototype.instance_bytes = function () {
        return Buffer.from(this._buffer
            .toString('hex')
            .match(/.{2}/g)
            .reverse()
            .join(''), 'hex');
    };
    BitVector.from_indices = function (indices, size) {
        var bits = new BitVector(size);
        for (var i = 0; i < indices.length; i++) {
            assert_1.default(0 <= indices[i]);
            assert_1.default(indices[i] < size);
            bits.set(indices[i], 1);
        }
        return bits;
    };
    BitVector.from_bytes = function (data, bit_size) {
        // data in bytes
        // ensure the bit size matches the expectation
        var min_size = Math.max((data.length - 1) * 8, 1);
        var max_size = data.length * 8;
        assert_1.default(min_size <= bit_size);
        assert_1.default(bit_size <= max_size);
        //todo refactor, it is dodgy
        var bits = new BitVector();
        bits._size = bit_size;
        bits._byte_size = Math.floor((bit_size + 7) / 8);
        // TODO: Improve logic
        bits._buffer = Buffer.from(data
            .toString('hex')
            .match(/.{2}/g)
            .reverse()
            .join(''), 'hex');
        return bits;
    };
    BitVector.from_hex_string = function (hex_data) {
        var decoded_bytes = Buffer.from(hex_data, 'hex');
        return BitVector.from_bytes(decoded_bytes, decoded_bytes.length * 8);
    };
    BitVector.prototype.byte_length = function () {
        return this._byte_size;
    };
    BitVector.prototype.get = function (bit) {
        var byte_index = Math.floor(bit / 8);
        var bit_index = bit & 0x7;
        return (this._buffer[byte_index] >> bit_index) & 0x1;
    };
    BitVector.prototype.set = function (bit, value) {
        assert_1.default(0 <= Number(value));
        assert_1.default(Number(value) <= 1);
        var byte_index = Math.floor(bit / 8);
        var bit_index = bit & 0x7;
        this._buffer[byte_index] |= (value & 0x1) << bit_index;
    };
    BitVector.prototype.as_binary = function () {
        var e_1, _a;
        var output = '';
        var data = this.instance_bytes();
        var _loop_1 = function (n) {
            // TODO: Improve logic
            output += Array.from(Array(8).keys())
                .reverse()
                .map(function (value) { return String(1 & (Number(n) >> value)); })
                .join('');
        };
        try {
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var n = data_1_1.value;
                _loop_1(n);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return output;
    };
    BitVector.prototype.as_hex = function () {
        var data = this.instance_bytes();
        return Buffer.from(data).toString('hex');
    };
    return BitVector;
}());
exports.BitVector = BitVector;
//# sourceMappingURL=bitvector.js.map