"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("../../fetchai/ledger/crypto");
var contract_1 = require("../../fetchai/ledger/contract");
var errors_1 = require("../../fetchai/ledger/errors");
var helpers_1 = require("../utils/helpers");
var btoa_1 = __importDefault(require("btoa"));
var crypto_2 = require("crypto");
var transfer_1 = require("../../contracts/transfer");
var calc_address = function (owner, nonce) {
    var hash_func = crypto_2.createHash('sha256');
    hash_func.update(owner.toBytes(), 'utf8');
    hash_func.update(nonce, 'utf8');
    return hash_func.digest();
};
jest.mock('fs', function () {
    var MOCK_FILE_INFO = '{"version":1,"owner":"2mhttHhKVRdY1n9BsFNHVJgHjGPvBmnA2FXKCPkJaC6TkXmaY9","source":"CkBpbml0CmZ1bmN0aW9uIGluaXQob3duZXI6IEFkZHJlc3MpCmVuZGZ1bmN0aW9uCgpAYWN0aW9uCmZ1bmN0aW9uIGFjdGlvbjEoKQplbmRmdW5jdGlvbgoKQGFjdGlvbgpmdW5jdGlvbiBhY3Rpb24yKCkKZW5kZnVuY3Rpb24KCkBxdWVyeQpmdW5jdGlvbiBxdWVyeTEoKQplbmRmdW5jdGlvbgoKQHF1ZXJ5CmZ1bmN0aW9uIHF1ZXJ5MigpCmVuZGZ1bmN0aW9uCg==","nonce":"pEGxX+mjz1Y="}';
    var EXPECTED_FP = '/path/to/file';
    return {
        readFileSync: function () {
            return MOCK_FILE_INFO;
        },
        writeFileSync: function (fp, json_string) {
            expect(fp).toBe(EXPECTED_FP);
            expect(json_string).toBe(MOCK_FILE_INFO);
        }
    };
});
describe(':Test Contract', function () {
    test('test dumps and loads', function () {
        var owner = new crypto_1.Entity();
        var nonce = helpers_1.calc_digest('random').slice(0, 8);
        var orig = new contract_1.Contract(transfer_1.SIMPLE_CONTRACT, owner, nonce);
        var encoded = orig.dumps();
        var recreation = contract_1.Contract.loads(encoded);
        expect(recreation).toBeInstanceOf(contract_1.Contract);
        expect(orig.owner()).toMatchObject(recreation.owner());
        expect(orig.digest()).toMatchObject(recreation.digest());
        expect(orig.source()).toBe(recreation.source());
    });
    test('test dumps and loads without nonce', function () {
        var owner = new crypto_1.Entity();
        var orig = new contract_1.Contract(transfer_1.SIMPLE_CONTRACT, owner);
        var encoded = orig.dumps();
        var recreation = contract_1.Contract.loads(encoded);
        expect(recreation).toBeInstanceOf(contract_1.Contract);
        expect(orig.owner()).toMatchObject(recreation.owner());
        expect(orig.digest()).toMatchObject(recreation.digest());
        expect(orig.source()).toBe(recreation.source());
    });
    test('test dump and load', function () {
        var rand_bytes = helpers_1.calc_digest('rand');
        var owner = new crypto_1.Entity(rand_bytes);
        var nonce = helpers_1.calc_digest('random').slice(0, 8);
        var orig = new contract_1.Contract(transfer_1.SIMPLE_CONTRACT, owner, nonce);
        var encoded = orig.dump(helpers_1.RAND_FP);
        var recreation = contract_1.Contract.load(helpers_1.RAND_FP);
        expect(recreation).toBeInstanceOf(contract_1.Contract);
        expect(orig.owner()).toMatchObject(recreation.owner());
        expect(orig.digest()).toMatchObject(recreation.digest());
    });
    test('test owner getter and setter', function () {
        var rand_bytes = helpers_1.calc_digest('rand');
        var owner = new crypto_1.Entity(rand_bytes);
        var nonce = helpers_1.calc_digest('random').slice(0, 8);
        var orig = new contract_1.Contract(transfer_1.SIMPLE_CONTRACT, owner, nonce);
        var rand_bytes_two = helpers_1.calc_digest('rand2');
        var owner2 = new crypto_1.Entity(rand_bytes_two);
        //reset owner using setter
        var actual_owner2 = orig.owner(owner2);
        expect(actual_owner2.toBytes()).toMatchObject(new crypto_1.Address(owner2).toBytes());
    });
    test('test getters and setters', function () {
        var rand_bytes = helpers_1.calc_digest('rand');
        var owner = new crypto_1.Address(new crypto_1.Entity(rand_bytes));
        var nonce = helpers_1.calc_digest('random').slice(0, 8);
        var orig = new contract_1.Contract(transfer_1.SIMPLE_CONTRACT, owner, nonce);
        //check if we can get rid of this ascii bit
        var contract_string = Buffer.from(transfer_1.SIMPLE_CONTRACT).toString('ascii');
        var ref_digest = new crypto_1.Address(helpers_1.calc_digest(contract_string));
        var ref_address = new crypto_1.Address(calc_address(owner, nonce));
        var ref_name = ref_digest.toBytes().toString('hex') + ref_address.toHex();
        expect(orig.nonce()).toBe(btoa_1.default(nonce));
        expect(orig.nonce_bytes()).toMatchObject(nonce);
        expect(orig.address().toBytes()).toMatchObject(ref_address.toBytes());
        expect(orig.name()).toBe(ref_name);
        expect(orig.encoded_source()).toBe(btoa_1.default(contract_string));
        expect(orig.digest()).toMatchObject(ref_digest);
        expect(orig.source()).toBe(contract_string);
    });
    test.skip('test create', function () {
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
    });
    //TODO remove skip when we have etchparser support
    test.skip('test init', function () {
        var owner = new crypto_1.Entity();
        expect(function () {
            new contract_1.Contract(transfer_1.MULTIPLE_INITS, owner);
        }).toThrow(errors_1.RunTimeError);
        // Test successful creation without init (to support local etch testing)
        // expect(() => {
        //    let contract = new Contract(MULTIPLE_INITS, owner)
        // }).toThrow(RunTimeError)
        // create ledgerAPI instance without calling its es6 constructor
        var api = Object.create(contract_1.Contract.prototype);
        expect(function () {
            api.create(api, owner, 100);
        }).toThrow(errors_1.RunTimeError);
    });
});
//# sourceMappingURL=test_contract.js.map