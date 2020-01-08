import {Entity} from '../../fetchai/ledger/crypto/entity'
import {Identity} from '../../fetchai/ledger/crypto/identity'
import {ValidationError} from '../../fetchai/ledger/errors'

describe(':Identity', () => {

    test('test construction from bytes', () => {
        const entity = new Entity()
        // create the identity from the identity (copy)
        const identity = new Identity(entity.public_key_bytes())
        expect(identity.public_key_bytes()).toEqual(entity.public_key_bytes())
    })

    test('test construction from identity', () => {
        const entity = new Entity()
        // create the identity from the identity (copy)
        const identity = new Identity(entity)
        expect(identity.public_key_bytes()).toEqual(entity.public_key_bytes())
    })

    test('test not equal', () => {
        const entity1 = new Entity()
        const entity2 = new Entity()
        expect(entity1).not.toEqual(entity2)
    })

    test('test invalid construction', () => {
        expect(() => {
            new Identity(Buffer.from(''))
        }).toThrow(ValidationError)
    })

    test('test construction from strings', () => {
        const ref = new Entity()
        const test1 = Identity.from_hex(ref.public_key_hex())
        expect(ref.public_key()).toEqual(test1.public_key())
    })
})

