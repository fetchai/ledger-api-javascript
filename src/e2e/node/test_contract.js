import {LedgerApi} from "../../fetchai/ledger/api";
import {Contract} from "../../fetchai/ledger";
import {ADDRESSES, DEFAULT_PORT, ENTITIES, LOCAL_HOST} from "../../tests/utils/helpers";
import {TRANSFER_CONTRACT} from "../../contracts";


async function print_address_balances(api, contract, addresses) {
    let balance, query
    for (let i = 0; i < addresses.length; i++) {
        balance = await api.tokens.balance(addresses[i])
        query = await contract.query(api, 'balance', {address: addresses[i]})
        console.log(`Address : ${addresses[i]}: ${balance} bFET ${query} TOK'.`)
    }
}

export async function test_contract() {
    const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
    const tx = await api.tokens.wealth(ENTITIES[0], 10000)
    // create wealth so that we have the funds to be able to create contracts on the network
    await api.sync([tx])
    const nonce = Buffer.from('dGhpcyBpcyBhIG5vbmNl', 'base64')
    // create the smart contract
    const contract = new Contract(TRANSFER_CONTRACT, ENTITIES[0], nonce)
    const created = await contract.create(api, ENTITIES[0], 4000)
    await api.sync([created])
    await print_address_balances(api, contract, [ADDRESSES[0], ADDRESSES[1]])
    const tok_transfer_amount = 200
    const fet_tx_fee = 160
    const action = await contract.action(api, 'transfer', fet_tx_fee, [ENTITIES[0]], [ADDRESSES[0], ADDRESSES[1], tok_transfer_amount])
    await api.sync([action])
    await print_address_balances(api, contract, [ADDRESSES[0], ADDRESSES[1]])
}
