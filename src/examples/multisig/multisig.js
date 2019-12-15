import {LedgerApi, TokenApi} from "../../fetchai/ledger/api";
import {Entity} from "../../fetchai/ledger/crypto/entity";

const HOST = '127.0.0.1'
const PORT = 8000


function print_signing_votes(board){
       console.log("print_signing_votes called");
       let str = "Votes: " + board[0].voting_weight;

    for(let i = 1; i < board.length; i++) {
            str+= " + " + board[0].voting_weight
    }
     const sum = board.reduce((acc, val) => acc + val.voting_weight );
      str+= sum
    console.log(str)
        }

        async function main() {
        let balance, balance1, balance2, signatories, txs;
    // create the APIs
    const api = new LedgerApi(HOST, PORT)

    // generate a random identity
    const multi_sig_identity = Entity()
    // generate a board to control multi-sig account, with variable voting weights
    const board = []
            board.push({ member: new Entity(), voting_weight: 1})
            board.push({ member: new Entity(), voting_weight: 1})
            board.push({ member: new Entity(), voting_weight: 1})
            board.push({ member: new Entity(), voting_weight: 2})
            //
    // const voting_weights = [
    //     [board[0] : 1],
    //     board[1]: 1,
    //     board[2]: 1,
    //     board[3]: 2,
    // ]
    // // generate another entity as a target for transfers
    const other_identity = new Entity()

    // Create the balance
    console.log('Submitting wealth creation...')
    tx = api.tokens.wealth(multi_sig_identity, 100000000)
    await api.sync(tx)
    balance = await api.tokens.balance(multi_sig_identity)
    console.log('Balance after wealth:', balance)

    // Transfers can happen normally without a deed
    console.log('Submitting pre-deed transfer with original signature...')
         tx = await api.tokens.transfer(multi_sig_identity, other_identity, 250, 20)
         await api.sync(tx)
         balance1 =   await api.tokens.balance(multi_sig_identity)
         balance2 =   await api.tokens.balance(other_identity)
    console.log('Balance 1:', balance1)
    console.log('Balance 2:', balance2)

    // Submit deed
    console.log("\nCreating deed...")
    const deed = new Deed(multi_sig_identity)

    board.forEach((item) => { deed.set_signee(item.member, item.voting_weight) })
    deed.amend_threshold(4)
    deed.transfer_threshold(2)
    tx = api.tokens.deed(multi_sig_identity, deed)
    await api.sync(tx)
    // Original address can no longer validate transfers
    console.log("\nTransfer with original signature should fail...")

    try {
        await api.sync(api.tokens.transfer(multi_sig_identity, other_identity, 250, 20))
    } catch(e){
       console.log("Transaction failed as expected")
    }

    // Sufficient voting power required to sign transfers
    console.log("\nSubmitting transfer with two signatures with total 2 votes...")
    print_signing_votes(board.slice(0, 2))
    signatories = board.slice(0, 2).map( obj => obj.member )
    tx = api.tokens.transfer(multi_sig_identity, other_identity, 250, 20, signatories)
    await api.sync(tx)

    console.log('Balance 1:', api.tokens.balance(multi_sig_identity))
    console.log('Balance 2:', api.tokens.balance(other_identity))

    // Some entities may have more voting power
    console.log("\nSubmitting transfer with single signature with 2 votes...")
    print_signing_votes(board[3])
    signatories = board.slice(0, 3).map( obj => obj.member )
    txs = await api.tokens.transfer(multi_sig_identity, other_identity, 250, 20, signatories)
    await api.sync(txs)
    console.log('Balance 1:', api.tokens.balance(multi_sig_identity))
    console.log('Balance 2:', api.tokens.balance(other_identity))

    // Amend the deed
    console.log("\nAmending deed to increase transfer threshold to 3 votes...")
    deed.transfer_threshold = 3
    txs = (multi_sig_identity, deed, board)
    await api.sync(txs)

    // Single member no longer has enough voting power
    console.log("\nSingle member transfer with 2 votes should no longer succeed...")
            print_signing_votes(board[3])
    try {

        tx = await api.tokens.transfer(multi_sig_identity, other_identity, 250, 20, board[0].member)
        await api.sync(tx)
    } catch(e){
         console.log("Transaction failed as expected")
    }

    // Correct number of signatory votes
    console.log("\nSuccesful transaction with sufficient voting weight...")
            signatories = board.slice(1).map( obj => obj.member )
    print_signing_votes(board.slice(1))
            txs = await api.tokens.transfer(multi_sig_identity, other_identity, 250, 20, signatories)
    await api.sync(txs)

          balance1 =  await api.tokens.balance(multi_sig_identity)
            balance2 =  await api.tokens.balance(other_identity)
    console.log('Balance 1:', balance1)
    console.log('Balance 2:', balance2)

    // Warning: if no amend threshold is set, future amendments are impossible
    console.log("\nAmending deed to remove threshold...")
    deed.amend_threshold(null)
            signatories = board.map( obj => obj.member )
            tx = api.tokens.deed(multi_sig_identity, deed, )
    await api.sync(tx)

    deed.amend_threshold (1)
    console.log("\nExpecting further amendment to fail...")
    try {
                    signatories = board.map( obj => obj.member )
        let tx = await api.tokens.deed(multi_sig_identity, deed, signatories)
        await api.sync(tx)
       } catch(e) {
         console.log("Transaction failed as expected")
    }
}

main()
