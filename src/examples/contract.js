import {logger} from "../fetchai/ledger/utils";
import {Address, Entity} from "../fetchai/ledger/crypto";
import {LedgerApi} from "../fetchai/ledger/api";
import {Contract} from "../fetchai/ledger/contract";

const CONTRACT_TEXT = `
persistent sharded balance_s : UInt64;

@init
function setup(owner : Address)
  use balance_s[owner];
  balance_s.set(owner, 1000000u64);
endfunction

@action
function transfer(from: Address, to: Address, amount: UInt64)

  use balance_s[from, to];
  
  // Check if the sender has enough balance to proceed
  if (balance_s.get(from) >= amount)

    // balance_s the account balances
    balance_s.set(from, balance_s.get(from) - amount);
    balance_s.set(to, balance_s.get(to, 0u64) + amount);
  endif

endfunction

@query
function balance(address: Address) : UInt64
    use balance_s[address];
    return balance_s.get(address, 0u64);
endfunction

`;


async function print_address_balances(api, contract, addresses) {
    debugger;
    let balance, query;
    for (let i = 0; i < addresses.length; i++){
        balance = await api.tokens.balance(addresses[i])
        query = await contract.query(api, 'balance', addresses[i])
        // TODO add formatting like python  print('Address{}: {:<6d} bFET {:<10d} TOK'.format(idx, api.tokens.balance(address), contract.query(api, 'balance', address = address)))
        logger.info(`'!!!!!!!!!Address${addresses[i]}: ${balance} bFET ${query} TOK'.`)
    }
}

async function main(){
    //create our first private key pair
    const entity1 = new Entity()
    const address1 = new Address(entity1)
    // create a second private key pair
    const entity2 = new Entity()
    const address2 = new Address(entity2)

    // build the ledger API
    const api = new LedgerApi('127.0.0.1', 8000)

    const tx = await api.tokens.wealth(entity1, 2800023499)
    // create wealth so that we have the funds to be able to create contracts on the network
    await api.sync([tx])

    const bal = await api.tokens.balance(entity1)

    // create the smart contract
    const contract = new Contract(CONTRACT_TEXT)

    const created = await contract.create(api, entity1, 4000)
    console.log('BEFORECREATED');
    console.log(created)
    // with track_cost(api.tokens, entity1, "Cost of creation: "):
    await api.sync([created])

    // print the current status of all the tokens
    logger.info('-- BEFORE --')
    await print_address_balances(api, contract, [address1, address2])

    // transfer from one to the other using our newly deployed contract
    const tok_transfer_amount = 200
    const fet_tx_fee = 160
    // with track_cost(api.tokens, entity1, "Cost of transfer: "):
    const action = await contract.action(api, 'transfer', fet_tx_fee, [entity1], address1, address2, tok_transfer_amount)
    await api.sync([action])
    debugger;
    logger.info('-- AFTER --')
    await print_address_balances(api, contract, [address1, address2]);
}
main();

