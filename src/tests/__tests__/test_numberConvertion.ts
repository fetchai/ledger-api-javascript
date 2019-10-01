import {convert_number} from "../../fetchai/ledger/utils";
import {BN} from 'bn.js'
import {ValidationError} from "../../fetchai/ledger/errors";

describe(':numberConvertion', () => {

    test('test convert_number from BigInt', () => {
        const amount = BigInt(200);
        const actual = convert_number(amount);
        expect(actual.toNumber()).toBe(200)
    })

      test('test convert_number from number', () => {
       const amount = 200
        const actual = convert_number(amount);
        expect(actual.toNumber()).toBe(200)
    })

    test('test convert_number from BN', () => {
        const amount = new BN(200)
        const actual = convert_number(amount);
        expect(actual.toNumber()).toBe(200)
    })

    test('test unsafe integer', () => {
         // Test that integer outside range MaxSafeInteger throws
         const amount = Number.MAX_SAFE_INTEGER + 1
           expect(() => {
            convert_number(amount);
        }).toThrow(ValidationError)
    })

     test('test decimal', () => {
         // Decimals are not accepted by Ledger
         const amount = 90071.999
           expect(() => {
            convert_number(amount);
        }).toThrow(ValidationError)
    })


})
