"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transfer_1 = require("../../../contracts/transfer");
var parser_1 = require("../../../fetchai/ledger/parser");
var contracts_1 = require("../../../contracts");
var address_1 = require("../../../fetchai/ledger/crypto/address");
var errors_1 = require("../../../fetchai/ledger/errors");
describe(':Parser', function () {
    test('test extracting functions', function () {
        var array = parser_1.Parser.get_functions(transfer_1.TRANSFER_CONTRACT);
        // we remove newlines from output to compare over line line
        var actual1 = array[0].replace(/\n/g, ' ');
        expect(actual1).toBe('function setup(owner : Address)   use balance_state[owner];    balance_state.set(owner, 1000000u64); endfunction');
        var actual2 = array[1].replace(/\n/g, ' ');
        expect(actual2).toBe('function transfer(from: Address, to: Address, amount: UInt64)   use balance_state[from, to];          if (balance_state.get(from, 0u64) >= amount)          balance_state.set(from, balance_state.get(from) - amount);     balance_state.set(to, balance_state.get(to, 0u64) + amount);   endif  endfunction');
        var actual3 = array[2].replace(/\n/g, ' ');
        expect(actual3).toBe('function balance(address: Address) : UInt64   use balance_state[address];    return balance_state.get(address, 0u64); endfunction');
    });
    test('test extracting functions correct number', function () {
        var array = parser_1.Parser.get_functions(transfer_1.SIMPLE_CONTRACT);
        expect(array).toHaveLength(5);
    });
    test('test extracting functions correct number on single line', function () {
        var array = parser_1.Parser.get_functions(transfer_1.TRANSFER_CONTRACT);
        expect(array).toHaveLength(3);
    });
    test('test get_sharded_use_names', function () {
        var array = parser_1.Parser.get_sharded_use_names(transfer_1.TRANSFER_CONTRACT);
        expect(array).toHaveLength(1);
        expect(array[0]).toBe('balance_state');
        var array2 = parser_1.Parser.get_sharded_use_names(contracts_1.AUCTION_CONTRACT);
        expect(array2).toHaveLength(1);
        expect(array2[0]).toBe('pendingReturns');
        var array3 = parser_1.Parser.get_sharded_use_names(transfer_1.SIMPLE_CONTRACT);
        expect(array3).toHaveLength(0);
    });
    test('test get annotations', function () {
        // think of a second one maybe with not getting persistenet statements when nested in functions
        var actual_inits = parser_1.Parser.get_annotations(transfer_1.TRANSFER_CONTRACT);
        var unique_init_statements_count = Object.keys(actual_inits).length;
        expect(unique_init_statements_count).toBe(3);
        // should be a single  init in this contract
        expect(actual_inits['@init']).toHaveLength(1);
        expect(actual_inits['@init'][0]).toBe('setup');
        // should be a single  init in this contract
        expect(actual_inits['@action']).toHaveLength(1);
        expect(actual_inits['@action'][0]).toBe('transfer');
        // should be a single  init in this contract
        expect(actual_inits['@query']).toHaveLength(1);
        expect(actual_inits['@query'][0]).toBe('balance');
    });
    test('test get annotations on contract with no annotations', function () {
        var actual_inits = parser_1.Parser.get_annotations(transfer_1.NO_ANNOTATIONS);
        expect(actual_inits).toMatchObject({});
    });
    test('test get annotations on contract with duplicate @init annotations', function () {
        var actual_inits = parser_1.Parser.get_annotations(transfer_1.MULTIPLE_INITS);
        expect(actual_inits['@init']).toHaveLength(2);
        expect(actual_inits['@init'][0]).toBe('setup');
        expect(actual_inits['@init'][1]).toBe('alternative');
    });
    test('test remove comments', function () {
        var source = parser_1.Parser.remove_comments(transfer_1.TRANSFER_CONTRACT);
        expect(source).toHaveLength(613);
    });
    test('test get resource addresses', function () {
        var address1 = new address_1.Address('nLYsNsbFGDgcGJa3e7xn2V82fnpaGZVSuJUHCkeY9Cm6SfEyG');
        var address2 = new address_1.Address('8ixTnu8sHN9VyS51GhZyxxoTLexXdZes3WkmCFoR7ufBZWnQq');
        // think of a second one maybe with not getting persistenet statements when nested in functions
        var addresses = parser_1.Parser.get_resource_addresses(contracts_1.COMPLEX_USE_STATEMENTS_CONTRACT, 'transfer', [address1, address2, 200]);
        expect(addresses).toHaveLength(4);
        console.log('addresses', addresses);
        expect(addresses[0]).toBe('balance_state.this_string');
        expect(addresses[1]).toBe('balance_state.8ixTnu8sHN9VyS51GhZyxxoTLexXdZes3WkmCFoR7ufBZWnQq');
        expect(addresses[2]).toBe('balance_state.200');
        expect(addresses[3]).toBe('test');
    });
    test('test throws resource addresses', function () {
        var address1 = new address_1.Address('nLYsNsbFGDgcGJa3e7xn2V82fnpaGZVSuJUHCkeY9Cm6SfEyG');
        var address2 = new address_1.Address('8ixTnu8sHN9VyS51GhZyxxoTLexXdZes3WkmCFoR7ufBZWnQq');
        // function name not in contract
        expect(function () {
            parser_1.Parser.get_resource_addresses(contracts_1.COMPLEX_USE_STATEMENTS_CONTRACT, 'nonexistant_func', [address1, address2, 200]);
        }).toThrow(errors_1.ValidationError);
        // parameterized use statement does not have associated use statement
        expect(function () {
            parser_1.Parser.get_resource_addresses(contracts_1.MISSING_PERSISTENT_STATEMENT, 'transfer', [address1, address2, 200]);
        }).toThrow(errors_1.ValidationError);
        // invalid param type in use statement (must all correlate to address or string types)
        expect(function () {
            parser_1.Parser.get_resource_addresses(contracts_1.INVALID_USE_PARAMETER_TYPE, 'setup', [address1]);
        }).toThrow(errors_1.ValidationError);
    });
});
//# sourceMappingURL=test_parser.js.map