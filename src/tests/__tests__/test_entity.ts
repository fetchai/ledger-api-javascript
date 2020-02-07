import {Entity} from '../../fetchai/ledger/crypto/entity'
import {ValidationError} from '../../fetchai/ledger/errors'
import {calc_digest, PASSWORD} from '../utils/helpers'
import fs from 'fs'
import mock from 'mock-fs'
import sinon from 'sinon'

mock({
    'path/to/some.png': '{"key_length":32,"init_vector":"LAunDQSK0yh1ixYStfBLdw==","password_salt":"jwhnMpDMp3kW/og8pZbiwA==","privateKey":"2Vdl4fr8gLlnuHEgwZrmeOsp4y6QLmHRlBeEj6qXPd0="}',
})

describe(':Entity', () => {

    let writeFileSync: any

    beforeEach(() => {
        writeFileSync = sinon.stub(fs, 'writeFileSync').returns({})
    })

    afterEach(() => {
        writeFileSync.restore()
    })


    test('test generation', () => {
        const reference = new Entity()
        const other = new Entity(reference.private_key())
        expect(reference.private_key()).toEqual(other.private_key())
        expect(reference.private_key_hex()).toEqual(other.private_key_hex())
        expect(reference.public_key()).toEqual(other.public_key())
        expect(reference.public_key_hex()).toEqual(other.public_key_hex())
    })


    test('test signing verifying cycle', () => {
        const message = Buffer.from('rand')
        const entity = new Entity()
        // sign the payload
        const sign_obj = entity.sign(message)
        // verify the payload
        const verified = entity.verify(message, sign_obj.signature)
        expect(verified).toBe(true)
        // create bad 64 byte sig
        const invalid_signature = Buffer.concat([message, message])
        const bad_verification = entity.verify(message, invalid_signature)
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
        const digest = calc_digest(Buffer.from('rand'))
        const entity = new Entity()
        const sigObj = entity.sign(digest)
        const signature_hex = entity.signature_hex(sigObj)
        expect(signature_hex).toEqual(sigObj.signature.toString('hex'))
    })

    test('test loads', async () => {
        const s = '{"key_length": 32, "init_vector": "/bfsgykBD4i6Mjkg5aAQfg==", "password_salt": "vnDS6A9WopD3TpzrMbLJKg==", "privateKey": "TObHSc42ev8idRQbd7Is+BSZG9aQk2o8plOff6t3+WM="}'
        const ref = Entity.from_hex('84cd8d1df47f2be283107cc177003e0b062ee35be50087a66268417629edf730')
        const entity = await Entity.loads(s, PASSWORD)
        const private_key_hex = entity.private_key_hex()
        expect(ref.private_key_hex()).toEqual(private_key_hex)
    })

    test('test load', async () => {
        const entity = await Entity.load('path/to/some.png', PASSWORD)
        expect(entity.private_key_hex()).toEqual('47580e6993d7ae66c6fe13d435a2f960ab7e2551853a1be312fef14261111479')
        const ref = new Entity(entity.privKey)
        expect(entity.private_key_hex()).toEqual(ref.private_key_hex())
    })

    test('test prompt dumps', async () => {
        const entity = Entity.from_hex('84cd8d1df47f2be283107cc177003e0b062ee35be50087a66268417629edf730')

        await entity.prompt_dump('path/to/some.png', PASSWORD)
        expect(writeFileSync.calledOnce).toBe(true)
        expect(writeFileSync.getCall(0).args[0]).toEqual('path/to/some.png')
        const json_obj = JSON.parse(writeFileSync.getCall(0).args[1])
        expect(json_obj.key_length).toEqual(32)
        expect(json_obj).toHaveProperty('init_vector')
        expect(json_obj).toHaveProperty('password_salt')
        expect(json_obj).toHaveProperty('privateKey')
    })

    test('test validation of strong password', () => {
        const valid = Entity.strong_password(PASSWORD)
        expect(valid).toBe(true)
        const invalid = Entity.strong_password('weakpassword')
        expect(invalid).toBe(false)
    })
})
