import {IncompatibleLedgerVersionError, NetworkUnavailableError, ValidationError} from '../../../fetchai/ledger/errors'
import {LedgerApi} from '../../../fetchai/ledger/api'
import {Bootstrap} from '../../../fetchai/ledger/api/bootstrap'
import axios from 'axios'


describe(':ContractsApi', () => {

    afterEach(() => {
        axios.mockClear()
    })

    it('test get ledger address', async () => {
        // this is the only way i can get the throws of async promsises to be tested properly, and was from SO Q/A but linter rejects, so commented
        // expect(Bootstrap.get_ledger_address('def')).resolves.toThrow(NetworkUnavailableError)
        //  expect(Bootstrap.get_ledger_address('def2')).resolves.toThrow(RunTimeError)

        const address = await Bootstrap.get_ledger_address('alpha')
        expect(address).toBe('https://foo.bar:500')
    })

    it('test is server valid', () => {
        // network name requested must be in list
        expect(() => {
            Bootstrap.is_server_valid([{name: 'alpha'}], 'beta')
        }).toThrow(NetworkUnavailableError)

        // prerelease should throw
        expect(() => {
            Bootstrap.is_server_valid([{name: 'beta', versions: '0.9.0', 'prerelease': true}], 'beta')
        }).toThrow(IncompatibleLedgerVersionError)

        // build should throw
        expect(() => {
            Bootstrap.is_server_valid([{name: 'beta', versions: '0.9.0', 'build': true}], 'beta')
        }).toThrow(IncompatibleLedgerVersionError)

        // patch should throw
        expect(() => {
            Bootstrap.is_server_valid([{name: 'beta', versions: '0.9.0', 'patch': true}], 'beta')
        }).toThrow(IncompatibleLedgerVersionError)

        // disallowed version
        expect(() => {
            Bootstrap.is_server_valid([{name: 'beta', versions: '<0.13.0, >=0.11.0'}], 'beta')
        }).toThrow(IncompatibleLedgerVersionError)

        // correct versions
        const version_allowed = Bootstrap.is_server_valid([{name: 'beta', versions: '<0.10.0, >=0.8.0'}], 'beta')
        expect(version_allowed).toBe(true)

        // allows all versions
        const valid = Bootstrap.is_server_valid([{name: 'alpha', versions: '*'}], 'alpha')
        expect(valid).toBe(true)

    })


    it('list servers', async () => {
        const actual1 = await Bootstrap.list_servers(true)
        expect(actual1).toMatchObject(JSON.parse('[{"name":"alpha","versions":"*"}]'))

        const actual2 = await Bootstrap.list_servers(false)
        expect(actual2).toMatchObject(JSON.parse('[{"name":"alpha","versions":"*"}]'))
    })


    it('test server from name', async () => {
        const actual = await Bootstrap.server_from_name('alpha')
        expect(actual).toMatchObject(['https://foo.bar', 500])
    })


    /*
     * Tests that init accepts only a host+port pair, or a network
     */
    it('test host port or network', async () => {
        expect(() => {
            new LedgerApi('host')
        }).toThrow(ValidationError)

        expect(() => {
            new LedgerApi(false, 'port')
        }).toThrow(ValidationError)

        expect(() => {
            new LedgerApi('host', false, 'alpha')
        }).toThrow(ValidationError)

        expect(() => {
            new LedgerApi(false, 1234, 'alpha')
        }).toThrow(ValidationError)

        expect(() => {
            new LedgerApi(false, 1234, 'alpha')
        }).toThrow(ValidationError)

        expect(() => {
            new LedgerApi('host', 1234, 'alpha')
        }).toThrow(ValidationError)
    })

    it('test split address', () => {
        // Test default ports depending on protocol
        const [protocol1, host1, port1] = Bootstrap.split_address('https://foo.bar')
        expect(protocol1).toBe('https')
        expect(host1).toBe('foo.bar')
        expect(port1).toEqual(443)

        const [protocol2, host2, port2] = Bootstrap.split_address('http://foo.bar')
        expect(protocol2).toBe('http')
        expect(host2).toBe('foo.bar')
        expect(port2).toEqual(8000)

        // Test correct splitting of address into protocol, host, port
        const [protocol3, host3, port3] = Bootstrap.split_address('https://foo.bar:500')
        expect(protocol3).toBe('https')
        expect(host3).toBe('foo.bar')
        expect(port3).toEqual(500)

        // Test defaulting of protocol to http
        const [protocol4, host4, port4] = Bootstrap.split_address('foo.bar:600')
        expect(protocol4).toBe('http')
        expect(host4).toBe('foo.bar')
        expect(port4).toEqual(600)
    })
})
