// Demonstrates the distributed sharing of a multi-sig transaction before submission
import {LedgerApi} from '../../fetchai/ledger/api'
import {Entity} from '../../fetchai/ledger/crypto/entity'
import {Deed} from '../../fetchai/ledger/crypto/deed'
import {TokenTxFactory} from '../../fetchai/ledger/api/token'
import {Transaction} from '../../fetchai/ledger/transaction'

const HOST = '127.0.0.1'
const PORT = 8000

function print_errors(errors) {
    errors.forEach((tx) => {
        console.log(`The following transaction: "${tx.get_digest_hex()}" did not succeed. It exited with status : "${tx.get_status()}" and exit code: "${tx.get_exit_code()}"`)
    })
}

async function main() {
    let balance, txs, tx, itx
    // create the APIs
    const api = new LedgerApi(HOST, PORT)
    // We generate an identity from a known key, which contains funds.
    const multi_sig_identity = Entity.from_hex('6e8339a0c6d51fc58b4365bf2ce18ff2698d2b8c40bb13fcef7e1ba05df18e4b')
    // generate a board to control multi-sig account, with variable voting weights
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
    // generate another entity as a target for transfers
    const other_identity = Entity.from_hex('7da0e3fa62a916238decd4f54d43301c809595d66dd469f82f29e076752b155c')


    console.log('Creating deed...\n')
    const deed = new Deed(multi_sig_identity)
    board.forEach(board => deed.set_signee(board.member, board.voting_weight))
    deed.set_amend_threshold(4)
    deed.set_threshold('TRANSFER', 3)
    // Submit deed
    txs = await api.tokens.deed(multi_sig_identity, deed)
    await api.sync([txs])

    // Display balance before
    console.log('Before remote-multisig transfer \n')

    console.log('Balance 1:', await api.tokens.balance(multi_sig_identity).toString())
    balance = await api.tokens.balance(other_identity)
    console.log('Balance 2:', balance.toString())
    // Scatter/gather example
    console.log('Generating transaction and distributing to signers...')
    // Add intended signers to transaction
    tx = TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, board.map(item => item.member))

    await api.tokens.set_validity_period(tx)
    // Serialize and send to be signed
    let stx = tx.encode_partial()

    // Have signers individually sign transaction
    const signed_txs = []
    //for signer in board:
    for (const board_member of board) {
        // Signer builds their own transaction to compare to
        let signer_tx = TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, board.map(item => item.member))
        // Signer decodes payload to inspect transaction
        itx = Transaction.decode_partial(stx)
        // Some transaction details aren't expected to match/can't be predicted
        signer_tx.valid_until(itx.valid_until())
        signer_tx.counter(itx.counter())
        console.log(signer_tx.compare(itx)? 'Transactions match' : 'Transactions do not match')
        // Signers locally decode transaction
        itx.sign(board_member.member)
        // Serialize for return to origin
        signed_txs.push(itx.encode_partial())
    }
    // Gather and encode final transaction
    console.log('Gathering and combining signed transactions...')

    let stxs = []

    signed_txs.forEach((s) => {
        stxs.push(Transaction.decode_partial(s))
    })

    stxs.forEach((st) => {
        tx.merge_signatures(st)
    })

    txs = await api.tokens.submit_signed_tx(tx, tx.signers())
    await api.sync([txs])

    console.log('\nAfter remote multisig-transfer')
    balance = await api.tokens.balance(multi_sig_identity)
    console.log('Balance 1:', balance.toString())
    balance = await api.tokens.balance(other_identity)
    console.log('Balance 2:', balance.toString())

    // Round robin example
    console.log('Generating transaction and sending down the line of signers...\n')
    // Add intended signers to transaction
    tx = TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, board.map(item => item.member))
    await api.tokens.set_validity_period(tx)

    // Serialize and send to be signed
    stx = tx.encode_partial()

    // Have signers individually sign transaction and pass on to next signer
    board.forEach((board_member) => {
        // Signer builds their own transaction to compare to
        let signer_tx = TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, board.map(item => item.member))

        // Signer decodes payload to inspect transaction
        itx = Transaction.decode_partial(stx)

        // Some transaction details aren't expected to match/can't be predicted
        signer_tx.valid_until(itx.valid_until())
        signer_tx.counter(itx.counter())
        console.log(signer_tx.compare(itx)? 'Transactions match' : 'Transactions do not match')
        // Signers locally decode transaction
        itx.sign(board_member.member)
        // Signer re-encodes transaction and forwards to the next signer
        stx = itx.encode_partial()
    })
    // Gather and encode final transaction
    console.log('Collecting final signed transaction...!')
    itx = Transaction.decode_partial(stx)
    txs = await api.tokens.submit_signed_tx(itx, itx.signers())
    await api.sync([txs]).catch(errors => print_errors(errors))
    console.log('After remote multisig-transfer \n')
    balance = await api.tokens.balance(multi_sig_identity)
    console.log('Balance 1:', balance.toString())
    balance = await api.tokens.balance(other_identity)
    console.log('Balance 2:', balance.toString())
}

main()
