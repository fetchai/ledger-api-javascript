import {Entity} from '../fetchai/ledger/crypto/entity'
import {LedgerApi} from '../fetchai/ledger/api/__init__'

const HOST = '127.0.0.1'
const PORT = 8000

async function main() {
    // create the APIs
    const api = new LedgerApi(HOST, PORT)
    // generate a random identity
    const identity1 = new Entity()
    const b = await api.tokens.balance(identity1)
    // create the balance
    console.log('initial balance', b)
    console.log('transfering a thousand')
    const t = await api.tokens.wealth(identity1, 1000)
    await api.sync([t])
    const balance_after = await api.tokens.balance(identity1)
    console.log('balance after', balance_after)
}

main()

