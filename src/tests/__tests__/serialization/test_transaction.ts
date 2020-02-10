import {Transaction} from '../../../fetchai/ledger/transaction'
import {BitVector} from '../../../fetchai/ledger/bitvector'
import {Identity} from '../../../fetchai/ledger/crypto/identity'
import {decode_transaction, encode_transaction} from '../../../fetchai/ledger/serialization/transaction'
import * as bytearray from '../../../fetchai/ledger/serialization/bytearray'
import {RunTimeError, ValidationError} from '../../../fetchai/ledger/errors'
import {BN} from 'bn.js'
import {ENTITIES, IDENTITIES} from '../../utils/helpers'
import {TokenTxFactory} from "../../../fetchai/ledger/api";
import {Entity} from "../../../fetchai/ledger/crypto";


const EXPECTED_SIGNATURE_BYTE_LEN = 64;
const EXPECTED_SIGNATURE_LENGTH_FIELD_LEN = 1;
const EXPECTED_SERIAL_SIGNATURE_LENGTH = EXPECTED_SIGNATURE_BYTE_LEN + EXPECTED_SIGNATURE_LENGTH_FIELD_LEN;


describe(':Transaction', () => {
    let multi_sig_identity, source_identity, multi_sig_board, target_identity, tx, mstx;


    test('test simple decode transaction ', () => {
        const EXPECTED_PAYLOAD = 'a1640000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d44235130ac5aab442e39f9aa27118956695229212dd2f1ab5b714e9f6bd581511c1010000000001020304050607080418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
        const payload = new Transaction();
        payload.from_address(IDENTITIES[0]);
        payload.add_transfer(IDENTITIES[1], new BN(256));
        payload.add_signer(IDENTITIES[0].public_key_hex());
        payload.counter(new BN('0102030405060708', 'hex'));
        // sign the final transaction
        payload.sign(ENTITIES[0]);
        const transaction_bytes = encode_transaction(payload);
        assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
        const [success, tx] = decode_transaction(transaction_bytes);
        expect(success).toBe(true);
        assertTxAreEqual(payload, tx)
    });


    test('test multiple transfers ', () => {
        const EXPECTED_PAYLOAD = 'a1660000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d4014235130ac5aab442e39f9aa27118956695229212dd2f1ab5b714e9f6bd581511c1010020f478c7f74b50c187bf9a8836f382bd62977baeeaf19625608e7e912aa60098c10200da2e9c3191e3768d1c59ea43f6318367ed9b21e6974f46a60d0dd8976740af6dc2000186a000000000000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
        const payload = new Transaction();
        payload.from_address(IDENTITIES[0]);
        payload.add_transfer(IDENTITIES[1], new BN(256));
        payload.add_transfer(IDENTITIES[2], new BN(512));
        payload.add_transfer(IDENTITIES[3], new BN(100000));
        payload.add_signer(IDENTITIES[0].public_key_hex());
        payload.counter(new BN(new Buffer(8).fill(0)));
        payload.sign(ENTITIES[0]);

        const transaction_bytes = encode_transaction(payload);

        assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
        const [success, tx] = decode_transaction(transaction_bytes);
        expect(success).toBe(true);
        assertTxAreEqual(payload, tx)

    })
});

test('test merge tx signatures', () => {

    const multi_sig_board = ENTITIES.slice(0, 4);
    const multi_sig_identity = ENTITIES[4];
    const target_identity = ENTITIES[5];
    const mstx = TokenTxFactory.transfer(multi_sig_identity, target_identity, 500, 500, multi_sig_board);
    const payload = mstx.encode_payload();
    const partials = [];
    let tx;
    multi_sig_board.forEach((signer: Entity) => {
        [tx,] = Transaction.decode_payload(payload);
        tx.sign(signer);
        partials.push(tx.encode_partial())
    });

    partials.forEach((partial: Buffer) => {
        const [, partial_tx] = Transaction.decode_partial(partial);
        expect(mstx.merge_signatures(partial_tx)).toBe(true)
    });

    expect(mstx.is_valid()).toBe(true)
});

test('test payload', () => {
    const tx = TokenTxFactory.transfer(ENTITIES[0], ENTITIES[1],
        500, 500, [ENTITIES[0]]);
    const payload = tx.encode_payload();
    const [new_tx,] = Transaction.decode_payload(payload);
    assertTxAreEqual(tx, new_tx)
});

