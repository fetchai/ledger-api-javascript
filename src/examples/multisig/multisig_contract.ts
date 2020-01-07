import {Entity} from '../../fetchai/ledger/crypto/entity'
import {LedgerApi} from '../../fetchai/ledger/api'
import {ContractTxFactory} from '../../fetchai/ledger/api/contracts'
import {Deed} from '../../fetchai/ledger/crypto/deed'
import {Contract} from '../../fetchai/ledger'
import {Address} from '../../fetchai/ledger/crypto'
import {MUTLISIG_CONTRACT} from '../../contracts'



async function print_address_balances(api, contract, addresses) {
    let balance, query
    for (let i = 0; i < addresses.length; i++) {
        balance = await api.tokens.balance(addresses[i])
        query = await contract.query(api, 'balanceOf', {address: addresses[i]})
        console.log(`Address : ${addresses[i]}: ${balance.toString()} bFET ${query} TOK'.\n`)
    }
}

function sync_error(errors) {
    errors.forEach(tx =>
        console.log(`\nThe following transaction: "${tx.get_digest_hex()}" did not succeed. \nIt exited with status : "${tx.get_status()}" and exit code: "${tx.get_exit_code()}"`)
    )
    throw new Error()
}


async function main() {
    let txs, tx, nonce

    // We generate an identity from a known key, which contains funds.
    const multi_sig_identity = Entity.from_hex('e833c747ee0aeae29e6823e7c825d3001638bc30ffe50363f8adf2693c3286f8')

    // create our first private key pair
    const multi_sig_address = new Address(multi_sig_identity)

    // generate a board to control multi-sig account, with variable voting weights
    const board = []
    board.push({
        member: Entity.from_hex('6e8339a0c6d51fc58b4365bf2ce18ff2698d2b8c40bb13fcef7e1ba05df18e4b'),
        voting_weight: 1
    })
    board.push({
        member: Entity.from_hex('4083a476c4872f25cb40839ac8d994924bcef12d83e2ba4bd3ed6c9705959860'),
        voting_weight: 1
    })
    board.push({
        member: Entity.from_hex('7da0e3fa62a916238decd4f54d43301c809595d66dd469f82f29e076752b155c'),
        voting_weight: 1
    })
    board.push({
        member: Entity.from_hex('20293422c4b5faefba3422ed436427f2d37f310673681e98ac8637b04e756de3'),
        voting_weight: 2
    })

    // create a second private key pair
    const entity2 = new Entity()
    const address2 = new Address(entity2)

    // build the ledger API
    const api = new LedgerApi('127.0.0.1', 8000)
    // create contract factory
    const contract_factory = new ContractTxFactory(api)

    // create a multisig deed for multi_sig_identity
    console.log('\nCreating deed...')
    const deed = new Deed(multi_sig_identity)

    board.forEach((item) => deed.set_signee(item.member, item.voting_weight))
    deed.set_amend_threshold(4)
    // Both the transfer and execute thresholds must be met to create a contract
    // TODO: Contract creation both requires meeting the thresholds below, and can only be signed by a single
    //  signatory. Therefore a single board member must be able to exceed these thresholds for creation
    deed.set_threshold('EXECUTE', 2)
    deed.set_threshold('TRANSFER', 2)

    //Submit deed
    txs = await api.tokens.deed(multi_sig_identity, deed).catch((error) => console.log(error))

    await api.sync([txs]).catch(errors => sync_error(errors))

    // create the smart contract
    console.log('\nSetting up smart contract\n')

    // A nonce is an optional attribute for a contract.
    nonce = Buffer.from('590953aea8a09c51', 'hex')

    const contract = new Contract(MUTLISIG_CONTRACT, multi_sig_identity, nonce)
    tx = await contract.create(contract_factory, multi_sig_identity, 4000, [board[3].member])
    tx.sign(board[3].member)
    txs = await api.contracts.submit_signed_tx(tx, tx.signers())
    await api.sync([txs]).catch(errors => sync_error(errors))

    // print the current status of all the tokens
    console.log('\n-- BEFORE --\n')
    await print_address_balances(api, contract, [multi_sig_address, address2])

    // transfer from one to the other using our newly deployed contract
    const tok_transfer_amount = 200
    const fet_tx_fee = 160

    console.log('\nBuilding contract call transaction...')
    const signers = board.map(obj => obj.member)

    tx = await contract.action(contract_factory, 'transfer', fet_tx_fee, [multi_sig_address, address2, tok_transfer_amount], signers)
    board.forEach((board) => {
        tx.sign(board.member)
    })
    txs = await api.contracts.submit_signed_tx(tx, tx.signers())

    await api.sync([txs]).catch(errors => sync_error(errors))
    console.log('\n-- AFTER --\n')
    await print_address_balances(api, contract, [multi_sig_address, address2])
}

main()
