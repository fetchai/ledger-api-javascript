import {DEFAULT_PORT, LOCAL_HOST} from '../../utils/helpers'
import {ContractsApi} from '../../../fetchai/ledger/api/contracts'
import {Address} from '../../../fetchai/ledger/crypto/address'
import {Entity} from '../../../fetchai/ledger/crypto/entity'
import {LedgerApi} from '../../../fetchai/ledger/api'
import {Contract} from '../../../fetchai/ledger/contract'
import {TRANSFER_CONTRACT} from '../../../contracts'
import axios from 'axios'

const [ENTITIES, ADDRESSES] = (() => {
    const ENTITIES = []
    ENTITIES.push(new Entity(Buffer.from('19c59b0a4890383eea59539173bfca5dc78e5e99037f4ad65c93d5b777b8720e', 'hex')))
    ENTITIES.push(new Entity(Buffer.from('e1b74f6357dbdd0e03ad26afaab04071964ef1c9a0f0abf10edb060e06c890a0', 'hex')))
    const ADDRESSES = []
    ADDRESSES.push(new Address(ENTITIES[0]))
    ADDRESSES.push(new Address(ENTITIES[1]))
    return [ENTITIES, ADDRESSES]
})()

const NONCE = (() => {
    Buffer.from('dGhpcyBpcyBhIG5vbmNl', 'base64')
})()


describe(':ContractsApi', () => {

    afterEach(() => {
        axios.mockClear()
    })

    test('test create', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const tx = await api.tokens.wealth(ENTITIES[0], 10000)
        await api.sync([tx])
        const contract = new Contract(TRANSFER_CONTRACT, ENTITIES[0], NONCE)
        const created = await contract.create(api, ENTITIES[0], 4000)

        expect(created).toHaveProperty('txs')
        expect(axios).toHaveBeenCalledTimes(5)
        const promise_sync = await api.sync(JSON.parse('[{"txs":["bbc6e88d647ab41923216cdaaba8cdd01f42e953c6583e59179d9b32f52f5777"],"counts":{"received":1,"submitted":1}}]'))
        await expect(promise_sync).toBe(true)
        expect(axios).toHaveBeenCalledTimes(6)
    })

    test('test query', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const contract = new Contract(TRANSFER_CONTRACT, ENTITIES[0], NONCE)
        const query = await contract.query(api, 'balance', {address: ADDRESSES[0]})
        expect(query).toBe(1000000)
    })

    test('test action', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const tok_transfer_amount = 200
        const fet_tx_fee = 160
        const contract = new Contract(TRANSFER_CONTRACT, ENTITIES[0], NONCE)
        const action = await contract.action(api, 'transfer', fet_tx_fee, [ENTITIES[0]], [ADDRESSES[0], ADDRESSES[1], tok_transfer_amount])
        expect(action).toHaveProperty('txs')
    })

    test('test _encode_json_payload', () => {
        const api = new ContractsApi(LOCAL_HOST, DEFAULT_PORT)
        const args = []
        args.push(new Address('2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED'))
        args.push(new Address('2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL'))
        args.push(200)
        const encoded = api._encode_json_payload(args)
        const reference = '{"0":"2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED","1":"2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL","2":200}'
        expect(JSON.stringify(encoded)).toBe(reference)
    })

    test('test _encode_json_payload with underscore as last character of key', () => {
        const api = new ContractsApi(LOCAL_HOST, DEFAULT_PORT)
        const underscore_test1_ = new Address('2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED')
        const underscore_test2_ = new Address('2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL')
        const encoded = api._encode_json_payload({underscore_test1_, underscore_test2_})
        const reference = '{"underscore_test1":"2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED","underscore_test2":"2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL"}'
        expect(JSON.stringify(encoded)).toBe(reference)
    })

    test('test _encode_json_payload with nested object', () => {
        const api = new ContractsApi(LOCAL_HOST, DEFAULT_PORT)
        const underScoreTest1_ = new Address('2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED')
        const underScoreTest2_ = new Address('2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL')
        const nest = {underScoreTest1_, underScoreTest2_}
        const nest_obj = {underScoreTest1_, underScoreTest2_, nest}
        const encoded = api._encode_json_payload(nest_obj)
        const reference = '{"underScoreTest1":"2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED","underScoreTest2":"2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL","nest":{"underScoreTest1":"2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED","underScoreTest2":"2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL"}}'
        expect(JSON.stringify(encoded)).toBe(reference)
    })

    test('test message pack encode', async () => {
        const api = new ContractsApi(LOCAL_HOST, DEFAULT_PORT)
        const args = []
        args.push(new Address('2J8wzPaBFRc2CtdRLkhRG5488HfrpkET8a5aHArmL5dLqvm7ED'))
        args.push(new Address('2X5fnrS8gM92BcnLp8mUTpp8LYGQx9wxyRLo6zHokBAMHMrMgL'))
        args.push(200)
        const actual = api._encode_msgpack_payload(args)
        // we compare as hex
        const actual_hex = Buffer.from(actual).toString('hex')
        const expected = Buffer.from('93c7204daa9b9ae48c1cc64c009e8055b38da18620edc70988b19f4c183ce82863f4122ac7204dc7ff5ef50909f23694849efb8f745483456ccf227885b6285a8c96dfe5e1524cccc8', 'hex')
        expect(actual_hex).toBe(expected.toString('hex'))
    })

    test('test IsJsonObject', async () => {
        const api = new ContractsApi(LOCAL_HOST, DEFAULT_PORT)

        const valid_json = '{"test": "valid json"}'
        const res = api.isJSON(valid_json)
        expect(res).toBe(true)

        const invalid_json = '{"test": "valid json ",,,,,}'
        const res2 = api.isJSON(invalid_json)
        expect(res2).toBe(false)

    })
})
