import {Entity} from "../../fetchai/ledger/crypto/entity";
import {LedgerApi} from "../../fetchai/ledger/api";
import {ContractTxFactory} from "../../fetchai/ledger/api/contracts";
import {Deed} from "../../fetchai/ledger/crypto/deed";
import {Contract} from "../../fetchai/ledger";
import {Address} from "../../fetchai/ledger/crypto";

const CONTRACT_TEXT = `
persistent sharded balance_state : UInt64;
persistent supply_state : UInt64;
@init
function init(owner: Address)
    use supply_state;
    use balance_state[owner];
    supply_state.set(92817u64);
    balance_state.set(owner, 92817u64);
endfunction
@query
function totalSupply(): UInt64
    use supply_state;
    return supply_state.get();
endfunction
@query
function balanceOf(address: Address) : UInt64
    use balance_state[address];
    return balance_state.get(address, 0u64);
endfunction
@action
function transfer(from: Address, to: Address, value: UInt64) : Int64
    if(!from.signedTx())
      return 0i64;
    endif
    use balance_state[from, to];
    var from_balance = balance_state.get(from, 0u64);
    var to_balance = balance_state.get(to, 0u64);
    if(from_balance < value)
      return 0i64;
    endif
    var u_from = from_balance - value;
    var u_to = to_balance + value;
    balance_state.set(from, u_from);
    balance_state.set(to, u_to);
    return 1i64;
endfunction
`

async function print_address_balances(api, contract, addresses) {
    let balance, query
    for (let i = 0; i < addresses.length; i++) {
        balance = await api.tokens.balance(addresses[i])
        query = await contract.query(api, 'balanceOf', {address: addresses[i]})
        console.log(`Address : ${addresses[i]}: ${balance} bFET ${query} TOK'.`)
    }
}

function print_errors(errors) {
    errors.forEach((tx) => {
        console.log(`The following transaction: "${tx.get_digest_hex()}" did not succeed. It exited with status : "${tx.get_status()}" and exit code: "${tx.get_exit_code()}"`)
    })
}


async function main() {
    let txs, tx;
    // generate a random identity
    const multi_sig_identity = Entity.from_hex('e833c747ee0aeae29e6823e7c825d3001638bc30ffe50363f8adf2693c3286f8')

    // create our first private key pair
    const multi_sig_address = new Address(multi_sig_identity)

    // generate a board to control multi-sig account, with variable voting weights
    const board = []
    board.push({
        member: Entity.from_hex("6e8339a0c6d51fc58b4365bf2ce18ff2698d2b8c40bb13fcef7e1ba05df18e4b"),
        voting_weight: 1
    })
    board.push({
        member: Entity.from_hex("4083a476c4872f25cb40839ac8d994924bcef12d83e2ba4bd3ed6c9705959860"),
        voting_weight: 1
    })
    board.push({
        member: Entity.from_hex("7da0e3fa62a916238decd4f54d43301c809595d66dd469f82f29e076752b155c"),
        voting_weight: 1
    })
    board.push({
        member: Entity.from_hex("20293422c4b5faefba3422ed436427f2d37f310673681e98ac8637b04e756de3"),
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
    console.log("\nCreating deed...")
    const deed = new Deed(multi_sig_identity)

    board.forEach((item) => deed.set_signee(item.member, item.voting_weight))
    deed.set_amend_threshold(4)
    // Both the transfer and execute thresholds must be met to create a contract
    // TODO: Contract creation both requires meeting the thresholds below, and can only be signed by a single
    //  signatory. Therefore a single board member must be able to exceed these thresholds for creation
    deed.set_threshold("EXECUTE", 2)
    deed.set_threshold("TRANSFER", 2)

    //Submit deed
    txs = await api.tokens.deed(multi_sig_identity, deed)
    debugger;
    await api.sync([txs]).catch(errors => {
        print_errors(errors);
        throw new Error();
    })

    // throw new Error();
    // create the smart contract
    console.log('\nSetting up smart contract')

   const contract = new Contract(CONTRACT_TEXT, multi_sig_identity, Buffer.from('590953aea8a09c51', 'hex'))

    // TODO: Must be signed by single board member with sufficient votes

    tx = await contract.create(contract_factory, multi_sig_identity, 4000, [board[3].member])
    tx.sign(board[3].member)
    console.log("starts")
    txs = await api.contracts.submit_signed_tx(tx, tx.signers())
    console.log("ends")
    await api.sync([txs]).catch(errors => {
        print_errors(errors);
        throw new Error();
    })

    // print the current status of all the tokens
    console.log('-- BEFORE --')
    debugger;
    await print_address_balances(api, contract, [multi_sig_address, address2])

    // transfer from one to the other using our newly deployed contract
    const tok_transfer_amount = 200
    const fet_tx_fee = 160

    console.log("Building contract call transaction...")
    const signers = board.map(obj => obj.member)

    tx = await contract.action(contract_factory, 'transfer', fet_tx_fee, [multi_sig_address, address2, tok_transfer_amount], signers)
    board.forEach((board) => {
        tx.sign(board.member)
    })
    txs = await api.contracts.submit_signed_tx(tx, tx.signers())
    await api.sync([txs]).catch(errors => {
        print_errors(errors);
        throw new Error();
    })
    console.log('-- AFTER --')
    await print_address_balances(api, contract, [multi_sig_address, address2])
}

main()
