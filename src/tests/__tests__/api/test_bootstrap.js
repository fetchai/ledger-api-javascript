import {
    IncompatibleLedgerVersionError,
    NetworkUnavailableError,
    RunTimeError,
    ValidationError
} from "../../../fetchai/ledger/errors";
import {LedgerApi} from "../../../fetchai/ledger/api";
import {Bootstrap} from "../../../fetchai/ledger/api/bootstrap";
import axios from "axios";


describe(':ContractsApi', () => {

    afterEach(() => {
        axios.mockClear()
    })

    test('test get ledger address', async () => {

        const network = 'def';
        expect(Bootstrap.get_ledger_address(network)).resolves.toThrow(ValidationError)

        const network2 = 'def2';
        expect(Bootstrap.get_ledger_address(network2)).resolves.toThrow(RunTimeError)

        const network3 = 'alpha'
        const address = await Bootstrap.get_ledger_address(network3)
        expect(address).toBe('https://foo.bar:500')
    })

    test('test is server valid', () => {

        // network name requested must be in list
        expect(() => {
            Bootstrap.is_server_valid([{name: "alpha"}], 'beta')
        }).toThrow(NetworkUnavailableError)

        // prerelease should throw
        expect(() => {
            Bootstrap.is_server_valid([{name: "beta", versions: '0.9.0', 'prerelease': true}], 'beta')
        }).toThrow(IncompatibleLedgerVersionError)

        // build should throw
        expect(() => {
            Bootstrap.is_server_valid([{name: "beta", versions: '0.9.0', 'build': true}], 'beta')
        }).toThrow(IncompatibleLedgerVersionError)

        // patch should throw
        expect(() => {
            Bootstrap.is_server_valid([{name: "beta", versions: '0.9.0', 'patch': true}], 'beta')
        }).toThrow(IncompatibleLedgerVersionError)

        // disallowed version
        expect(() => {
            Bootstrap.is_server_valid([{name: "beta", versions: '<0.13.0, >=0.11.0'}], 'beta')
        }).toThrow(IncompatibleLedgerVersionError)

        // correct versions
        const version_allowed = Bootstrap.is_server_valid([{name: "beta", versions: '<0.10.0, >=0.8.0'}], 'beta')
        expect(version_allowed).toBe(true)

        // allows all versions
        const valid = Bootstrap.is_server_valid([{name: "beta", versions: '*'}], 'beta')
        expect(valid).toBe(true)

    })

    // test.each([['prerelease', 'build', 'patch']])(




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


    test('add name', () => {

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
