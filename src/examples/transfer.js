import {Entity} from '../fetchai/ledger/crypto/entity'
import {LedgerApi} from '../fetchai/ledger/api/init'

const HOST = '127.0.0.1'
const PORT = 8000

async function main() {
    // create the APIs
    const api = new LedgerApi(HOST, PORT)
    // generate a random identity
    const identity1 = Entity.from_hex('6e8339a0c6d51fc58b4365bf2ce18ff2698d2b8c40bb13fcef7e1ba05df18e4b')
    const identity2 = Entity.from_hex('e833c747ee0aeae29e6823e7c825d3001638bc30ffe50363f8adf2693c3286f8')

        let balance1 = await api.tokens.balance(identity1)
    console.log('Balance 1 (before):' + balance1)
    let balance2 = await api.tokens.balance(identity2)
    console.log('Balance 2 (before):' + balance2)
    const tx2 = await api.tokens.transfer(identity1, identity2, 250000, 20)
    await api.sync([tx2])

    balance1 = await api.tokens.balance(identity1)
    console.log('Balance 1:' + balance1)
    balance2 = await api.tokens.balance(identity2)
    console.log('Balance 2:' + balance2)
}

main()


