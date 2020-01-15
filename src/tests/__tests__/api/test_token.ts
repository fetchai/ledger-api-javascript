import {DEFAULT_PORT, ENTITIES, LOCAL_HOST} from '../../utils/helpers'
import {LedgerApi, TokenApi} from '../../../fetchai/ledger/api'
import {Deed} from '../../../fetchai/ledger/crypto/deed'
import {BN} from 'bn.js'


describe(':TokenApi', () => {

    test('test stake', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const tx = await api.tokens.add_stake(ENTITIES[0], new BN(1000), new BN(50))
        expect(tx).toBe('68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516')
    })

    test('test stake cooldown', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const stake = await api.tokens.stake_cooldown(ENTITIES[0])
        expect(stake.cooldownStake).toBe(500)
    })

    test('test deed', async () => {
        const deed = new Deed()
        deed.set_signee(ENTITIES[2], 2)
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const tx = await api.tokens.deed(ENTITIES[0], deed, null, true)
        expect(tx).toBe('68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516')
    })

    test('test collect stake', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const tx = await api.tokens.collect_stake(ENTITIES[0], 300)
        expect(tx).toBe('68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516')
    })

    test('test de stake', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const tx = await api.tokens.de_stake(ENTITIES[0], 300, 25)
        expect(tx).toBe('68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516')
    })

    test('test TokenTxFactory transfer', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const tx = await api.tokens.transfer(ENTITIES[0], ENTITIES[1], 200, 2)
        expect(tx).toBe('be448a628ed7d333eaf497b7bf56722f1df661c67856b9cedf6d75180859964c')
    })
})

