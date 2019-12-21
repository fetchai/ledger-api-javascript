import { Entity } from '../../fetchai/ledger/crypto/entity'
import { createHash } from 'crypto'
import { ValidationError } from '../../fetchai/ledger/errors'

const THIRTY_TWO_BYTE_BASE64 = 'XZCS3TtyRvCwGzlvFGJhapDFCR5m/zb728SkAwbqz8M='

function _calc_digest(address_raw) {
    const hash_func = createHash('sha256')
    hash_func.update(address_raw)
    const digest = hash_func.digest()
    return digest
}

jest.mock('fs', () => {
    const MOCK_FILE_INFO =
        '{"key_length":32,"init_vector":"A6iVObnjv/A5ApVyvclV4A==","password_salt":"4ODfF30sz2NIb67ZNtjS2Q==","privateKey":"zBd+gM3SLgLhqxtSj80jQzbGb4W4Af/BRr/XcboKw2o="}'
    return {
        readFileSync: () => {
            return MOCK_FILE_INFO
        }
    }
})

describe(':Entity', () => {
    test('test generation', () => {
        const reference = new Entity()
        const other = new Entity(reference.private_key())
        expect(reference.private_key()).toEqual(other.private_key())
        expect(reference.private_key_hex()).toEqual(other.private_key_hex())
        expect(reference.public_key()).toEqual(other.public_key())
        expect(reference.public_key_hex()).toEqual(other.public_key_hex())
    })

    test('test signing verifying cycle', () => {
        const digest = _calc_digest(Buffer.from('rand'))
        const entity = new Entity()
        // sign the payload
        const sign_obj = entity.sign(digest)
        // verify the payload
        const verified = entity.verify(digest, sign_obj.signature)
        expect(verified).toBe(true)
        // create bad 64 byte sig
        const invalid_signature = Buffer.concat([digest, digest])
        const bad_verification = entity.verify(digest, invalid_signature)
        expect(bad_verification).toBe(false)
    })

    test('test construction from base64', () => {
        const ref = new Entity()
        const ref_key = ref.private_key()
        const base64_data = ref_key.toString('base64')
        const other = Entity.from_base64(base64_data)
        expect(other.private_key()).toMatchObject(ref.private_key())
    })

    test('test invalid_construction', () => {
        expect(() => {
            // buffer of wrong length
            new Entity(Buffer.from('123'))
        }).toThrow(ValidationError)
    })

    test('test signature to hex', () => {
        const digest = _calc_digest(Buffer.from('rand'))
        const entity = new Entity()
        const sigObj = entity.sign(digest)
        const signature_hex = entity.signature_hex(sigObj)
        expect(signature_hex).toEqual(sigObj.signature.toString('hex'))
    })

    test('test loads', () => {
        const s = `{"privateKey": "${THIRTY_TWO_BYTE_BASE64}"}`
        const obj = JSON.parse(s)
        const base64 = Buffer.from(obj.privateKey, 'base64')
        const entity = Entity.loads(s)
        const private_key_hex = entity.private_key_hex()
        expect(base64.toString('hex')).toEqual(private_key_hex)
    })

    test('test load', () => {
        const entity = Entity.load('src/tests/__tests__/utils/private_key.txt', '1234567890qwertyuiopQWERTYUIOP!@#$')
        expect(entity.private_key_hex()).toEqual('49c361daee7b3b94ad5c367d6a4ab9d95d62098289a4e5e67146f64074442190')
        const ref = new Entity(entity.privKey)
        expect(entity.private_key_hex()).toEqual(ref.private_key_hex())
    })

    test('test prompt dumps', () => {
        const entity = new Entity()
        const data = JSON.parse(entity.prompt_dump('src/tests/__tests__/utils/private_key.txt', '1234567890qwertyuiopQWERTYUIOP!@#$'))
        expect(data).toHaveProperty('key_length')
        expect(data).toHaveProperty('init_vector')
        expect(data).toHaveProperty('password_salt')
        expect(data).toHaveProperty('privateKey')
        expect(data.key_length).toEqual(32)
        expect(data.privateKey).toHaveLength(44)
    })

    test('test validation of strong password', () => {
        let data = Entity._strong_password('1234567890qwertyuiopQWERTYUIOP!@#$')
        expect(data).toBe(true)
        data = Entity._strong_password('1234567890')
        expect(data).toBe(false)
    })
})
