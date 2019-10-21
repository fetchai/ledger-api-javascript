import * as bytearray from "../../../fetchai/ledger/serialization/bytearray";
import * as integer from "../../../fetchai/ledger/serialization/integer";

describe(':Bytearray', () => {

	test('test encode', () => {
	   // const data = new Buffer(1234);

	    var integer = 1000;
var length = Math.ceil((Math.log(integer)/Math.log(2))/8);
var buffer = new Buffer(length);
var arr = [];

while (integer > 0) {
    var temp = integer % 2;
    arr.push(temp);
    integer = Math.floor(integer/2);
}

	    const buf = new Buffer('');
	    const encoded =  bytearray.encode(buf, data);
	    expect(encoded.toString('hex')).toBe('4D2');

		// const buffer = Buffer.from('')
		// const encoded = bytearray.encode(buffer, bytes);
		// expect(Buffer.byteLength(ref)).toBe(Buffer.byteLength(encoded))
		// expect(ref.toString('hex')).toBe(encoded.toString('hex'))

		// expect(Buffer.byteLength(expected)).toBe(Buffer.byteLength(encoded))
		//expect(expected.toString('hex')).toBe(encoded.toString('hex'))

		/**
         *     def test_encode(self):
        data = bytes(list(range(10)))

        # encode the address
        buffer = io.BytesIO()
        encode(buffer, data)

        self.assertIsEncoded(buffer, '0A00010203040506070809')
         */
	})

})
