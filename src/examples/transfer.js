import {Entity} from '../fetchai/ledger/crypto/entity'
import {LedgerApi} from '../fetchai/ledger/api/__init__'

const HOST = '127.0.0.1'
const PORT = 8000

async function main() {
    // create the APIs
    const api = new LedgerApi(HOST, PORT)
    // generate a random identity
    const identity1 = new Entity()
    const identity2 = new Entity()
    const t = await api.tokens.wealth(identity1, 1000)
    await api.sync([t])

    const tx2 = await api.tokens.transfer(identity1, identity2, 250, 20)
    await api.sync([tx2])

    const balance1 = await api.tokens.balance(identity1)
    console.log('Balance 1:' + balance1)
    const balance2 = await api.tokens.balance(identity2)
    console.log('Balance 2:' + balance2)
}

main()


