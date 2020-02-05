import {Entity} from '../fetchai/ledger/crypto/entity'
import {LedgerApi} from '../fetchai/ledger/api/init'

const HOST = '127.0.0.1'
const PORT = 8000

function sync_error(errors) {
    errors.forEach(tx =>
        console.log(`\nThe following transaction: "${tx.get_digest_hex()}" did not succeed. \nIt exited with status : "${tx.get_status()}" and exit code: "${tx.get_exit_code()}"`)
    )
    throw new Error()
}

async function main() {
    // create the APIs
    const api = new LedgerApi(HOST, PORT)
    // create entities from private keys stored in hexadecimal.
    const identity1 = Entity.from_hex('6e8339a0c6d51fc58b4365bf2ce18ff2698d2b8c40bb13fcef7e1ba05df18e4b')
    const identity2 = Entity.from_hex('e833c747ee0aeae29e6823e7c825d3001638bc30ffe50363f8adf2693c3286f8')

    let balance1 = await api.tokens.balance(identity1)
    console.log(`\nBalance 1 : ${balance1.toString()}\n`)

    let balance2 = await api.tokens.balance(identity2)
    console.log(`Balance 2 :  ${balance2.toString()}\n`)

    console.log('Submitting transfer ...\n')
    // numeric inputs across this SDK may be of type number, BigInteger or instances of BN objects using the library BN.js
    const amount = BigInt(200)
    const tx2 = await api.tokens.transfer(identity1, identity2, amount, 20).catch((error) => {
        console.log('error occured: ' + error)
        throw new Error()
    })

    await api.sync([tx2]).catch(errors => sync_error(errors))
    console.log('Transfer successful\n')

    balance1 = await api.tokens.balance(identity1)
    console.log(`Balance 1: ${balance1.toString()}\n`)

    balance2 = await api.tokens.balance(identity2)
    console.log(`Balance 2: ${balance2.toString()}\n`)
}

main()


