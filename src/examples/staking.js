import {Entity} from "../fetchai/ledger/crypto/entity";
import {Address} from "../fetchai/ledger/crypto/address";
import {LedgerApi} from "../fetchai/ledger/api";
import {BN} from 'bn.js'

const HOST = '127.0.0.1'
const PORT = 8000


async function main() {
    let txs, balance, stake, to_destake, cool_down;

    const private_key_hex = 'e833c747ee0aeae29e6823e7c825d3001638bc30ffe50363f8adf2693c3286f8';
    const entity = Entity.from_hex(private_key_hex)
    const address = new Address(entity)
    console.log('Address:', address)

    // create the APIs
    const api = new LedgerApi(HOST, PORT)

    balance = await api.tokens.balance(entity)
    console.log('Balance:', balance)
    txs = await api.tokens.stake(entity)
    console.log('Stake..:', txs)

    // submit and wait for the transfer to be complete
    console.log('Submitting stake request...')
    stake = await api.tokens.add_stake(entity, new BN(1000), new BN(50))
    await api.sync([stake])

    setInterval(async () => {
        balance = await api.tokens.balance(entity)
        console.log('Balance............:', balance)

        stake = await api.tokens.stake(entity)

        console.log('Stake..............:', stake)
        cool_down = await api.tokens.stake_cooldown(entity)
        console.log('Stake on cooldown..:', cool_down)

        // De-stake half of the staked balance
        stake = await api.tokens.stake(entity)
        to_destake = parseInt(stake / 2)
        txs = await api.tokens.de_stake(entity, to_destake, new BN(500))
        await api.sync([txs])
        txs = await api.tokens.collect_stake(entity, new BN(500))
        // Collect cooled down stakes
        await api.sync([txs])
    }, 3000)

}

main()