test('test add signature for non signer', () => {
    const tx = TokenTxFactory.transfer(ENTITIES[0], ENTITIES[1],
        500, 500, [ENTITIES[0]]);

    expect(() => {
        tx.add_signature(ENTITIES[5], Buffer.from(''))
    }).toThrow(RunTimeError)
});

test('test merge fails on different signatures', () => {
    const tx = TokenTxFactory.transfer(ENTITIES[0], ENTITIES[1],
        500, 500, [ENTITIES[0]]);
    const other = TokenTxFactory.transfer(ENTITIES[2], ENTITIES[5],
        500, 500, [ENTITIES[2]]);

    expect(tx.merge_signatures(other)).toBe(false)
});

test('test merge fails on no signatures', () => {
    const ref = new Transaction();
    ref.counter(0);
    ref.add_signer(ENTITIES[0]);
    ref.from_address(ENTITIES[0]);
    const other = new Transaction();
    other.counter(0);
    other.add_signer(ENTITIES[0]);
    other.from_address(ENTITIES[0]);

    expect(ref.merge_signatures(other)).toBe(false)
});

test('test handling of invalid signatures', () => {
    const ref = new Transaction();
    ref.counter(0);
    ref.add_signer(ENTITIES[0]);
    ref.from_address(ENTITIES[0]);
    const other = new Transaction();
    other.counter(0);
    other.add_signer(ENTITIES[0]);
    other.from_address(ENTITIES[0]);
    other.add_signature(ENTITIES[0], Buffer.from('clearly invalid sig'));
    expect(ref.merge_signatures(other)).toBe(false)
});

test('test encoding of tx when incomplete', () => {
    const tx = TokenTxFactory.transfer(ENTITIES[0], ENTITIES[1],
        500, 500, [ENTITIES[0]]);
    expect(tx.is_incomplete()).toBe(true);
    expect(tx.encode()).toBe(null)
});

test('test encoding of complete tx', () => {
    const tx = TokenTxFactory.transfer(ENTITIES[0], ENTITIES[1],
        500, 500, [ENTITIES[0]]);

    tx.sign(ENTITIES[0]);

    expect(tx.is_incomplete()).toBe(false);
    const encoded = tx.encode();
    const recovered_tx = Transaction.decode(encoded);

    expect(recovered_tx).not.toBeNull();
    assertTxAreEqual(tx, recovered_tx)
});

test('test failure to decode partial', () => {
    const tx = TokenTxFactory.transfer(ENTITIES[0], ENTITIES[1],
        500, 500, [ENTITIES[0]]);
    const encoded_partial = tx.encode_partial();
    expect(Transaction.decode(encoded_partial)).toBeNull();
});


test('test synergetic_data_submission', () => {
    const EXPECTED_PAYLOAD = 'a160c000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d4c1271001c3000000e8d4a5100080e6672a9d98da667e5dc25b2bca8acf9644a7ac0797f01cb5968abf39de011df204646174610f7b2276616c7565223a20313233347d00000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    const payload = new Transaction();
    payload.from_address(IDENTITIES[0]);
    payload.valid_until(new BN(10000));
    payload.target_contract(IDENTITIES[4], new BitVector());
    payload.charge_rate(new BN(1));
    payload.charge_limit(new BN(1000000000000));
    payload.action('data');
    payload.synergetic(true);
    payload.data('{"value": 1234}');
    payload.add_signer(IDENTITIES[0].public_key_hex());
    payload.counter(new BN(new Buffer(8).fill(0)));
    payload.sign(ENTITIES[0]);

    const transaction_bytes = encode_transaction(payload);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    // attempt to decode a transaction from the generated bytes
    const [success, tx] = decode_transaction(transaction_bytes);
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx)
});

test('test chain code', () => {
    const EXPECTED_PAYLOAD = 'a1608000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d400c103e8c2000f4240800b666f6f2e6261722e62617a066c61756e636802676f00000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    const payload = new Transaction();
    payload.from_address(IDENTITIES[0]);
    payload.add_signer(IDENTITIES[0].public_key_hex());
    payload.charge_rate(new BN(1000));
    payload.charge_limit(new BN(1000000));
    payload.target_chain_code('foo.bar.baz', new BitVector());
    payload.action('launch');
    payload.data('go');
    payload.counter(new BN(new Buffer(8).fill(0)));
    // sign the final transaction
    payload.sign(ENTITIES[0]);

    const transaction_bytes = encode_transaction(payload);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    const [success, tx] = decode_transaction(transaction_bytes);
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx)
});

