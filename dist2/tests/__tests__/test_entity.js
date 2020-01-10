"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var entity_1 = require("../../fetchai/ledger/crypto/entity");
var errors_1 = require("../../fetchai/ledger/errors");
var helpers_1 = require("../utils/helpers");
var fs_1 = __importDefault(require("fs"));
var mock = require('mock-fs');
var sinon = require('sinon');
mock({
    'path/to/some.png': '{"key_length":32,"init_vector":"LAunDQSK0yh1ixYStfBLdw==","password_salt":"jwhnMpDMp3kW/og8pZbiwA==","privateKey":"2Vdl4fr8gLlnuHEgwZrmeOsp4y6QLmHRlBeEj6qXPd0="}',
});
describe(':Entity', function () {
    var writeFileSync;
    beforeEach(function () {
        writeFileSync = sinon.stub(fs_1.default, 'writeFileSync').returns({});
    });
    afterEach(function () {
        writeFileSync.restore();
    });
    test('test generation', function () {
        var reference = new entity_1.Entity();
        var other = new entity_1.Entity(reference.private_key());
        expect(reference.private_key()).toEqual(other.private_key());
        expect(reference.private_key_hex()).toEqual(other.private_key_hex());
        expect(reference.public_key()).toEqual(other.public_key());
        expect(reference.public_key_hex()).toEqual(other.public_key_hex());
    });
    test('test signing verifying cycle', function () {
        var digest = helpers_1.calc_digest(Buffer.from('rand'));
        var entity = new entity_1.Entity();
        // sign the payload
        var sign_obj = entity.sign(digest);
        // verify the payload
        var verified = entity.verify(digest, sign_obj.signature);
        expect(verified).toBe(true);
        // create bad 64 byte sig
        var invalid_signature = Buffer.concat([digest, digest]);
        var bad_verification = entity.verify(digest, invalid_signature);
        expect(bad_verification).toBe(false);
    });
    test('test construction from base64', function () {
        var ref = new entity_1.Entity();
        var ref_key = ref.private_key();
        var base64_data = ref_key.toString('base64');
        var other = entity_1.Entity.from_base64(base64_data);
        expect(other.private_key()).toMatchObject(ref.private_key());
    });
    test('test invalid_construction', function () {
        expect(function () {
            // buffer of wrong length
            new entity_1.Entity(Buffer.from('123'));
        }).toThrow(errors_1.ValidationError);
    });
    test('test signature to hex', function () {
        var digest = _calc_digest(Buffer.from('rand'));
        var entity = new entity_1.Entity();
        var sigObj = entity.sign(digest);
        var signature_hex = entity.signature_hex(sigObj);
        expect(signature_hex).toEqual(sigObj.signature.toString('hex'));
    });
    test('test loads', function () { return __awaiter(void 0, void 0, void 0, function () {
        var s, ref, entity, private_key_hex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    s = '{"key_length": 32, "init_vector": "/bfsgykBD4i6Mjkg5aAQfg==", "password_salt": "vnDS6A9WopD3TpzrMbLJKg==", "privateKey": "TObHSc42ev8idRQbd7Is+BSZG9aQk2o8plOff6t3+WM="}';
                    ref = entity_1.Entity.from_hex('84cd8d1df47f2be283107cc177003e0b062ee35be50087a66268417629edf730');
                    return [4 /*yield*/, entity_1.Entity.loads(s, helpers_1.PASSWORD)];
                case 1:
                    entity = _a.sent();
                    private_key_hex = entity.private_key_hex();
                    expect(ref.private_key_hex()).toEqual(private_key_hex);
                    return [2 /*return*/];
            }
        });
    }); });
    test('test load', function () { return __awaiter(void 0, void 0, void 0, function () {
        var entity, ref;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, entity_1.Entity.load('path/to/some.png', helpers_1.PASSWORD)];
                case 1:
                    entity = _a.sent();
                    expect(entity.private_key_hex()).toEqual('47580e6993d7ae66c6fe13d435a2f960ab7e2551853a1be312fef14261111479');
                    ref = new entity_1.Entity(entity.privKey);
                    expect(entity.private_key_hex()).toEqual(ref.private_key_hex());
                    return [2 /*return*/];
            }
        });
    }); });
    test('test prompt dumps', function () { return __awaiter(void 0, void 0, void 0, function () {
        var entity, json_obj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    entity = entity_1.Entity.from_hex('84cd8d1df47f2be283107cc177003e0b062ee35be50087a66268417629edf730');
                    debugger;
                    return [4 /*yield*/, entity.prompt_dump('path/to/some.png', helpers_1.PASSWORD)];
                case 1:
                    _a.sent();
                    debugger;
                    expect(writeFileSync.calledOnce).toBe(true);
                    expect(writeFileSync.getCall(0).args[0]).toEqual('path/to/some.png');
                    json_obj = JSON.parse(writeFileSync.getCall(0).args[1]);
                    expect(json_obj.key_length).toEqual(32);
                    expect(json_obj).toHaveProperty('init_vector');
                    expect(json_obj).toHaveProperty('password_salt');
                    expect(json_obj).toHaveProperty('privateKey');
                    return [2 /*return*/];
            }
        });
    }); });
    test('test validation of strong password', function () {
        var valid = entity_1.Entity.strong_password(helpers_1.PASSWORD);
        expect(valid).toBe(true);
        var invalid = entity_1.Entity.strong_password('weakpassword');
        expect(invalid).toBe(false);
    });
});
//# sourceMappingURL=test_entity.js.map