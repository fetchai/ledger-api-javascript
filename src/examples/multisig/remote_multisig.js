// Demonstrates the distributed sharing of a multi-sig transaction before submission
import {LedgerApi} from "../../fetchai/ledger/api";
import {Entity} from "../../fetchai/ledger/crypto/entity";
import {Deed} from "../../fetchai/ledger/crypto/deed";
import {TokenTxFactory} from "../../fetchai/ledger/api/token";

const HOST = '127.0.0.1'
const PORT = 8000



async function main() {
    let balance, balance1, balance2, txs;
    // create the APIs
    const api = new LedgerApi(HOST, PORT)
    // generate a random identity
    const multi_sig_identity =  Entity.from_hex('6e8339a0c6d51fc58b4365bf2ce18ff2698d2b8c40bb13fcef7e1ba05df18e4b')
    // generate a board to control multi-sig account, with variable voting weights
    const board = []
    board.push({member: new Entity(), voting_weight: 1})
    board.push({member: new Entity(), voting_weight: 1})
    board.push({member: new Entity(), voting_weight: 1})
    board.push({member: new Entity(), voting_weight: 2})
    // generate another entity as a target for transfers
    const other_identity = new Entity()

    // Submit deed
    console.log("\nCreating deed...")
    const deed = new Deed(multi_sig_identity)
    board.forEach((board) => {
        deed.set_signee(board.member, board.voting_weight)
    })
    deed.set_amend_threshold(4)
    deed.set_threshold(deed.OPERATIONS.TRANSFER, 3)

    txs = await api.tokens.deed(multi_sig_identity, deed)
    await api.sync(txs)

    // Display balance before
    console.log("\nBefore remote-multisig transfer")
    balance1 = await api.tokens.balance(multi_sig_identity)
    console.log('Balance 1:', balance1)
    balance2 = await api.tokens.balance(other_identity)
    console.log('Balance 2:', balance2)

    // Scatter/gather example
    console.log("Generating transaction and distributing to signers...")

    // Add intended signers to transaction
    txs = await TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, board)
    api.tokens.set_validity_period(txs)


    // Serialize and send to be signed
    txs = txs.encode_partial()

    // Have signers individually sign transaction
   const signed_txs = []
    //for signer in board:
    board.forEach(async (board_member) => {
        // Signer builds their own transaction to compare to
        let signer_tx = await TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, board)

        // Signer decodes payload to inspect transaction
        let itx = Transaction.decode_partial(stx)

        // Some transaction details aren't expected to match/can't be predicted
        signer_tx.valid_until(itx.valid_until())
        signer_tx.counter(itx.counter())

        if (signer_tx.compare(itx)) {
            console.log("Transactions match")
        } else {
            console.log("Transactions do not match")
        }
        // Signers locally decode transaction
        itx.sign(signer)

        // Serialize for return to origin
        signed_txs.push(itx.encode_partial())
    })
    // Gather and encode final transaction
    console.log("Gathering and combining signed transactions...")
    // stxs = [Transaction.decode_partial(s) for s in signed_txs]

    let stxs = []
    signed_txs.foreach((s) => {
        stxs.push(Transaction.decode_partial(s));
    })

    stxs.foreach((st) => tx.merge_signatures(st))

    txs = await api.tokens.submit_signed_tx(tx, tx.signers)
    await api.sync(txs)

    console.log("\nAfter remote multisig-transfer")
    balance = await api.tokens.balance(multi_sig_identity)
    console.log('Balance 1:', balance)
    balance = await api.tokens.balance(other_identity)
    console.log('Balance 2:', balance)

    // Round robin example
    console.log("\nGenerating transaction and sending down the line of signers...")
    // Add intended signers to transaction
    const tx = await TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, signatories = board)
    await api.tokens.set_validity_period(tx)

    // Serialize and send to be signed
    txs = tx.encode_partial()

    // Have signers individually sign transaction and pass on to next signer
   // for signer in board:
    board.foreach((board_member) => {
    // Signer builds their own transaction to compare to
    let signer_tx = TokenTxFactory.transfer(multi_sig_identity, other_identity, 250, 20, board.map(item => item.member))

    // Signer decodes payload to inspect transaction
    itx = Transaction.decode_partial(stx)

    // Some transaction details aren't expected to match/can't be predicted
    signer_tx.valid_until(itx.valid_until())
    signer_tx.counter(itx.counter())


    if(signer_tx.compare(itx)){
        console.log("Transactions match")
    } else {
        console.log("Transactions do not match")
    }

    // Signers locally decode transaction
    itx.sign(board_member.member)
    // Signer re-encodes transaction and forwards to the next signer
    stx = itx.encode_partial()
})
    // Gather and encode final transaction
    console.log("Collecting final signed transaction...")
   let itx = Transaction.decode_partial(stx)
    txs = await api.tokens.submit_signed_tx(itx, itx.signers)
    await api.sync(txs)

    console.log("\nAfter remote multisig-transfer")
    balance = await api.tokens.balance(multi_sig_identity)
    console.log('Balance 1:', balance)
    balance = api.tokens.balance(other_identity)
    console.log('Balance 2:', balance)
}
main()
