import {TRANSFER_CONTRACT, SIMPLE_CONTRACT, NO_ANNOTATIONS, MULTIPLE_INITS} from '../../../contracts/transfer'
import {Parser} from '../../../fetchai/ledger/parser'
import {
    AUCTION_CONTRACT,
    COMPLEX_USE_STATEMENTS_CONTRACT,
    INVALID_USE_PARAMETER_TYPE,
    MISSING_PERSISTENT_STATEMENT
} from '../../../contracts'
import {Address} from '../../../fetchai/ledger/crypto/address'
import {ValidationError} from '../../../fetchai/ledger/errors'

describe(':Parser', () => {

    test('test extracting functions', () => {
        const array = Parser.get_functions(TRANSFER_CONTRACT)
        // we remove newlines from output to compare over line line
        const actual1 = array[0].replace(/\n/g, ' ')
        expect(actual1).toBe('function setup(owner : Address)   use balance_state[owner];    balance_state.set(owner, 1000000u64); endfunction')

        const actual2 = array[1].replace(/\n/g, ' ')
        expect(actual2).toBe('function transfer(from: Address, to: Address, amount: UInt64)   use balance_state[from, to];          if (balance_state.get(from, 0u64) >= amount)          balance_state.set(from, balance_state.get(from) - amount);     balance_state.set(to, balance_state.get(to, 0u64) + amount);   endif  endfunction')

        const actual3 = array[2].replace(/\n/g, ' ')
        expect(actual3).toBe('function balance(address: Address) : UInt64   use balance_state[address];    return balance_state.get(address, 0u64); endfunction')
    })

    test('test extracting functions correct number', () => {
        const array = Parser.get_functions(SIMPLE_CONTRACT)
        expect(array).toHaveLength(5)
    })

    test('test extracting functions correct number on single line', () => {
        const array = Parser.get_functions(TRANSFER_CONTRACT)
        expect(array).toHaveLength(3)
    })

    test('test get_sharded_use_names', () => {
        const array = Parser.get_sharded_use_names(TRANSFER_CONTRACT)
        expect(array).toHaveLength(1)
        expect(array[0]).toBe('balance_state')

        const array2 = Parser.get_sharded_use_names(AUCTION_CONTRACT)
        expect(array2).toHaveLength(1)
        expect(array2[0]).toBe('pendingReturns')

        const array3 = Parser.get_sharded_use_names(SIMPLE_CONTRACT)
        expect(array3).toHaveLength(0)
    })

    test('test get annotations', () => {
        // think of a second one maybe with not getting persistenet statements when nested in functions
        const actual_inits = Parser.get_annotations(TRANSFER_CONTRACT)
        const unique_init_statements_count = Object.keys(actual_inits).length
        expect(unique_init_statements_count).toBe(3)

        // should be a single  init in this contract
        expect(actual_inits['@init']).toHaveLength(1)
        expect(actual_inits['@init'][0]).toBe('setup')

        // should be a single  init in this contract
        expect(actual_inits['@action']).toHaveLength(1)
        expect(actual_inits['@action'][0]).toBe('transfer')

        // should be a single  init in this contract
        expect(actual_inits['@query']).toHaveLength(1)
        expect(actual_inits['@query'][0]).toBe('balance')
    })

    test('test get annotations on contract with no annotations', () => {
        const actual_inits = Parser.get_annotations(NO_ANNOTATIONS)
        expect(actual_inits).toMatchObject({})
    })

    test('test get annotations on contract with duplicate @init annotations', () => {
        const actual_inits = Parser.get_annotations(MULTIPLE_INITS)
        expect(actual_inits['@init']).toHaveLength(2)
        expect(actual_inits['@init'][0]).toBe('setup')
        expect(actual_inits['@init'][1]).toBe('alternative')
    })

    test('test remove comments', () => {
        const source = Parser.remove_comments(TRANSFER_CONTRACT)
        expect(source).toHaveLength(613)
    })

    test('test get resource addresses', () => {
        const address1 = new Address('nLYsNsbFGDgcGJa3e7xn2V82fnpaGZVSuJUHCkeY9Cm6SfEyG')
        const address2 = new Address('8ixTnu8sHN9VyS51GhZyxxoTLexXdZes3WkmCFoR7ufBZWnQq')
        // think of a second one maybe with not getting persistenet statements when nested in functions
        const addresses = Parser.get_resource_addresses(COMPLEX_USE_STATEMENTS_CONTRACT, 'transfer', [address1, address2, 200])
        expect(addresses).toHaveLength(4)
        console.log('addresses', addresses)
        expect(addresses[0]).toBe('balance_state.this_string')
        expect(addresses[1]).toBe('balance_state.8ixTnu8sHN9VyS51GhZyxxoTLexXdZes3WkmCFoR7ufBZWnQq')
        expect(addresses[2]).toBe('balance_state.200')
        expect(addresses[3]).toBe('test')
    })

    test('test throws resource addresses', () => {
        const address1 = new Address('nLYsNsbFGDgcGJa3e7xn2V82fnpaGZVSuJUHCkeY9Cm6SfEyG')
        const address2 = new Address('8ixTnu8sHN9VyS51GhZyxxoTLexXdZes3WkmCFoR7ufBZWnQq')
        // function name not in contract
        expect(() => {
            Parser.get_resource_addresses(COMPLEX_USE_STATEMENTS_CONTRACT, 'nonexistant_func', [address1, address2, 200])
        }).toThrow(ValidationError)
        // parameterized use statement does not have associated use statement
        expect(() => {
            Parser.get_resource_addresses(MISSING_PERSISTENT_STATEMENT, 'transfer', [address1, address2, 200])
        }).toThrow(ValidationError)
        // invalid param type in use statement (must all correlate to address or string types)
        expect(() => {
            Parser.get_resource_addresses(INVALID_USE_PARAMETER_TYPE, 'setup', [address1])
        }).toThrow(ValidationError)

    })
})
