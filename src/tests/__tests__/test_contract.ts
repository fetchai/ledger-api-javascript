import {Address, Entity} from '../../fetchai/ledger/crypto'
import {Contract} from '../../fetchai/ledger/contract'
import {RunTimeError, ValidationError} from '../../fetchai/ledger/errors'
import {calc_digest, RAND_FP} from '../utils/helpers'
import {default as btoa} from 'btoa'
import {createHash} from 'crypto'
import {MULTIPLE_INITS, SIMPLE_CONTRACT} from '../../contracts/transfer'

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



    test.skip('test action', () => {
         // create contract
        const owner = new Entity()
        const contract = new Contract(SIMPLE_CONTRACT, owner)



    })



    test.skip('test create', () => {

        // create contract
        // const contract = new Contract(SIMPLE_CONTRACT)
        // const owner = new Entity()

        // Mock api for providing number of lanes and receiving create call
        //              const HOST = '127.0.0.1';
        // const PORT = 8000;
        //         const api = new LedgerApi(HOST, PORT)
        // lane_number = 2
        // api.server.num_lanes.side_effect = [lane_number]
        // Mock shard mask static method
        // dummy_shard_mask = mock.Mock()
        // mock_shard_mask.side_effect = [dummy_shard_mask]
        //   contract.create(api, owner, 1000)
        // Check shard mask gen called with contract digest address
        //  mock_shard_mask.assert_called_once_with(
        //    ['fetch.contract.state.{}'.format(contract.digest.to_hex())], lane_number)
        // Check api create method called
        //   api.contracts.create.assert_called_once_with(owner, contract, 1000, shard_mask=dummy_shard_mask)
        // create the contract
        // const orig = new Contract(SIMPLE_CONTRACT)

        // encode the contract
        //   const encoded = orig.dumps()
        // re-create the contract
        //   const recreation = Contract.loads(encoded)
        // checks
        //  expect( recreation ).toBeInstanceOf(Contract)
        //    expect(orig.owner()).toMatchObject(recreation.owner())
        // expect(orig.digest()).toMatchObject(recreation.digest())
        // expect(orig.source()).toMatchObject(recreation.source())
    })

    //TODO remove skip when we have etchparser support
    test.skip('test init', () => {
        const owner = new Entity()
        expect(() => {
            new Contract(MULTIPLE_INITS, owner)
        }).toThrow(RunTimeError)


        // Test successful creation without init (to support local etch testing)
        // expect(() => {
        //    let contract = new Contract(MULTIPLE_INITS, owner)
        // }).toThrow(RunTimeError)
        // create ledgerAPI instance without calling its es6 constructor
        const api = Object.create(Contract.prototype)

        expect(() => {
            api.create(api, owner, 100)
        }).toThrow(RunTimeError)

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
