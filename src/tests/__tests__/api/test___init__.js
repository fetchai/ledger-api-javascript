import axios from 'axios'
import {Entity} from '../../../fetchai/ledger/crypto'
import {IncompatibleLedgerVersionError} from '../../../fetchai/ledger/errors'
import {LedgerApi, TokenApi} from '../../../fetchai/ledger/api'
import {DEFAULT_PORT, LOCAL_HOST} from '../../utils/helpers'


describe(':LedgerApi', () => {
    afterEach(() => {
        axios.mockClear()
    })

    it('test server version', async () => {
        expect(async () => {
            await LedgerApi.from_network_name(LOCAL_HOST, DEFAULT_PORT)
        }).not.toThrow(IncompatibleLedgerVersionError)
    })

    it('test balance', async () => {
        const api = new TokenApi(LOCAL_HOST, DEFAULT_PORT)
        const promise = api.balance('2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5')
        expect(axios).toHaveBeenCalledTimes(1)
        await expect(promise).resolves.toEqual(275)
    })

    it('test wealth', async () => {
        const api = new TokenApi(LOCAL_HOST, DEFAULT_PORT)
        const entity = new Entity(Buffer.from('2ff324b9d3367b160069ec67260959b4955ab519426603b5e59d5990128163f3', 'hex'))
        const promise = api.wealth(entity, 500)
        await expect(promise).resolves.toHaveProperty('txs')
        expect(axios).toHaveBeenCalledTimes(2)
    })

    it('test transfer', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const promise = api.tokens.balance('2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5')
        expect(axios).toHaveBeenCalledTimes(1)
        await expect(promise).resolves.toEqual(275)
        const entity = new Entity(Buffer.from('2ff324b9d3367b160069ec67260959b4955ab519426603b5e59d5990128163f3', 'hex'))
        const promise_wealth = api.tokens.wealth(entity, 500)
        expect(axios).toHaveBeenCalledTimes(2)
        await expect(promise_wealth).resolves.toHaveProperty('txs')
        expect(axios).toHaveBeenCalledTimes(3)
        const promise_sync = await api.sync(JSON.parse('[{"txs":["bbc6e88d647ab41923216cdaaba8cdd01f42e953c6583e59179d9b32f52f5777"],"counts":{"received":1,"submitted":1}}]'))
        await expect(promise_sync).toBe(true)
        expect(axios).toHaveBeenCalledTimes(4)
        const promise3 = api.tokens.balance('2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5')
        expect(axios).toHaveBeenCalledTimes(5)
        await expect(promise3).resolves.toEqual(500)
    })

})
