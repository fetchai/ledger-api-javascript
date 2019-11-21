import {Address, Entity} from '../fetchai/ledger/crypto'
import {Contract} from '../fetchai/ledger/contract'
import {LedgerApi} from '../fetchai/ledger/api'
import {TRANSFER_CONTRACT} from '../contracts'


async function print_address_balances(api, contract, addresses) {
    let balance, query
    for (let i = 0; i < addresses.length; i++) {
        balance = await api.tokens.balance(addresses[i])
        query = await contract.query(api, 'balance', {address: addresses[i]})
        console.log(`Address : ${addresses[i]}: ${balance} bFET ${query} TOK'.`)
    }
}

async function main() {
    //create our first private key pair
    const entity1 = new Entity(Buffer.from('19c59b0a4890383eea59539173bfca5dc78e5e99037f4ad65c93d5b777b8720e', 'hex'))
    const address1 = new Address(entity1)
    // create a second private key pair
    const entity2 = new Entity(Buffer.from('e1b74f6357dbdd0e03ad26afaab04071964ef1c9a0f0abf10edb060e06c890a0', 'hex'))
    const address2 = new Address(entity2)

    const api = new LedgerApi('127.0.0.1', 8000)
    const tx = await api.tokens.wealth(entity1, 10000)
    // create wealth so that we have the funds to be able to create contracts on the network
    await api.sync([tx])
    const nonce = Buffer.from('dGhpcyBpcyBhIG5vbmNl', 'base64')
    // create the smart contract
    const contract = new Contract(TRANSFER_CONTRACT, entity1, nonce)
    const created = await contract.create(api, entity1, 4000)
    await api.sync([created])
    console.log('-- BEFORE --')
    await print_address_balances(api, contract, [address1, address2])
    const tok_transfer_amount = 200
    const fet_tx_fee = 160
    const action = await contract.action(api, 'transfer', fet_tx_fee, [entity1], [address1, address2, tok_transfer_amount])

    await api.sync([action])
    console.log('-- AFTER --')
    await print_address_balances(api, contract, [address1, address2])
}

main()

