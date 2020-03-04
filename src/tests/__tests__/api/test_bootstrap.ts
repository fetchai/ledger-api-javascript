import {Bootstrap} from '../../../fetchai/ledger/api/bootstrap'


describe(':ContractsApi', () => {

    afterEach(() => {
        // axios.mockClear()
    })

    test('test get ledger address', async () => {
        const address = await Bootstrap.get_ledger_address('alpha')
        expect(address).toBe('https://foo.bar:500')
    })

    test('list servers', async () => {
        const actual1 = await Bootstrap.list_servers(true)
        expect(actual1).toMatchObject(JSON.parse('[{"name":"alpha","versions":"*"}]'))

        const actual2 = await Bootstrap.list_servers(false)
        expect(actual2).toMatchObject(JSON.parse('[{"name":"alpha","versions":"*"}]'))
    })


    test('test server from name', async () => {
        const actual = await Bootstrap.server_from_name('alpha')
        expect(actual).toMatchObject(['https://foo.bar', 500])
    })

    test('test split address', () => {
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
