import assert from 'assert'
import reverse from 'buffer-reverse'

/**
 * This class for bitVector related operations
 *
 * @public
 * @class
 */
export class BitVector {
//TODO add rest of the methods from the python
    constructor(size = null) {
        if (size instanceof BitVector) {
            this._size = size._size
            this._byte_size = size._byte_size
            this._buffer = Buffer.from(size._buffer)
        } else {
            this._size = Number(size)
            this._byte_size = Math.floor((this._size + 7) / 8)
            this._buffer = Buffer.alloc(this._byte_size)
        }
    }

    __len__() {
        return this._size
    }

    __bytes__() {
        return reverse(this._buffer)
    }


    // Get bytes of this instance
    instance_bytes() {
        if (this._buffer) {
            // TODO: Improve logic
            return Buffer.from(
                this._buffer
                    .toString('hex')
                    .match(/.{2}/g)
                    .reverse()
                    .join(''),
                'hex'
            )
        }
        return ''
    }


    static from_indices(indices, size) {
        let bits = new BitVector(size)

        for (let i = 0; i < indices.length; i++) {
             assert(0 <= indices[i])
             assert(indices[i] < size)
             bits.set(indices[i], 1)
        }
        return bits
    }


    static from_bytes(data, bit_size) {
        // data in bytes
        // ensure the bit size matches the expectation
        let min_size = Math.max((data.length - 1) * 8, 1)
        let max_size = data.length * 8
        assert(min_size <= bit_size <= max_size)

        let bits = new BitVector()
        bits._size = bit_size
        bits._byte_size = Math.floor((bit_size + 7) / 8)
        // TODO: Improve logic
        bits._buffer = Buffer.from(
            data
                .toString('hex')
                .match(/.{2}/g)
                .reverse()
                .join(''),
            'hex'
        )
        return bits
    }

    static from_hex_string(hex_data) {
        let decoded_bytes = Buffer.from(hex_data, 'hex')
        return BitVector.from_bytes(decoded_bytes, decoded_bytes.length * 8)
    }

    byte_length() {
        return this._byte_size
    }

    get(bit) {
        let byte_index = Math.floor(bit / 8)
        let bit_index = bit & 0x7
        return (this._buffer[byte_index] >> bit_index) & 0x1
    }

    set(bit, value) {
        assert(0 <= Number(value) <= 1)
        let byte_index = Math.floor(bit / 8)
        let bit_index = bit & 0x7
        this._buffer[byte_index] |= (value & 0x1) << bit_index
    }

    as_binary() {
        let output = ''
        let data = this.instance_bytes()
        for (let n of data) {
            // TODO: Improve logic
            output += Array.from(Array(8).keys())
                .reverse()
                .map(value => String(1 & (Number(n) >> value)))
                .join('')
        }
        return output
    }

    as_hex() {
        let data = this.instance_bytes()
        return Buffer.from(data).toString('hex')
    }
}
