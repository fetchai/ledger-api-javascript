import {DEFAULT_PORT, LOCAL_HOST} from "../../utils/helpers";
import {ContractsApi} from "../../../fetchai/ledger/api/contracts";
import {Address} from "../../../fetchai/ledger/crypto";

describe(':ContractsApi', () => {


    test('test create', async () => {
        //  const s = "oSBAEbaa00fFfiXx4QF7UPYL/oUY8HD2iC7efsTd41Hyy/nBSmsBwKCAY9COqqE7/Hg4jz5FoEdReTgozVDefjZltP4rJVVhr2V9OyQQDfB9QI7OSMhUXJKuOjegcxAWD/xFSw6klwROggh0cmFuc2ZlckmTxyBNEbaa00fFfiXx4QF7UPYL/oUY8HD2iC7efsTd41Hyy/nHIE1rGnnWADHrnIHwjlFYbZewakvpx7bvONVblPeiQ1RdaszIBG60Ac88NuP52UhGrb2RhpF6EUQ/v8qcHmpUyN8UbVAgUA4RHik3Zf4BIF7KE068DdCRlcEjViRrOKyJoDtl1r9AtrTWptAhhr+d80ECFwQ9CPLcCwG2vXgFE76E2y4JcVk7SXEZ4iVEslCaG9jxDCh+E4haiKBlrdw944mn6m+cKQ=="
        const s = "oSBAJadBtU8agJGiQGoeyp/LEBh//G352eduSoa0H3dHTFfBAZYBwKCAceoHeswH1KAaVKJy5UkIvy5LH8oyiMt0S0xn5uXXAME3yzURgC6NrfuPNhmJ4P4NqAPqOCFwLoohOj+xi9fh9Ah0cmFuc2ZlckmTxyBNJadBtU8agJGiQGoeyp/LEBh//G352eduSoa0H3dHTFfHIE344Wy8znuav0rGclZABkeKkmgfG34Q1dvrfzZjs+ze5czIBBT0l3lE4PzTL/K9VSa241d9D20gHM20ijN83FQYQksEV9Rbufky8CrXf7dVB3DFnILSBdT7vWlbXfaqgkdH8iBAa1t5DCmo7DigpDF3nWXSslFJGdR2Mx8IjlrIjBubwQj8u4brTgeVqXORH32QKOhCbv9wZbbAKqWueK7CDxABlQ=="
        const v = Buffer.from(s, 'base64')
        console.log("v.toString('hex')")
        console.log(v.toString('hex'))
        debugger;
    })

    test.skip('test query', async () => {
        //TODO
    })

    test.skip('test action', async () => {
        //TODO
    })

    test('test _encode_json_payload', async () => {
        const api = new ContractsApi(LOCAL_HOST, DEFAULT_PORT)
        const args = []
        args.push(new Address('2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED'))
        args.push(new Address('2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL'))
        args.push(200)
        const encoded = api._encode_json_payload(args)
        const reference = '{"0":"2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED","1":"2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL","2":200}'
        expect(JSON.stringify(encoded)).toBe(reference)
    })

    test('test message pack encode', async () => {
        const api = new ContractsApi(LOCAL_HOST, DEFAULT_PORT)
        const args = []
        args.push(new Address('2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED'))
        args.push(new Address('2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL'))
        args.push(200)
        const actual = api._encode_msgpack_payload(args);
        // we compare as hex
        const actual_hex = Buffer.from(actual).toString('hex')
        const expected = Buffer.from('93c7204daa9b9ae48c1cc64c009e8055b38da18620edc70988b19f4c183ce82863f4122ac7204dc7ff5ef50909f23694849efb8f745483456ccf227885b6285a8c96dfe5e1524cccc8', 'hex')
        expect(actual_hex).toBe(expected.toString('hex'))
    })
})
