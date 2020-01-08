import {Assert} from '../utils/assert'
import {DEFAULT_PORT, LOCAL_HOST} from '../../utils/helpers'
import {Contract} from '../../../fetchai/ledger/contract'
import {TRANSFER_CONTRACT} from '../../../contracts'
import {Entity} from '../../../fetchai/ledger/crypto/entity'
import {LedgerApi} from '../../../fetchai/ledger/api'
import {Address} from '../../../fetchai/ledger/crypto'


async function print_address_balances(api, contract, addresses) {
    let balance, query
    for (let i = 0; i < addresses.length; i++) {
        balance = await api.tokens.balance(addresses[i])
        query = await contract.query(api, 'balance', {address: addresses[i]})
        console.log(`Address : ${addresses[i]}: ${balance} bFET ${query} TOK'.`)
    }
}

async function get_address_balance(api, contract, address) {
    let balance, query
    balance = await api.tokens.balance(address)
    query = await contract.query(api, 'balance', {address: address})
    console.log(`Address : ${address}: ${balance} bFET ${query} TOK'.`)
    return [balance, query]
}

export async function test_contract() {
    const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
    const entity = new Entity()
    const address1 = new Address(entity)
    const address2 = new Address(new Entity())
    const tx = await api.tokens.wealth(entity, 10000)
    await api.sync([tx])
    const nonce = Buffer.from('dGhpcyBpcyBhIG5vbmNl', 'base64')
    const contract = new Contract(TRANSFER_CONTRACT, entity, nonce)
    const created = await contract.create(api, entity, 4000)
    await api.sync([created])
    await print_address_balances(api, contract, [address1, address2])
    const tok_transfer_amount = 200
    const fet_tx_fee = 160
    const action = await contract.action(api, 'transfer', fet_tx_fee, [entity], [address1, address2, tok_transfer_amount])
    await api.sync([action])
    await print_address_balances(api, contract, [address1, address2])
    const [balance1, query1] = await get_address_balance(api, contract, address1)
    Assert.assert_equal(balance1, 8562)
    Assert.assert_equal(query1, 999800)
    const [balance2, query2] = await get_address_balance(api, contract, address2)
    Assert.assert_equal(balance2, 0)
    Assert.assert_equal(query2, 200)
}

