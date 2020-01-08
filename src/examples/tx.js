import {LedgerApi} from '../fetchai/ledger/api'
import {Entity} from '../fetchai/ledger/crypto/entity'

const HOST = '127.0.0.1'
const PORT = 8000

async function main() {
    // In our examples we use Addresses with funds, which we load from hex-encoded private keys.
    const api = new LedgerApi(HOST, PORT)
    const identity1 = Entity.from_hex('6e8339a0c6d51fc58b4365bf2ce18ff2698d2b8c40bb13fcef7e1ba05df18e4b')
    const identity2 = Entity.from_hex('e833c747ee0aeae29e6823e7c825d3001638bc30ffe50363f8adf2693c3286f8')

    const tx = await api.tokens.transfer(identity1, identity2, 2500, 20)

    // We Verify that the transaction is the submitted transaction is the sent transaction
    // TxContents object (below contents variable) contains all properties sent to ledger in transaction API call
    const contents = await api.tx.contents(tx)

    //below we access a subset of the properties of our TxContents object
    const valid_until = contents.valid_until
    const valid_from = contents.valid_from
    const from_address = contents.from_address
    const transfers = contents.transfers

    // iterate over the transfers in the transaction, which is singular in this instance
// ${amount.toNumber()}
    for (let [to_address, amount] of Object.entries(transfers)) {
        console.log(
            `\nThe submitted transaction: 
        from Address: ${from_address.toString()}
        to Address: ${to_address} 
        of amount: TODO reinsert abovecomment when types sorted
        and is valid from (block number): ${valid_from} 
        and valid until (block number): ${valid_until}`)
    }

    const unused_entity = new Entity()

    // Check the amount being transferred to a particular address; zero in the below instance
    const amount = contents.transfers_to(unused_entity)

    console.log(`\nThe amount being transferred to our unused entity ${amount.toNumber() === 0 ? 'is zero as expected' : 'FAILURE: nothing should be being transfered to our tested entity'}\n`)
    // Check the status of a transaction. This is an alternative to calling the LedgerApi's sync method, which itself polls the below status endpoint
    const status = await api.tx.status(tx)
    console.log('\nCurrent Status of the transaction is :', status.status + '\n')
}

main()
