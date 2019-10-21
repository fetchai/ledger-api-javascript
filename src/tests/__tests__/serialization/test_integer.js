import * as integer from '../../../fetchai/ledger/serialization/integer'

describe(':Integer', () => {

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

    /*     test('test 8byte unsigned encode',   () => {
		const buffer = Buffer.from('');
	    const encoded =   integer.encode(buffer, 0xEDEFABCD01234567);
	    expect(encoded.toString('hex')).toBe('c3edefabcd01234567');
	}); */

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

      /* test('test 8byte signed encode',   () => {
          debugger;
		const buffer = Buffer.from('');
	    const encoded =   integer.encode(buffer, -0xEDEFABCD01234567);
	    expect(encoded.toString('hex')).toBe('D3EDEFABCD01234567');
	}); */

})
