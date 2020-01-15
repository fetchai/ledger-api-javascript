"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var entity_1 = require("../../fetchai/ledger/crypto/entity");
var identity_1 = require("../../fetchai/ledger/crypto/identity");
var errors_1 = require("../../fetchai/ledger/errors");
describe(':Identity', function () {
    test('test construction from bytes', function () {
        var entity = new entity_1.Entity();
        // create the identity from the identity (copy)
        var identity = new identity_1.Identity(entity.public_key_bytes());
        expect(identity.public_key_bytes()).toEqual(entity.public_key_bytes());
    });
    test('test construction from identity', function () {
        var entity = new entity_1.Entity();
        // create the identity from the identity (copy)
        var identity = new identity_1.Identity(entity);
        expect(identity.public_key_bytes()).toEqual(entity.public_key_bytes());
    });
    test('test not equal', function () {
        var entity1 = new entity_1.Entity();
        var entity2 = new entity_1.Entity();
        expect(entity1).not.toEqual(entity2);
    });
    test('test invalid construction', function () {
        expect(function () {
            new identity_1.Identity(Buffer.from(''));
        }).toThrow(errors_1.ValidationError);
    });
    test('test construction from strings', function () {
        var ref = new entity_1.Entity();
        var test1 = identity_1.Identity.from_hex(ref.public_key_hex());
        expect(ref.public_key()).toEqual(test1.public_key());
    });
});
//# sourceMappingURL=test_identity.js.map