import {DEFAULT_PORT, ENTITIES, LOCAL_HOST} from '../../utils/helpers'
import {TokenApi} from '../../../fetchai/ledger/api'
import {Deed} from '../../../fetchai/ledger/crypto/deed'
import {BN} from 'bn.js'


describe(':TokenApi', () => {

    test('test stake', async () => {
        const api = new TokenApi(LOCAL_HOST, DEFAULT_PORT)
        const stake = await api.add_stake(ENTITIES[0], new BN(1000), new BN(50))
        expect(stake.stake).toBe(500)
    })

    test('test stake cooldown', async () => {

        const api = new TokenApi(LOCAL_HOST, DEFAULT_PORT)
        const stake = await api.stake_cooldown(ENTITIES[0], new BN(1000), new BN(50))
        expect(stake.cooldownStake).toBe(500)
    })

    test('test deed', async () => {

        const deed = new Deed()
        deed.set_signee(ENTITIES[2], 2)
        const api = new TokenApi(LOCAL_HOST, DEFAULT_PORT)
        const tx = await api.deed(ENTITIES[0], deed, null, true)
        expect(tx).toHaveProperty('txs')
    })

    test('test collect stake', async () => {
        const api = new TokenApi(LOCAL_HOST, DEFAULT_PORT)
        const stake = await api.collect_stake(ENTITIES[0], 300)
        expect(stake.stake).toBe(500)
    })

    test('test de stake', async () => {
        const api = new TokenApi(LOCAL_HOST, DEFAULT_PORT)
        const stake = await api.de_stake(ENTITIES[0], 300, 25)
        expect(stake.stake).toBe(500)
    })

    test('test TokenTxFactory transfer', async () => {
        const api = new TokenApi(LOCAL_HOST, DEFAULT_PORT)
        const tx = await api.transfer(ENTITIES[0], ENTITIES[1], 200, 2)
        expect(tx).toHaveProperty('txs')
    })

})

