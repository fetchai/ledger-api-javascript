import {LedgerApi} from '../../fetchai/ledger/api'
import {Entity} from '../../fetchai/ledger/crypto/entity'
import {Deed} from '../../fetchai/ledger/crypto/deed'
import {TokenTxFactory} from '../../fetchai/ledger/api/token'

const HOST = '127.0.0.1'
const PORT = 8000

function sync_error(errors) {
    errors.forEach(tx =>
        console.log(`\nThe following transaction: "${tx.get_digest_hex()}" did not succeed. \nIt exited with status : "${tx.get_status()}" and exit code: "${tx.get_exit_code()}"`)
    )
    throw new Error()
}

function print_signing_votes(board) {
    let str = 'Votes: ' + board[0].voting_weight
    let sum = board[0].voting_weight
    for (let i = 1; i < board.length; i++) {
        str += ' + ' + board[i].voting_weight
        sum += board[i].voting_weight
    }

    if (board.length > 1) {
        str += ' = ' + sum
    }

    console.log('\n' + str)
}

async function main() {
    let balance, balance1, balance2, signatories, txs, tx, current_block_number

    // create the APIs
    const api = new LedgerApi(HOST, PORT)

    // We generate an identity from a known key, which contains funds.
    const multi_sig_identity = Entity.from_hex('6e8339a0c6d51fc58b4365bf2ce18ff2698d2b8c40bb13fcef7e1ba05df18e4b')

    // Generate a board to control multi-sig account, with variable voting weights
    const board = []

    board.push({
        member: Entity.from_hex('e833c747ee0aeae29e6823e7c825d3001638bc30ffe50363f8adf2693c3286f8'),
        voting_weight: 1
    })
    board.push({
        member: Entity.from_hex('4083a476c4872f25cb40839ac8d994924bcef12d83e2ba4bd3ed6c9705959860'),
        voting_weight: 1
    })
    board.push({
        member: Entity.from_hex('20293422c4b5faefba3422ed436427f2d37f310673681e98ac8637b04e756de3'),
        voting_weight: 1
    })
    board.push({
        member: Entity.from_hex('d5f10ad865fff147ae7fcfdc98b755452a27a345975c8b9b3433ff16f23495fb'),
        voting_weight: 2
    })

    const other_identity = Entity.from_hex('e833c747ee0aeae29e6823e7c825d3001638bc30ffe50363f8adf2693c3286f8')
    balance = await api.tokens.balance(multi_sig_identity)
    console.log('\nOriginal balance of multi_sig_identity: ', balance.toString())

    // Transfers can happen normally without a deed
    console.log('\nSubmitting pre-deed transfer with original signature...')
  debugger;
    tx = await api.tokens.transfer(multi_sig_identity, other_identity, 250, 20)
    await api.sync([tx]).catch(errors => sync_error(errors))

    balance1 = await api.tokens.balance(multi_sig_identity)
    console.log('\nBalance 1:', balance1.toString())
    balance2 = await api.tokens.balance(other_identity)
    console.log('\nBalance 2:', balance2.toString())

    // Submit deed
    console.log('\nCreating deed...')
    const deed = new Deed()
    board.forEach((item) => {
        deed.set_signee(item.member, item.voting_weight)
    })

    deed.set_operation('amend', 2)
    deed.set_operation('transfer', 4)

    tx = await api.tokens.deed(multi_sig_identity, deed, 6000)

    await api.sync([tx], 20).catch(errors => sync_error(errors))

    // Original address can no longer validate transfers
    console.log('\nTransfer with original signature should fail...')

    tx = await api.tokens.transfer(multi_sig_identity, other_identity, 250, 20)

    await api.sync([tx]).catch(errors => {
        console.log(`\nTransaction failed as expected. \nTransaction status: ${errors[0].get_status()}`)
    })

    // Sufficient voting power required to sign transfers
    console.log('\nTODOSubmitting transfer with two signatures with total 2 votes...')
    print_signing_votes(board.slice(0, 2))
     signatories = board.slice(0, 2).map(obj => obj.member)
    // since we now want to create a transaction which has only been signed by a subset of the board, we must use
    // the factory interface in order to build out the transaction we are after
    tx = await TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, signatories)
    current_block_number = await api.tokens.current_block_number()
    tx.valid_until(current_block_number + 100)
    signatories.forEach(entity => tx.sign(entity))

    await api.sync([tx]).catch(errors => sync_error(errors))

    balance1 = await api.tokens.balance(multi_sig_identity)
    console.log('\nBalance 1:', balance1.toString())
    balance2 = await api.tokens.balance(other_identity)
    console.log('\nBalance 2:', balance2.toString())

    // Some entities may have more voting power
    console.log('\nSubmitting transfer with single signature with 2 votes...')
    print_signing_votes([board[3]])

    tx = await TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, [board[3].member])
    current_block_number = await api.tokens.current_block_number()
    tx.valid_until(current_block_number + 100)
    tx.sign(board[3].member)

    await api.sync([tx]).catch(errors => sync_error(errors))

    balance = await api.tokens.balance(multi_sig_identity)
    console.log('\nBalance 1:', balance.toString())
    balance = await api.tokens.balance(other_identity)
    console.log('\nBalance 2:', balance.toString())

    // Amend the deed
    console.log('\nAmending deed to increase transfer threshold to 3 votes...')
    deed.set_operation('transfer', 3)

    signatories = board.map(obj => obj.member)
    tx = await TokenTxFactory.deed(multi_sig_identity, deed, 400, signatories)
    current_block_number = await api.tokens.current_block_number()
    tx.valid_until(current_block_number + 100)
    signatories.forEach(entity => tx.sign(entity))
    await api.sync([tx]).catch(errors => sync_error(errors))

    // Single member no longer has enough voting power
    console.log('\nSingle member transfer with 2 votes should no longer succeed...')
    print_signing_votes([board[3]])

    tx = await api.tokens.transfer(multi_sig_identity, other_identity, 250, 20, [board[3].member])
    current_block_number = await api.tokens.current_block_number()
    tx.valid_until(current_block_number + 100)
    tx.sign(board[3].member)

    await api.sync([tx]).catch(errors => {
        console.log(`\nTransaction failed as expected. \nTransaction status: ${errors[0].get_status()}`)
    })

    // Correct number of signatory votes
    console.log('\nSuccesful transaction with sufficient voting weight...')

    signatories = board.slice(1).map(obj => obj.member)
    print_signing_votes(board.slice(1))

    tx = await TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, signatories)
    current_block_number = await api.tokens.current_block_number()
    tx.valid_until(current_block_number + 100)
    signatories.forEach(entity => tx.sign(entity))
    await api.sync([tx]).catch(errors => sync_error(errors))

    balance1 = await api.tokens.balance(multi_sig_identity)
    console.log('\nBalance 1:', balance1.toString())
    balance2 = await api.tokens.balance(other_identity)
    console.log('\nBalance 2:', balance2.toString())

    // Warning: if no amend threshold is set, future amendments are impossible
    console.log('\nAmending deed to remove threshold...')

    deed.remove_operation('amend')
    deed.require_amend = false

    signatories = board.map(obj => obj.member)

    tx = await TokenTxFactory.deed(multi_sig_identity, deed, 400, signatories)
    current_block_number =  await api.tokens.current_block_number() + 100;
    tx.valid_until(current_block_number)
    signatories.forEach(entity => tx.sign(entity))
    await api.sync([tx]).catch(errors => sync_error(errors))

     deed.set_operation('amend', 1)
    console.log('\nExpecting further amendment to fail...')

    tx = await TokenTxFactory.deed(multi_sig_identity, deed, signatories)
    current_block_number =  await api.tokens.current_block_number() + 100;
    tx.valid_until(current_block_number)
    signatories.forEach(entity => tx.sign(entity))
    await api.sync([tx]).catch(errors =>
        console.log(`\nFurther amendment failed as expected. \n\nTransaction status: ${errors[0].get_status()}\n`)
    )
}

main()
