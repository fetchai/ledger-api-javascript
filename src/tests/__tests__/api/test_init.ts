import {IncompatibleLedgerVersionError} from '../../../fetchai/ledger/errors'
import {LedgerApi} from '../../../fetchai/ledger/api'
import {DEFAULT_PORT, LOCAL_HOST} from '../../utils/helpers'


describe(':LedgerApi', () => {
    afterEach(() => {
        // axios.mockClear()
    })

    test('test server version', async () => {
        expect(async () => {
            await LedgerApi.from_network_name(LOCAL_HOST, DEFAULT_PORT)
        }).not.toThrow(IncompatibleLedgerVersionError)
    })

    test('test balance', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const promise = await api.tokens.balance('2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5')
        await expect(promise.toNumber()).toEqual(275)
    })

    test('test transfer', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const balance = await api.tokens.balance('2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5')
        await expect(balance.toNumber()).toEqual(275)
        const promise_sync = await api.sync('bbc6e88d647ab41923216cdaaba8cdd01f42e953c6583e59179d9b32f52f5777')
        await expect(promise_sync).toBe(true)
        const balance2 = await api.tokens.balance('2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5')
        await expect(balance2.toNumber()).toEqual(500)
    })

})
