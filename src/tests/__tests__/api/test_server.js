import {DEFAULT_PORT, LOCAL_HOST} from "../../utils/helpers";
import axios from 'axios'
import {ServerApi} from "../../../fetchai/ledger/api/server";

describe(':ServerApi', () => {

    afterEach(() => {
        axios.mockClear()
    })

    test('test num lanes', async () => {
        const api = new ServerApi(LOCAL_HOST, DEFAULT_PORT);
        const num_lanes = await api.num_lanes();
        expect(axios).toHaveBeenCalledTimes(1)
        await expect(num_lanes).toBe(3)
    })

    test('test version', async () => {
        const api = new ServerApi(LOCAL_HOST, DEFAULT_PORT);
        const version = await api.version();
        expect(axios).toHaveBeenCalledTimes(1)
        expect(version).toBe('0.9.0')
    })

})