test('test smart contract', () => {
    const EXPECTED_PAYLOAD = 'a1604000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d400c103e8c2000f424080e6672a9d98da667e5dc25b2bca8acf9644a7ac0797f01cb5968abf39de011df2066c61756e636802676f00000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    const payload = new Transaction();
    payload.from_address(IDENTITIES[0]);
    payload.add_signer(IDENTITIES[0].public_key_hex());
    payload.charge_rate(new BN(1000));
    payload.charge_limit(new BN(1000000));
    payload.target_contract(IDENTITIES[4], new BitVector());
    payload.action('launch');
    payload.data('go');
    payload.counter(new BN(new Buffer(8).fill(0)));
    payload.sign(ENTITIES[0]);

    const transaction_bytes = encode_transaction(payload);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    const [success, tx] = decode_transaction(transaction_bytes);
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx)
});


test('test validity ranges', () => {
    const EXPECTED_PAYLOAD = 'a1670000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d4024235130ac5aab442e39f9aa27118956695229212dd2f1ab5b714e9f6bd581511c103e820f478c7f74b50c187bf9a8836f382bd62977baeeaf19625608e7e912aa60098c103e8da2e9c3191e3768d1c59ea43f6318367ed9b21e6974f46a60d0dd8976740af6dc103e8e6672a9d98da667e5dc25b2bca8acf9644a7ac0797f01cb5968abf39de011df2c103e864c0c8c103e8c2000f424000000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    const payload = new Transaction();
    payload.from_address(IDENTITIES[0]);
    payload.add_transfer(IDENTITIES[1], new BN(1000));
    payload.add_transfer(IDENTITIES[2], new BN(1000));
    payload.add_transfer(IDENTITIES[3], new BN(1000));
    payload.add_transfer(IDENTITIES[4], new BN(1000));
    payload.add_signer(IDENTITIES[0].public_key_hex());
    payload.charge_rate(new BN(1000));
    payload.charge_limit(new BN(1000000));
    payload.valid_from(new BN(100));
    payload.valid_until(new BN(200));
    payload.counter(new BN(new Buffer(8).fill(0)));
    payload.sign(ENTITIES[0]);

    const transaction_bytes = encode_transaction(payload);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    const [success, tx] = decode_transaction(transaction_bytes);
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx)
});

test('test contract with 2bit shard mask', () => {
    const EXPECTED_PAYLOAD = 'a1618000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d464c0c8c103e8c2000f4240010b666f6f2e6261722e62617a066c61756e63680000000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    const mask = new BitVector(2);
    mask.set(0, 1);
    const payload = new Transaction();
    payload.from_address(IDENTITIES[0]);
    payload.add_signer(IDENTITIES[0].public_key_hex());
    payload.charge_rate(new BN(1000));
    payload.charge_limit(new BN(1000000));
    payload.valid_from(new BN(100));
    payload.valid_until(new BN(200));
    payload.target_chain_code('foo.bar.baz', mask);
    payload.action('launch');
    payload.counter(new BN(new Buffer(8).fill(0)));
    payload.sign(ENTITIES[0]);

    const transaction_bytes = encode_transaction(payload);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    const [success, tx] = decode_transaction(transaction_bytes);
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx)
});


test('test contract with 4bit shard mask', () => {
    const EXPECTED_PAYLOAD = 'a1618000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d464c0c8c103e8c2000f42401c0b666f6f2e6261722e62617a066c61756e63680000000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    const mask = new BitVector(4);
    mask.set(3, 1);
    mask.set(2, 1);
    const payload = new Transaction();
    payload.from_address(IDENTITIES[0]);
    payload.add_signer(IDENTITIES[0].public_key_hex());
    payload.charge_rate(new BN(1000));
    payload.charge_limit(new BN(1000000));
    payload.valid_from(new BN(100));
    payload.valid_until(new BN(200));
    payload.target_chain_code('foo.bar.baz', mask);
    payload.action('launch');
    payload.counter(new BN(new Buffer(8).fill(0)));
    payload.sign(ENTITIES[0]);

    const transaction_bytes = encode_transaction(payload);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    const [success, tx] = decode_transaction(transaction_bytes);
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx)
});


