"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bitvector_1 = require("../../fetchai/ledger/bitvector");
describe(':BitVector', function () {
    test('Test create BitVector instance with empty size', function () {
        var bits = new bitvector_1.BitVector();
        expect(bits.byte_length()).toBe(0);
        expect(bits.get()).toBe(0);
    });
    test('Test create BitVector instance with size value', function () {
        var bits = new bitvector_1.BitVector(8);
        expect(bits.byte_length()).toBe(1);
        expect(bits.get()).toBe(0);
    });
    test('Test set', function () {
        var bits = new bitvector_1.BitVector(8);
        bits.set(3, 1);
        bits.set(6, 1);
        bits.set(7, 1);
        expect(bits._size).toBe(8);
        expect(bits.as_hex()).toBe('c8');
        expect(bits.byte_length()).toBe(1);
    });
    test('Test get', function () {
        var bits = new bitvector_1.BitVector(8);
        bits.set(3, 1);
        bits.set(6, 1);
        bits.set(7, 1);
        expect(bits.get(0)).toBe(0);
        expect(bits.get(1)).toBe(0);
        expect(bits.get(2)).toBe(0);
        expect(bits.get(3)).toBe(1);
        expect(bits.get(4)).toBe(0);
        expect(bits.get(5)).toBe(0);
        expect(bits.get(6)).toBe(1);
        expect(bits.get(7)).toBe(1);
    });
});
//# sourceMappingURL=test_bitvector.js.map