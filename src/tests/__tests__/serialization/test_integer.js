import * as integer from '../../../fetchai/ledger/serialization/integer'

describe(':Integer', () => {

    // encode tests
	test('test small unsigned encode',   () => {
		const buffer = Buffer.from('');
	    const encoded =   integer.encode(buffer, 4);
	    expect(encoded.toString('hex')).toBe('04');
	});

    test('test small signed encode',   () => {
		const buffer = Buffer.from('');
	    const encoded =   integer.encode(buffer, -4);
	    expect(encoded.toString('hex')).toBe('e4');
	});

     test('test 1byte unsigned encode',   () => {
		const buffer = Buffer.from('');
	    const encoded =   integer.encode(buffer, 0x80);
	    expect(encoded.toString('hex')).toBe('c080');
	});

      test('test 2byte unsigned encode',   () => {
		const buffer = Buffer.from('');
	    const encoded =   integer.encode(buffer, 0xEDEF);
	    expect(encoded.toString('hex')).toBe('c1edef');
	});

       test('test 4byte unsigned encode',   () => {
		const buffer = Buffer.from('');
	    const encoded =   integer.encode(buffer, 0xEDEFABCD);
	    expect(encoded.toString('hex')).toBe('c2edefabcd');
	});

    /*
     TODO:: implement 8byte support for encode
     test('test 8byte unsigned encode',   () => {
		const buffer = Buffer.from('');
	    const encoded =   integer.encode(buffer, 0xEDEFABCD01234567);
	    expect(encoded.toString('hex')).toBe('c3edefabcd01234567');
	});
	*/

      test('test 1byte signed encode',   () => {
		const buffer = Buffer.from('');
	    const encoded =   integer.encode(buffer, -0x80);
	    expect(encoded.toString('hex')).toBe('d080');
	});

      test('test 2byte signed encode',   () => {
		const buffer = Buffer.from('');
	    const encoded =   integer.encode(buffer, -0xEDEF);
	    expect(encoded.toString('hex')).toBe('d1edef');
	});

    test('test 4byte signed encode',   () => {
		const buffer = Buffer.from('');
	    const encoded =   integer.encode(buffer, -0xEDEFABCD);
	    expect(encoded.toString('hex')).toBe('d2edefabcd');
	});

      /*
      TODO:: implement 8byte support for encode
       test('test 8byte signed encode',   () => {
		const buffer = Buffer.from('');
	    const encoded =   integer.encode(buffer, -0xEDEFABCD01234567);
	    expect(encoded.toString('hex')).toBe('D3EDEFABCD01234567');
	});
	*/

    // start decode tests
    test('test small unsigned decode',   () => {
		const buffer = Buffer.from('04', 'hex');
		const container = { buffer: buffer}
	    const decoded = integer.decode(container);
	    expect(decoded).toBe(4);
	    expect(Buffer.byteLength(container.buffer)).toBe(0);
	});

      test('test small signed decode',   () => {
		const buffer = Buffer.from('E4', 'hex');
		const container = { buffer: buffer}
	    const decoded = integer.decode(container);
	    expect(decoded).toBe(-4);
	    expect(Buffer.byteLength(container.buffer)).toBe(0);
	});

       test('test 1byte unsigned decode',   () => {
		const buffer = Buffer.from('C080', 'hex');
		const container = { buffer: buffer}
	    const decoded = integer.decode(container);
	    expect(decoded).toBe(0x80);
	    expect(Buffer.byteLength(container.buffer)).toBe(0);
	});

       test('test 2byte unsigned decode',   () => {
		const buffer = Buffer.from('C1EDEF', 'hex');
		const container = { buffer: buffer}
	    const decoded = integer.decode(container);
	    expect(decoded).toBe(0xEDEF);
	    expect(Buffer.byteLength(container.buffer)).toBe(0);
	});

        test('test 4byte unsigned decode',   () => {
		const buffer = Buffer.from('C2EDEFABCD', 'hex');
		const container = { buffer: buffer}
	    const decoded = integer.decode(container);
	    expect(decoded).toBe(0xEDEFABCD);
	    expect(Buffer.byteLength(container.buffer)).toBe(0);
	});
/*
TODO:: implement 8byte support for decode
  test('test 8byte unsigned decode',   () => {
		const buffer = Buffer.from('C3EDEFABCD01234567', 'hex');
	    const decoded = integer.decode(buffer);
	    expect(decoded).toBe(0xEDEFABCD01234567);
	});
 */

  test('test 1byte signed decode',   () => {
		const buffer = Buffer.from('D080', 'hex');
		const container = { buffer: buffer}
	    const decoded = integer.decode(container);
	    expect(decoded).toBe(-0x80);
	    expect(Buffer.byteLength(container.buffer)).toBe(0);
	});

  test('test 2byte signed decode',   () => {
		const buffer = Buffer.from('D1EDEF', 'hex');
		const container = { buffer: buffer}
	    const decoded = integer.decode(container);
	    expect(decoded).toBe(-0xEDEF);
	    expect(Buffer.byteLength(container.buffer)).toBe(0);
	});

   test('test 4byte signed decode',   () => {
		const buffer = Buffer.from('D1EDEF', 'hex');
		const container = { buffer: buffer}
	    const decoded = integer.decode(container);
	    expect(decoded).toBe(-0xEDEF);
	    expect(Buffer.byteLength(container.buffer)).toBe(0);
	});

    /*
      TODO:: implement 8byte support for decode
      test('test 8byte signed decode',   () => {
		const buffer = Buffer.from('D3EDEFABCD01234567', 'hex');
	    const decoded = integer.decode(buffer);
	    expect(decoded).toBe(-0xEDEFABCD01234567);
	});
     */
})
