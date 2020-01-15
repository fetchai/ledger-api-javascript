import {BitVector} from '../../fetchai/ledger/bitvector'

describe(':BitVector', () => {
    test('Test create BitVector instance with empty size', () => {
        const bits = new BitVector()
        expect(bits.byte_length()).toBe(0)
        expect(bits.get(0)).toBe(0)
    })

    test('Test create BitVector instance with size value', () => {
        const bits = new BitVector(8)
        expect(bits.byte_length()).toBe(1)
        expect(bits.get(0)).toBe(0)
    })

    test('Test set', () => {
        const bits = new BitVector(8)
        bits.set(3, 1)
        bits.set(6, 1)
        bits.set(7, 1)
        expect(bits._size).toBe(8)
        expect(bits.as_hex()).toBe('c8')
        expect(bits.byte_length()).toBe(1)
    })

    test('Test get', () => {
        const bits = new BitVector(8)
        bits.set(3, 1)
        bits.set(6, 1)
        bits.set(7, 1)

        expect(bits.get(0)).toBe(0)
        expect(bits.get(1)).toBe(0)
        expect(bits.get(2)).toBe(0)
        expect(bits.get(3)).toBe(1)
        expect(bits.get(4)).toBe(0)
        expect(bits.get(5)).toBe(0)
        expect(bits.get(6)).toBe(1)
        expect(bits.get(7)).toBe(1)
    })
})