test('test contract with large shard mask', () => {
    // const EXPECTED_PAYLOAD = 'a12180532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d464c0c8c103e8c2000f424041eaab0b666f6f2e6261722e62617a066c61756e6368000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c'
    const EXPECTED_PAYLOAD = 'a1618000532398dd883d1990f7dad3fde6a53a53347afc2680a04748f7f15ad03cadc4d464c0c8c103e8c2000f424041eaab0b666f6f2e6261722e62617a066c61756e63680000000000000000000418c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c';
    const mask = new BitVector(16);
    mask.set(15, 1);
    mask.set(14, 1);
    mask.set(13, 1);
    mask.set(11, 1);
    mask.set(9, 1);
    mask.set(7, 1);
    mask.set(5, 1);
    mask.set(3, 1);
    mask.set(1, 1);
    mask.set(0, 1);

    const payload = new Transaction();
    payload.from_address(IDENTITIES[0]);
    payload.add_signer(IDENTITIES[0].public_key_hex());
    payload.charge_rate(new BN(1000));
    payload.charge_limit(new BN(1000000));
    payload.valid_from(new BN(100));
    payload.valid_until(new BN(200));
    payload.target_chain_code('foo.bar.baz', mask);
    payload.action('launch');
    payload.counter(new BN(new Buffer(8).fill(0)));
    payload.sign(ENTITIES[0]);

    const transaction_bytes = encode_transaction(payload);
    assertIsExpectedTx(payload, transaction_bytes, EXPECTED_PAYLOAD);
    // attempt to decode a transaction from the generated bytes
    const [success, tx] = decode_transaction(transaction_bytes);
    expect(success).toBe(true);
    assertTxAreEqual(payload, tx)
});


test('test invalid magic', () => {
    const invalid = Buffer.from([0x00]);
    expect(() => {
        decode_transaction(invalid)
    }).toThrow(ValidationError)
});

test('test invalid version', () => {
    const invalid = Buffer.from([0xA1, 0xEF, 0xFF]);
    expect(() => {
        decode_transaction(invalid)
    }).toThrow(ValidationError)
});

function assertIsExpectedTx(payload: Transaction, transaction_bytes: Buffer, expected_hex_payload: string): void {

    const len = payload.signers().length;
    // a payload needs at least one signee
    expect(len).toBeGreaterThan(0);
    // calculate the serial length of the signatures (so that we can extract the payload)
    const signatures_serial_length = EXPECTED_SERIAL_SIGNATURE_LENGTH * len;
    expect(Buffer.byteLength(transaction_bytes)).toBeGreaterThan(signatures_serial_length);
    const expected_payload_end = Buffer.byteLength(transaction_bytes) - signatures_serial_length;
    const payload_bytes = transaction_bytes.slice(0, expected_payload_end);
    expect(payload_bytes.toString('hex')).toBe(expected_hex_payload);

    // loop through and verify all the signatures
    let buffer = transaction_bytes.slice(expected_payload_end);

    let signature;

    payload.signers().forEach((identity: Identity) => {
        [signature, buffer] = bytearray.decode_bytearray(buffer);
        // validate the signature is correct for the payload
        expect(identity.verify(payload_bytes, signature)).toBe(true)
    })

}

function assertTxAreEqual(reference: Transaction, other: Transaction): void {
    expect(reference).toBeInstanceOf(Transaction);
    expect(other).toBeInstanceOf(Transaction);
    expect(reference.from_address()).toMatchObject(other.from_address());
    const reference_transfers = reference.transfers();
    const other_transfers = other.transfers();

    for (let i = 0; i < reference_transfers.length; i++) {
        expect(reference_transfers[i].address).toBe(other_transfers[i].address);
        expect(reference_transfers[i].amount.cmp(other_transfers[i].amount)).toBe(0)
    }

    expect(reference.valid_from().cmp(other.valid_from())).toBe(0);
    expect(reference.valid_from().cmp(other.valid_from())).toBe(0);
    expect(reference.charge_rate().cmp(other.charge_rate())).toBe(0);
    expect(reference.charge_limit().cmp(other.charge_limit())).toBe(0);

    if (typeof reference.contract_address() === 'string') {
        expect(reference.contract_address()).toBe(other.contract_address())
    } else {
        expect(reference.contract_address()).toMatchObject(other.contract_address())
    }
    expect(reference.chain_code()).toBe(other.chain_code());
    expect(reference.action()).toBe(other.action());
    expect(reference.shard_mask()).toMatchObject(other.shard_mask());
    expect(reference.data()).toBe(other.data());
    expect(Object.keys(reference.signers())).toMatchObject(Object.keys(other.signers()))
}
