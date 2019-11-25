import {ADDRESSES, DEFAULT_PORT, ENTITIES, LOCAL_HOST} from '../../utils/helpers'
import {TransactionApi, TxContents} from '../../../fetchai/ledger/api/tx'
import {Address} from '../../../fetchai/ledger/crypto/address'
import {BN} from 'bn.js'
import {TokenApi} from '../../../fetchai/ledger/api'

describe(':TXContentsTest', () => {
    it('test contents', async () => {
        const api = new TokenApi(LOCAL_HOST, DEFAULT_PORT)
        const wealth = await api.wealth(ENTITIES[0], 1000)
        const TApi = new TransactionApi(LOCAL_HOST, DEFAULT_PORT)
        const data = await TApi.contents(wealth.txs[0])
        const a = TxContents.from_json(data)
        expect(a.digest_hex).toBe('123456')
        expect(a.digest_bytes.toString('hex')).toBe(Buffer.from('123456', 'hex').toString('hex'))
        expect(a.action).toBe('transfer')
        expect(a.chain_code).toBe('action.transfer')
        expect(a.from_address.toHex()).toBe(new Address('U5dUjGzmAnajivcn4i9K4HpKvoTvBrDkna1zePXcwjdwbz1yB').toHex())
        expect(a.contract_digest).toBeNull()
        expect(a.contract_address).toBeNull()
        expect(a.valid_from).toBe(0)
        expect(a.valid_until).toBe(100)
        expect(a.charge).toBe(2)
        expect(a.charge_limit).toBe(5)
        expect(a.transfers).toMatchObject({})
        expect(a.data).toBe('def')
    })

    it('test constructor', () => {
        const data = {
            'digest': '0x123456',
            'action': 'transfer',
            'chainCode': 'action.transfer',
            'from': 'U5dUjGzmAnajivcn4i9K4HpKvoTvBrDkna1zePXcwjdwbz1yB',
            'validFrom': 0,
            'validUntil': 100,
            'charge': 2,
            'chargeLimit': 5,
            'transfers': [],
            'signatories': ['abc'],
            'data': 'def'
        }

        const tx_contents = TxContents.from_json(data)
        expect(tx_contents.digest_hex).toBe('123456')
        expect(tx_contents.digest_bytes.toString('hex')).toBe(Buffer.from('123456', 'hex').toString('hex'))
        expect(tx_contents.action).toBe('transfer')
        expect(tx_contents.chain_code).toBe('action.transfer')
        expect(tx_contents.from_address.toHex()).toBe(new Address('U5dUjGzmAnajivcn4i9K4HpKvoTvBrDkna1zePXcwjdwbz1yB').toHex())
        expect(tx_contents.contract_digest).toBeNull()
        expect(tx_contents.contract_address).toBeNull()
        expect(tx_contents.valid_from).toBe(0)
        expect(tx_contents.valid_until).toBe(100)
        expect(tx_contents.charge).toBe(2)
        expect(tx_contents.charge_limit).toBe(5)
        expect(tx_contents.transfers).toMatchObject({})
        expect(tx_contents.data).toBe('def')
    })

    it('test transfers', () => {
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
        expect(tx_contents.transfers_to(ADDRESSES[0].toHex()).cmp(new BN(200))).toBe(0)
        expect(tx_contents.transfers_to(ADDRESSES[1].toHex()).cmp(new BN(300))).toBe(0)
        expect(tx_contents.transfers_to(ADDRESSES[2].toHex()).cmp(new BN(0))).toBe(0)
    })
})
