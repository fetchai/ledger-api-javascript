import {Entity} from '../../fetchai/ledger/crypto/entity'
import {Identity} from '../../fetchai/ledger/crypto/identity'
import {ValidationError} from '../../fetchai/ledger/errors'

describe(':Identity', () => {

    it('test construction from bytes', () => {
        const entity = new Entity()
        // create the identity from the identity (copy)
        const identity = new Identity(entity.public_key_bytes())
        expect(identity.public_key_bytes()).toEqual(entity.public_key_bytes())
    })

    it('test construction from identity', () => {
        const entity = new Entity()
        // create the identity from the identity (copy)
        const identity = new Identity(entity)
        expect(identity.public_key_bytes()).toEqual(entity.public_key_bytes())
    })

    it('test not equal', () => {
        const entity1 = new Entity()
        const entity2 = new Entity()
        expect(entity1).not.toEqual(entity2)
    })

    it('test invalid construction', () => {
        expect(() => {
            new Identity('')
        }).toThrowError(ValidationError)
    })

    it('test construction from strings', () => {
        const ref = new Entity()
        const test1 = Identity.from_hex(ref.public_key_hex())
        expect(ref.public_key()).toEqual(test1.public_key())
    })
})

