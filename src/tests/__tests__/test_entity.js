import {Entity} from '../../fetchai/ledger/crypto/entity'
import {createHash} from 'crypto'
import {ValidationError} from '../../fetchai/ledger/errors'

const THIRTY_TWO_BYTE_BASE64 = 'XZCS3TtyRvCwGzlvFGJhapDFCR5m/zb728SkAwbqz8M='

function _calc_digest(address_raw) {
    const hash_func = createHash('sha256')
    hash_func.update(address_raw)
    const digest = hash_func.digest()
    return digest
}

jest.mock('fs', () => {
    const MOCK_FILE_INFO = '{"privateKey": "XZCS3TtyRvCwGzlvFGJhapDFCR5m/zb728SkAwbqz8M="}'
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

    test('test to json object', () => {
        const ref = new Entity()
        const ref_key = ref.private_key()
        const base64_Key = ref_key.toString('base64')
        const jsonObj = ref._to_json_object()
        expect(jsonObj.privateKey).toEqual(base64_Key)
    })

    test('test from json object', () => {
        const obj = JSON.parse(`{"privateKey": "${THIRTY_TWO_BYTE_BASE64}"}`)
        const base64 = Buffer.from(obj.privateKey, 'base64')
        const entity = Entity._from_json_object(obj)
        const private_key_hex = entity.private_key_hex()
        expect(base64.toString('hex')).toEqual(private_key_hex)
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
        const s = `{"privateKey": "${THIRTY_TWO_BYTE_BASE64}"}`
        const obj = JSON.parse(s)
        const base64 = Buffer.from(obj.privateKey, 'base64')
        debugger;
        const entity = Entity.load('test.json')
        const private_key_hex = entity.private_key_hex()
        expect(base64.toString('hex')).toEqual(private_key_hex)
    })
})

