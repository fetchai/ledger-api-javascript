import {Entity} from "../../fetchai/ledger/crypto";


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
        query = await contract.query(api, 'balance', {address: addresses[i]})
        console.log(`Address : ${addresses[i]}: ${balance} bFET ${query} TOK'.`)
    }
}

// def print_address_balances(api: LedgerApi, contract: Contract, addresses: List[Address]):
//     for idx, address in enumerate(addresses):
//         print('Address{}: {:<6d} bFET {:<10d} TOK'.format(idx, api.tokens.balance(address),
//                                                           contract.query(api, 'balanceOf', address=address)))
//     print()


async  function main(){
    let txs;
   // generate a random identity
   const multi_sig_identity = Entity()

   // create our first private key pair
    const multi_sig_address = new Address(multi_sig_identity)

   // generate a board to control multi-sig account, with variable voting weights
    const board = []
            board.push({ member: new Entity(), voting_weight: 1})
            board.push({ member: new Entity(), voting_weight: 1})
            board.push({ member: new Entity(), voting_weight: 1})
            board.push({ member: new Entity(), voting_weight: 2})

   // create a second private key pair
    const entity2 = new Entity()
    const address2 = new Address(entity2)

   // build the ledger API
    const api = new LedgerApi('127.0.0.1', 8000)
   // create contract factory
    const contract_factory = new ContractTxFactory(api)

   // create wealth so that we have the funds to be able to create contracts on the network
    txs = api.tokens.wealth(multi_sig_identity, 10000)
    api.sync(txs)

    board.forEach(async (obj)  =>  {
        txs = await api.tokens.wealth(obj.member, 10000);
        await  api.sync(txs)
    })

   // create a multisig deed for multi_sig_identity
    console.log("\nCreating deed...")
    const deed = new Deed(multi_sig_identity)
    // for sig, weight in voting_weights.items():
    //     deed.set_signee(sig, weight)

    board.forEach((item) => deed.set_signee(item.member, item.voting_weight))

    deed.amend_threshold(4)
   // Both the transfer and execute thresholds must be met to create a contract
   // TODO: Contract creation both requires meeting the thresholds below, and can only be signed by a single
   //  signatory. Therefore a single board member must be able to exceed these thresholds for creation
    deed.set_threshold(Operation.EXECUTE, 2)
    deed.set_threshold(Operation.TRANSFER, 2)

   // Submit deed
    txs = await api.tokens.deed(multi_sig_identity, deed)
    await api.sync(txs)

   // create the smart contract
    console.log('\nSetting up smart contract')
    const contract = new Contract(CONTRACT_TEXT, multi_sig_identity)

   // TODO: Must be signed by single board member with sufficient votes
    tx = await contract.create(contract_factory, multi_sig_identity, 4000, board[3].member)
    tx.sign(board[3].member)

    txs = await api.contracts.submit_signed_tx(tx, tx.signers)
    await api.sync(txs)

   // print the current status of all the tokens
    console.log('-- BEFORE --')
    print_address_balances(api, contract, [multi_sig_address, address2])

   // transfer from one to the other using our newly deployed contract
    const tok_transfer_amount = 200
    const fet_tx_fee = 160

    console.log("Building contract call transaction...")
    const signers = board.map( obj => obj.member )
    tx = await contract.action(contract_factory, 'transfer', fet_tx_fee, multi_sig_address, address2, tok_transfer_amount, signers)
    board.forEach((board)=> {tx.sign(board.member)})

    txs = await api.contracts.submit_signed_tx(tx, tx.signers)
    await api.sync(txs)

    console.log('-- AFTER --')
    print_address_balances(api, contract, [multi_sig_address, address2])
}
    main()
