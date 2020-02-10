// Demonstrates the distributed sharing of a multi-sig transaction before submission
import {LedgerApi} from '../../fetchai/ledger/api'
import {Entity} from '../../fetchai/ledger/crypto/entity'
import {Deed} from '../../fetchai/ledger/crypto/deed'
import {TokenTxFactory} from '../../fetchai/ledger/api/token'
import {Transaction} from '../../fetchai/ledger/transaction'
import assert from 'assert'

const HOST = '127.0.0.1'
const PORT = 8000

async function main() {
    // create the APIs
    const api = new LedgerApi(HOST, PORT)
    // We generate an identity from a known key, which contains funds.
    const multi_sig_identity = Entity.from_hex('6e8339a0c6d51fc58b4365bf2ce18ff2698d2b8c40bb13fcef7e1ba05df18e4b')
    // generate a board to control multi-sig account, with variable voting weights
    const board = [
        {
            member: Entity.from_hex('e833c747ee0aeae29e6823e7c825d3001638bc30ffe50363f8adf2693c3286f8'),
            voting_weight: 1
        },
        {
            member: Entity.from_hex('4083a476c4872f25cb40839ac8d994924bcef12d83e2ba4bd3ed6c9705959860'),
            voting_weight: 1
        }, {
            member: Entity.from_hex('20293422c4b5faefba3422ed436427f2d37f310673681e98ac8637b04e756de3'),
            voting_weight: 1
        }, {
            member: Entity.from_hex('d5f10ad865fff147ae7fcfdc98b755452a27a345975c8b9b3433ff16f23495fb'),
            voting_weight: 2
        }
    ]
    // generate another entity as a target for transfers
    const other_identity = Entity.from_hex('7da0e3fa62a916238decd4f54d43301c809595d66dd469f82f29e076752b155c')


    console.log('\nCreating deed...\n')
    const deed = new Deed()
    board.forEach(board => deed.set_signee(board.member, board.voting_weight))
    deed.set_operation('amend', 4)
    deed.set_operation('transfer', 3)
    // Submit deed
    const txs = await api.tokens.deed(multi_sig_identity, deed, 500).catch((error) => {
        console.log(error)
        throw new Error()
    })
    await api.sync(txs).catch(errors => sync_error(errors))

    // Display balance before
    console.log('Before remote-multisig transfer \n')
    console.log('Balance 1:', await api.tokens.balance(multi_sig_identity).toString())
    console.log('\nBalance 2:', await api.tokens.balance(other_identity).toString())
    // Scatter/gather example
    console.log('\nGenerating transaction and distributing to signers...\n')
    // Add intended signers to transaction
    const ref_tx = TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, board.map(item => item.member))

    await api.tokens.set_validity_period(ref_tx)

    // Have signers individually sign transaction
    const signed_txs = []
    //for signer in board:
    for (const board_member of board) {
        // signer builds their own transaction to compare to note that each of the signers will need to agree on all
        // parts of the message including the validity period and the counter
        const signer_tx = TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, board.map(item => item.member))
        // Some transaction details aren't expected to match/can't be predicted
        signer_tx.valid_until(ref_tx.valid_until())
        signer_tx.valid_from(ref_tx.valid_from())
        signer_tx.counter(ref_tx.counter())

        console.log(signer_tx.compare(ref_tx) ? 'Transactions match' : 'Transactions do not match')
        // Signers locally decode transaction
        signer_tx.sign(board_member.member)
        // Serialize for return to origin
        signed_txs.push(signer_tx.encode_partial())
    }
    // gather and encode final transaction - this step in theory can be done by all the signers provided they are
    console.log('\nGathering and combining signed transactions...')

    const partial_txs = []

    signed_txs.forEach((partial) => {
        const [, decoded] = Transaction.decode_partial(partial)
        partial_txs.push(decoded)
    })


    const [success, tx] = Transaction.merge(partial_txs)

    assert(success)
    await api.sync(await api.tokens.submit_signed_tx(tx))

    console.log('\nAfter remote multisig-transfer')
    console.log('\nBalance 1:', await api.tokens.balance(multi_sig_identity).toString())
    console.log('\nBalance 2:', await api.tokens.balance(other_identity).toString())

    // Round robin example
    console.log('\nGenerating transaction and sending down the line of signers...\n')
    // Add intended signers to transaction
    const tx2 = TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, board.map(item => item.member))
    await api.set_validity_period(tx2)

    //Serialize and send to be signed
    const tx_payload = tx2.encode_payload()

    // Have signers individually sign transaction and pass on to next signer
    board.forEach((board_member) => {
        // build the target transaction
        const [signer_tx,] = Transaction.decode_payload(tx_payload)
        // Signer decodes payload to inspect transaction
        signer_tx.sign(board_member.member)
        // ensure that when we merge the signers signature into the payload that it is correct

        assert(tx2.merge_signatures(signer_tx))
    })

    // Gather and encode final transaction
    console.log('\nCollecting final signed transaction...\n')
    assert(tx2.is_valid())

    await api.sync(await api.tokens.submit_signed_tx(tx2)).catch(errors => sync_error(errors))
    console.log('After remote multisig-transfer \n')
    console.log('Balance 1:', await api.tokens.balance(multi_sig_identity).toString())
    console.log('\nBalance 2:  await api.tokens.balance(other_identity).toString() \n')
}

function sync_error(errors) {
    errors.forEach(tx =>
        console.log(`\nThe following transaction: "${tx.get_digest_hex()}" did not succeed. \nIt exited with status : "${tx.get_status()}" and exit code: "${tx.get_exit_code()}"`)
    )
    throw new Error()
}

main()
