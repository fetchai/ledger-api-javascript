import {ADDRESSES, DEFAULT_PORT, ENTITIES, LOCAL_HOST} from '../../utils/helpers'
import {TxContents} from '../../../fetchai/ledger/api/tx'
import {Address} from '../../../fetchai/ledger/crypto/address'
import {BN} from 'bn.js'

import {LedgerApi} from '../../../fetchai/ledger/api'

describe(':TXContentsTest', () => {
    test('test contents', async () => {
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
        const transfer = await api.tokens.transfer(ENTITIES[0], ENTITIES[1], 1000, 50)
        const json = await api.tx.contents(transfer)
        expect(json.digest_hex).toBe('123456')
        expect(json.digest_bytes.toString('hex')).toBe(Buffer.from('123456', 'hex').toString('hex'))
        expect(json.action).toBe('transfer')
        expect(json.chain_code).toBe('action.transfer')
        expect(json.from_address.toHex()).toBe(new Address('U5dUjGzmAnajivcn4i9K4HpKvoTvBrDkna1zePXcwjdwbz1yB').toHex())
        expect(json.contract_address).toBeNull()
        expect(json.valid_from.cmp(new BN(0))).toBe(0)
        expect(json.valid_until.cmp(new BN(100))).toBe(0)
        expect(json.charge.cmp(new BN(2))).toBe(0)
        expect(json.charge_limit.cmp(new BN(5))).toBe(0)
        expect(json.transfers).toMatchObject({})
        expect(json.data).toBe('def')
    })

    test('test constructor', () => {
        const transfers: Array<string> = []
        const data = {
            'digest': '0x123456',
            'action': 'transfer',
            'chainCode': 'action.transfer',
            'from': 'U5dUjGzmAnajivcn4i9K4HpKvoTvBrDkna1zePXcwjdwbz1yB',
            'validFrom': 0,
            'validUntil': 100,
            'charge': 2,
            'chargeLimit': 5,
            'transfers': transfers,
            'signatories': ['abc'],
            'data': 'def'
        }

        const tx_contents = TxContents.from_json(data)
        expect(tx_contents.digest_hex).toBe('123456')
        expect(tx_contents.digest_bytes.toString('hex')).toBe(Buffer.from('123456', 'hex').toString('hex'))
        expect(tx_contents.action).toBe('transfer')
        expect(tx_contents.chain_code).toBe('action.transfer')
        expect(tx_contents.from_address.toHex()).toBe(new Address('U5dUjGzmAnajivcn4i9K4HpKvoTvBrDkna1zePXcwjdwbz1yB').toHex())
        expect(tx_contents.contract_address).toBeNull()
        expect(tx_contents.valid_from.cmp(new BN(0))).toBe(0)
        expect(tx_contents.valid_until.cmp(new BN(100))).toBe(0)
        expect(tx_contents.charge.cmp(new BN(2))).toBe(0)
        expect(tx_contents.charge_limit.cmp(new BN(5))).toBe(0)
        expect(tx_contents.transfers).toMatchObject({})
        expect(tx_contents.data).toBe('def')
    })

    test('test transfers', () => {
        const data = {
            'digest': '0x123456',
            'action': 'transfer',
            'chainCode': 'action.transfer',
            'from': 'U5dUjGzmAnajivcn4i9K4HpKvoTvBrDkna1zePXcwjdwbz1yB',
            'validFrom': 0,
            'validUntil': 100,
            'charge': 2,
            'chargeLimit': 5,
            'signatories': ['abc'],
            'data': 'def',
            'transfers': [
                {'to': ADDRESSES[0].toHex(), 'amount': 200},
                {'to': ADDRESSES[1].toHex(), 'amount': 300}
            ]
        }
        const tx_contents = TxContents.from_json(data)
        expect(tx_contents.transfers_to(ADDRESSES[0]).cmp(new BN(200))).toBe(0)
        expect(tx_contents.transfers_to(ADDRESSES[1]).cmp(new BN(300))).toBe(0)
        expect(tx_contents.transfers_to(ADDRESSES[2]).cmp(new BN(0))).toBe(0)
    })
})
