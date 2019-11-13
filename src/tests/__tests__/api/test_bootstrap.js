import {ValidationError} from "../../../fetchai/ledger/errors";
import {LedgerApi} from "../../../fetchai/ledger/api";
import {Bootstrap} from "../../../fetchai/ledger/api/bootstrap";


describe(':ContractsApi', () => {


    test_get_ledger_address
    test('test get ledger address', async () => {

    })

    /*
     * Tests that init accepts only a host+port pair, or a network
     */
    test('test host port or network', async () => {

        expect(() => {
            new LedgerApi('host')
        }).toThrow(ValidationError)

        expect(() => {
            const api = new LedgerApi(false, 'port')
        }).toThrow(ValidationError)

        expect(() => {
            const api = new LedgerApi('host', false, 'alpha')
        }).toThrow(ValidationError)

        expect(() => {
            const api = new LedgerApi(false, 1234, 'alpha')
        }).toThrow(ValidationError)

        expect(() => {
            const api = new LedgerApi(false, 1234, 'alpha')
        }).toThrow(ValidationError)


        expect(() => {
            const api = new LedgerApi('host', 1234, 'alpha')
        }).toThrow(ValidationError)
    })


    test.skip('test host port or network', () => {

        // Test correct splitting of address into protocol, host, port
        let protocol, host, port, port2

        [protocol, host, port] = Bootstrap.split_address('https://foo.bar:500')
        expect(port).toBe(500)
        expect(protocol).toBe('https');
        expect(host).toBe('foo.bar');


        // Test defaulting of protocol to http
        const arr = Bootstrap.split_address('foo.bar:600');
        expect(arr[0]).toBe('http');
        expect(arr[1]).toBe('foo.bar');
        const expected_port = 600;
        expect(arr[2]).toBe(expected_port)


            // Test default ports depending on protocol
            [protocol, host, port] = Bootstrap.split_address('https://foo.bar')
        expect(protocol).toBe('http')
        expect(host).toBe('foo.bar')
        expect(port).toEqual(443)

            [protocol, host, port] = Bootstrap.split_address('http://foo.bar')
        expect(protocol).toBe('http')
        expect(host).toBe('foo.bar')
        expect(port).toEqual(8000)
    })


})
