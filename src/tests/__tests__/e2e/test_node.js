import {LedgerApi} from "../../../fetchai/ledger/api";
import {Entity} from "../../../fetchai/ledger/crypto/entity";
import {DEFAULT_PORT, LOCAL_HOST} from "../../utils/helpers";
import axios from 'axios'

const SUCCESS_STATUS_CODE = 0;

describe.skip('Test Node', () => {
    beforeAll(() => {
        jest.setTimeout(120000);
         jest.clearAllMocks();

    })

    test('test Transfer', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const identity1 = new Entity()
        const identity2 = new Entity()
        await expect(api.tokens.wealth(identity1, 1000))
        .resolves
        .toBeNull();
        const txs = await api.tokens.wealth(identity1, 1000)
        await api.sync([txs])
        const tx2 = await api.tokens.transfer(identity1, identity2, 250, 20)
        await api.sync([tx2])

        const balance1 = await api.tokens.balance(identity1)
        console.log('BalancDDDDDe 1:' + balance1)
        expect(balance1).toBe(749)
        const balance2 = await api.tokens.balance(identity2)
        expect(balance2).toBe(250)
        debugger;
        console.log('BalanQQQQce 2:' + balance2)
    })
})
