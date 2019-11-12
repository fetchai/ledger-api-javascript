import {Address, Entity} from "../../fetchai/ledger/crypto";
import {Contract} from "../../fetchai/ledger/contract";
import {RunTimeError} from "../../fetchai/ledger/errors";
import {calc_digest, RAND_FP} from "../utils/helpers";
import {default as btoa} from "btoa";
import {createHash} from 'crypto'


const CONTRACT_TEXT = `
@init
function init(owner: Address)
endfunction

@action
function action1()
endfunction

@action
function action2()
endfunction

@query
function query1()
endfunction

@query
function query2()
endfunction
`

const MULTIPLE_INITS=`
@init
function setup(owner: Address)
endfunction

@init
function alternative(owner: Address)
endfunction
`

const NO_INIT=`
@action
function action1()
endfunction
`

const calc_address = (owner, nonce) => {
    const hash_func = createHash('sha256')
    hash_func.update(owner.toBytes(), 'utf')
    hash_func.update(nonce, 'utf')
    return hash_func.digest()
}

const _compute_digest = (source) => {
    const hash_func = createHash('sha256')
    hash_func.update(source, 'ascii')
    const d = hash_func.digest()
    return new Address(d)
}

jest.mock('fs', () => {
    const MOCK_FILE_INFO = '{"version":1,"owner":"2mhttHhKVRdY1n9BsFNHVJgHjGPvBmnA2FXKCPkJaC6TkXmaY9","source":"CkBpbml0CmZ1bmN0aW9uIGluaXQob3duZXI6IEFkZHJlc3MpCmVuZGZ1bmN0aW9uCgpAYWN0aW9uCmZ1bmN0aW9uIGFjdGlvbjEoKQplbmRmdW5jdGlvbgoKQGFjdGlvbgpmdW5jdGlvbiBhY3Rpb24yKCkKZW5kZnVuY3Rpb24KCkBxdWVyeQpmdW5jdGlvbiBxdWVyeTEoKQplbmRmdW5jdGlvbgoKQHF1ZXJ5CmZ1bmN0aW9uIHF1ZXJ5MigpCmVuZGZ1bmN0aW9uCg==","nonce":"pEGxX+mjz1Y="}'
    const EXPECTED_FP = "/path/to/file";
    return {
        readFileSync: () => {
            return MOCK_FILE_INFO
        },
        writeFileSync: (fp, json_string) => {
            expect(fp).toBe(EXPECTED_FP)
            expect(json_string).toBe(MOCK_FILE_INFO)
        }

    }
})


describe(':Test Contract', () => {

    /*
    test query balance
    test transfer action
     */


    test('test dumps and loads', () => {
       const owner = new Entity();
        const nonce = calc_digest("random").slice(0, 8);
        const orig = new Contract(CONTRACT_TEXT, owner, nonce)
       // encode the contract
       const encoded = orig.dumps();
        // re-create the contract as recreation
       const recreation = Contract.loads(encoded)
       expect( recreation ).toBeInstanceOf(Contract)
       expect(orig.owner()).toMatchObject(recreation.owner())
       expect(orig.digest()).toMatchObject(recreation.digest())
        expect(orig.source()).toBe(recreation.source())
    })

    test('test dumps and loads without nonce', () => {
        const owner = new Entity();
        const orig = new Contract(CONTRACT_TEXT, owner)
        // encode the contract
        const encoded = orig.dumps()
        // re-create the contract
        const recreation = Contract.loads(encoded)

        // expect(fs.writeFileSync).toBeCalledWith('parameters');

        expect(recreation).toBeInstanceOf(Contract)
        expect(orig.owner()).toMatchObject(recreation.owner())
        expect(orig.digest()).toMatchObject(recreation.digest())
        expect(orig.source()).toBe(recreation.source())
    })

    test('test dump and load', () => {
        const rand_bytes = calc_digest('rand');
        const owner = new Entity(rand_bytes);
        const nonce = calc_digest("random").slice(0, 8);
        const orig = new Contract(CONTRACT_TEXT, owner, nonce)
        const encoded = orig.dump(RAND_FP)
        const recreation = Contract.load(encoded)
         expect( recreation ).toBeInstanceOf(Contract)
       expect(orig.owner()).toMatchObject(recreation.owner())
       expect(orig.digest()).toMatchObject(recreation.digest())
    })

    test('test owner getter and setter', () => {
        const rand_bytes = calc_digest('rand');
        const owner = new Entity(rand_bytes);
        const nonce = calc_digest("random").slice(0, 8);
        const orig = new Contract(CONTRACT_TEXT, owner, nonce)

        const rand_bytes_two = calc_digest('rand2');
        const owner2 = new Entity(rand_bytes_two);
        //reset owner using setter
        const actual_owner2 = orig.owner(owner2);
        expect(actual_owner2.toBytes()).toMatchObject(new Address(owner2).toBytes())
    })

    test('test getters and setters', () => {
        const rand_bytes = calc_digest('rand');
        const owner = new Address(new Entity(rand_bytes));
        const nonce = calc_digest("random").slice(0, 8);
        const orig = new Contract(CONTRACT_TEXT, owner, nonce);
        const contract_string = Buffer.from(CONTRACT_TEXT).toString('ascii');

        expect(orig.nonce()).toBe(btoa(nonce))
        expect(orig.nonce_bytes()).toMatchObject(nonce)

        const ref_digest = _compute_digest(contract_string)
        const ref_address = new Address(calc_address(owner, nonce))

        expect(orig.address().toBytes()).toMatchObject(ref_address.toBytes())

        const ref_name = ref_digest.toBytes().toString('hex') + ref_address.toHex();
        expect(orig.name()).toBe(ref_name)
        // is that needed?? if passse try it without this

        expect(orig.encoded_source()).toBe(btoa(contract_string))
        expect(orig.digest()).toMatchObject(ref_digest)

        expect(orig.source()).toBe(contract_string)
    })



         test.skip('test create', () => {

        // create contract
        const contract = new Contract(CONTRACT_TEXT)
        const owner = new Entity()

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
      // const orig = new Contract(CONTRACT_TEXT)

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

    //REMOVE WHEN ETCHPARSER SUPPORT ADDED
    // THIS APPLIES TOA LL TESTS WITHIN
        test.skip('test init', () => {
            const owner = new Entity()
        expect(() => {
            new Contract(MULTIPLE_INITS, owner)
        }).toThrow(RunTimeError)

            let contract;
            // Test successful creation without init (to support local etch testing)
         expect(() => {
             contract = new Contract(MULTIPLE_INITS, owner)
         }).toThrow(RunTimeError)
        // create ledgerAPI instance without calling its es6 constructor
            const api = Object.create(Contract.prototype)

           expect(() => {
               api.create(api, owner, 100)
        }).toThrow(RunTimeError)

    })

})
