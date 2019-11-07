import {Entity} from "../../fetchai/ledger/crypto";
import {Contract} from "../../fetchai/ledger/contract";
import {LedgerApi} from "../../fetchai/ledger/api";
import {RunTimeError} from "../../fetchai/ledger/errors";

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



describe(':Test Contract', () => {
    test('test dumps and loads', () => {
         // create the contract
       const owner = new Entity();
       const orig = new Contract(CONTRACT_TEXT)
        orig.owner(owner);
       // encode the contract
       const encoded = orig.dumps();
        // re-create the contract as recreation
       const recreation = Contract.loads(encoded)
       expect( recreation ).toBeInstanceOf(Contract)
       expect(orig.owner()).toMatchObject(recreation.owner())
       expect(orig.digest()).toMatchObject(recreation.digest())
       expect(orig.source()).toMatchObject(recreation.source())
    })

     test('test dumps and loads without owner', () => {
         // create the contract
       const orig = new Contract(CONTRACT_TEXT)
        // encode the contract
        const encoded = orig.dumps()
        // re-create the contract
        const recreation = Contract.loads(encoded)
        // checks
         expect( recreation ).toBeInstanceOf(Contract)
       expect(orig.owner()).toMatchObject(recreation.owner())
       expect(orig.digest()).toMatchObject(recreation.digest())
       expect(orig.source()).toMatchObject(recreation.source())
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


        test.skip('test init', () => {
            // Test rejection of contract with multiple init statements
        expect(() => {
            new Contract(MULTIPLE_INITS)
        }).toThrow(RunTimeError)

            let contract;
            // Test successful creation without init (to support local etch testing)
         expect(() => {
            contract = new Contract(MULTIPLE_INITS)
        }).not.toThrow(RunTimeError)

        // Test creation failure without init
        const owner = new Entity()
        // create ledgerAPI instance without calling its es6 constructor
        const api = Object.create(LedgerApi.prototype)

           expect(() => {
             contract.create(api, owner, 100)
        }).toThrow(RunTimeError)

    })

})
