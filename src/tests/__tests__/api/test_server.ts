import {DEFAULT_PORT, LOCAL_HOST} from '../../utils/helpers'
import axios from 'axios'
import {LedgerApi} from "../../../fetchai/ledger/api";

describe(':ServerApi', () => {

    afterEach(() => {
        // axios.mockClear()
    })

    test('test num lanes', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const num_lanes = await api.server.num_lanes()
        expect(axios).toHaveBeenCalledTimes(1)
        await expect(num_lanes).toBe(4)
    })

    test('test version', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const version = await api.server.version()
        expect(axios).toHaveBeenCalledTimes(2)
        expect(version).toBe('0.9.0')
    })

})
