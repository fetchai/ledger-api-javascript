import {Address, Entity} from '../../fetchai/ledger/crypto'
import {Contract} from '../../fetchai/ledger/contract'
import {RunTimeError, ValidationError} from '../../fetchai/ledger/errors'
import {calc_digest, DEFAULT_PORT, ENTITIES, LOCAL_HOST, RAND_FP} from '../utils/helpers'
import {default as btoa} from 'btoa'
import {createHash} from 'crypto'
import {MULTIPLE_INITS, SIMPLE_CONTRACT} from '../../contracts/transfer'
import {LedgerApi} from "../../fetchai/ledger/api";


const calc_address = (owner: Address, nonce: Buffer): Buffer => {
    const hash_func = createHash('sha256')
    hash_func.update(owner.toBytes())
    hash_func.update(nonce)
    return hash_func.digest()
}

jest.mock('fs', () => {
    const MOCK_FILE_INFO = '{"version":1,"owner":"2mhttHhKVRdY1n9BsFNHVJgHjGPvBmnA2FXKCPkJaC6TkXmaY9","source":"CkBpbml0CmZ1bmN0aW9uIGluaXQob3duZXI6IEFkZHJlc3MpCmVuZGZ1bmN0aW9uCgpAYWN0aW9uCmZ1bmN0aW9uIGFjdGlvbjEoKQplbmRmdW5jdGlvbgoKQGFjdGlvbgpmdW5jdGlvbiBhY3Rpb24yKCkKZW5kZnVuY3Rpb24KCkBxdWVyeQpmdW5jdGlvbiBxdWVyeTEoKQplbmRmdW5jdGlvbgoKQHF1ZXJ5CmZ1bmN0aW9uIHF1ZXJ5MigpCmVuZGZ1bmN0aW9uCg==","nonce":"pEGxX+mjz1Y="}'
    const EXPECTED_FP = '/path/to/file'
    return {
        readFileSync: (): string => {
            return MOCK_FILE_INFO
        },
        writeFileSync: (fp: string, json_string: string): void => {
            expect(fp).toBe(EXPECTED_FP)
            expect(json_string).toBe(MOCK_FILE_INFO)
        }

    }
})


describe(':Test Contract', () => {

    test('test dumps and loads', () => {
        const owner = new Entity()
        const nonce = calc_digest('random').slice(0, 8)
        const orig = new Contract(SIMPLE_CONTRACT, owner, nonce)
        const encoded = orig.dumps()
        const recreation = Contract.loads(encoded)

        expect(recreation).toBeInstanceOf(Contract)
        expect(orig.owner()).toMatchObject(recreation.owner())
        expect(orig.digest()).toMatchObject(recreation.digest())
        expect(orig.source()).toBe(recreation.source())
    })

    test('test dumps and loads without nonce', () => {
        const owner = new Entity()
        const orig = new Contract(SIMPLE_CONTRACT, owner)
        const encoded = orig.dumps()
        const recreation = Contract.loads(encoded)

        expect(recreation).toBeInstanceOf(Contract)
        expect(orig.owner()).toMatchObject(recreation.owner())
        expect(orig.digest()).toMatchObject(recreation.digest())
        expect(orig.source()).toBe(recreation.source())
    })

    test('test dump and load', () => {
        const rand_bytes = calc_digest('rand')
        const owner = new Entity(rand_bytes)
        const nonce = calc_digest('random').slice(0, 8)
        const orig = new Contract(SIMPLE_CONTRACT, owner, nonce)
        orig.dump(RAND_FP)
        const recreation = Contract.load(RAND_FP)
        expect(recreation).toBeInstanceOf(Contract)
        expect(orig.owner()).toMatchObject(recreation.owner())
        expect(orig.digest()).toMatchObject(recreation.digest())
    })

    test('test owner getter and setter', () => {
        const rand_bytes = calc_digest('rand')
        const owner = new Entity(rand_bytes)
        const nonce = calc_digest('random').slice(0, 8)
        const orig = new Contract(SIMPLE_CONTRACT, owner, nonce)
        const rand_bytes_two = calc_digest('rand2')
        const owner2 = new Entity(rand_bytes_two)
        //reset owner using setter
        const actual_owner2 = orig.owner(owner2)
        expect(actual_owner2.toBytes()).toMatchObject(new Address(owner2).toBytes())
    })

    test('test getters and setters', () => {
        const rand_bytes = calc_digest('rand')
        const owner = new Address(new Entity(rand_bytes))
        const nonce = calc_digest('random').slice(0, 8)
        const orig = new Contract(SIMPLE_CONTRACT, owner, nonce)
        //check if we can get rid of this ascii bit
        const contract_string = Buffer.from(SIMPLE_CONTRACT).toString('ascii')
        const ref_digest = new Address(calc_digest(contract_string))
        const ref_address = new Address(calc_address(owner, nonce))
        const ref_name = ref_digest.toBytes().toString('hex') + ref_address.toHex()

        expect(orig.nonce()).toBe(btoa(nonce))
        expect(orig.nonce_bytes()).toMatchObject(nonce)
        expect(orig.address().toBytes()).toMatchObject(ref_address.toBytes())
        expect(orig.name()).toBe(ref_name)
        expect(orig.encoded_source()).toBe(btoa(contract_string))
        expect(orig.digest()).toMatchObject(ref_digest)
        expect(orig.source()).toBe(contract_string)
    })



    test('test action', async () => {
         // create contract

        const owner = new Entity(Buffer.from('19c59b0a4890383eea59539173bfca5dc78e5e99037f4ad65c93d5b777b8720e', 'hex'))

        const contract = new Contract(SIMPLE_CONTRACT, owner)
        const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)

        const tok_transfer_amount = 200
        const fet_tx_fee = 160

        const address1 = new Address(owner)
        const address2 = new Address(new Entity(Buffer.from('e1b74f6357dbdd0e03ad26afaab04071964ef1c9a0f0abf10edb060e06c890a0', 'hex')))

         const action = await contract.action({api: api, name: 'transfer', fee: fet_tx_fee,  signer: [owner], args: [address1, address2, tok_transfer_amount]})
        expect(action).toBe('68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516')
    })


    test('test single entity conversion', () => {
        const entity = new Entity()
        expect(entity.public_key_hex()).toBe(Contract.convert_to_single_entity(entity).public_key_hex())
    })


    test('test single array conversion', () => {
        const entity = new Entity()
        expect(entity.public_key_hex()).toBe(Contract.convert_to_single_entity([entity]).public_key_hex())
    })


    test('test error multiple item array conversion throws validation error', () => {
        const entity = new Entity()
        expect(() => {
            Contract.convert_to_single_entity([entity, entity])
        }).toThrow(ValidationError)
    })

})
