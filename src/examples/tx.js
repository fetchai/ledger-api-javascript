import {TokenApi, TransactionApi} from '../fetchai/ledger/api'
import {Entity} from '../fetchai/ledger/crypto/entity'
import {logger} from '../fetchai/ledger/utils'

async function main() {
    const host = '127.0.0.1'
    const port = 8000
    const api = new TokenApi(host, port)
    const identity1 = Entity.from_hex('6e8339a0c6d51fc58b4365bf2ce18ff2698d2b8c40bb13fcef7e1ba05df18e4b')
    const identity2 = Entity.from_hex('e833c747ee0aeae29e6823e7c825d3001638bc30ffe50363f8adf2693c3286f8')
    const tx = await api.transfer(identity1, identity2, 2500, 20)

    const TApi = new TransactionApi(host, port)
    // TODO write good comment here
    const contents = await TApi.contents(tx.txs[0])
    console.log('contents is :', contents)
    // whilst we can use the sync method which polls for the result of a TODO finish comment.
    const status = await TApi.status(tx.txs[0])
    console.log('status is :', status)
}

main()
