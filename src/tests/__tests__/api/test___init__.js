import {LedgerApi, TokenApi} from '../../../fetchai/ledger/api'
import {Entity} from '../../../fetchai/ledger/crypto'
import axios from 'axios'
const HOST = '127.0.0.1'
const PORT = 8000

describe(':LedgerApi', () => {
    afterEach(() => {
        axios.mockClear()
    })

    test('test balance', async () => {
        const api = new TokenApi(HOST, PORT)
        const promise = api.balance('2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5')
        expect(axios).toHaveBeenCalledTimes(1)
        await expect(promise).resolves.toEqual(275)
    })

    test('test wealth', async () => {
        const api = new TokenApi(HOST, PORT)
        const entity = new Entity(new Buffer('2ff324b9d3367b160069ec67260959b4955ab519426603b5e59d5990128163f3', 'hex'))
        const promise = api.wealth(entity, 500)
        // await expect(promise).resolves.toEqual({"status": 200, "data": {"txs":["be448a628ed7d406eaf497b7bf56722f1df661c67856b9cedf6d75180859964c"],"counts":{"received":1,"submitted":1}}});
        // await expect(promise).resolves.toHaveProperty('txs', "[\"be448a628ed7d406eaf497b7bf56722f1df661c67856b9cedf6d75180859964c\"]");
        await expect(promise).resolves.toHaveProperty('txs')
        expect(axios).toHaveBeenCalledTimes(2)
    })

    test('test transfer', async () => {
        const api = new LedgerApi(HOST, PORT)
        const promise = api.tokens.balance('2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5')
        expect(axios).toHaveBeenCalledTimes(1)
        await expect(promise).resolves.toEqual(275)
        const entity = new Entity(new Buffer('2ff324b9d3367b160069ec67260959b4955ab519426603b5e59d5990128163f3', 'hex'))
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
