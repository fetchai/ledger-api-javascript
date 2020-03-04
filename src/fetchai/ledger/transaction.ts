import {BitVector} from './bitvector'
import {Address} from './crypto/address'
import {Identity} from './crypto/identity'
import {BN} from 'bn.js'
import assert from 'assert'
import {decode_payload, decode_transaction, encode_payload, encode_transaction} from './serialization'
import {RunTimeError} from './errors'
import {randomBytes} from 'crypto'
import {Entity} from './crypto'
import {convert_number} from "./utils";

type DECODE_TUPLE = [boolean, Transaction]
type PayloadTuple = [Transaction, Buffer]
type MergeTuple = [boolean, Transaction | null]

interface TransferItem {
    address: string;
    amount: BN;
}

interface SignatureData {
    readonly signature: NodeJS.ArrayBufferView;
    readonly verified: boolean;
}

interface SignatureItem {
    identity: Identity;
    signature: Buffer;
}

/**
 * This class for Transactions related operations
 *
 * @public
 * @class
 */
export class Transaction {
    public _from: string | Address = '';
    public _transfers: Array<TransferItem> = [];
    public _valid_from: BN = new BN(0);
    public _valid_until: BN = new BN(0);
    public _charge_rate: BN = new BN(0);
    public _charge_limit: BN = new BN(0);
    public _contract_address: string | Address = '';
    public _counter: BN = new BN(randomBytes(8));
    public _chain_code = '';
    public _shard_mask: BitVector = new BitVector();
    public _action = '';
    public _data = '';
    public _signatures: Array<SignatureItem> = [];

    public _is_synergetic: boolean = false;

    static from_encoded(encoded_transaction: Buffer): Transaction | null {
        const [success, tx] = decode_transaction(encoded_transaction);
        if (success) {
            return tx
        } else {
            return null
        }
    }

    encode_partial(): Buffer {
        return encode_transaction(this)
    }

    static decode_partial(buffer: Buffer): DECODE_TUPLE {
        return decode_transaction(buffer)
    }

    static decode(encoded_transaction: Buffer): Transaction | null {
        const [valid, tx] = decode_transaction(encoded_transaction);
        return valid ? tx : null
    }

    static decode_payload(payload): PayloadTuple {
        return decode_payload(payload)
    }

    encode_payload(): Buffer {
        return encode_payload(this)
    }

    // Get and Set from_address param
    from_address(address: AddressLike | null = null): Address | string {
        if (address !== null) {
            this._from = new Address(address);

        }
        return this._from;
    }

    transfers(): Array<TransferItem> {
        return this._transfers;
    }

    // Get and Set valid_from param
    valid_from(block_number: NumericInput | null = null): BN {
        if (block_number) {
           block_number = convert_number(block_number)
            this._valid_from = block_number
        }
        return this._valid_from
    }

    // Get and Set valid_until param
    valid_until(block_number: NumericInput | null = null): BN {
        if (block_number) {
             block_number = convert_number(block_number)
            this._valid_until = block_number
        }
        return this._valid_until
    }

    // Get and Set charge_rate param
    charge_rate(charge: NumericInput | null = null): BN {
        if (charge) {
            charge = convert_number(charge)
            this._charge_rate = charge
        }
        return this._charge_rate
    }

    // Get and Set charge_limit param
    charge_limit(limit: NumericInput | null = null): BN {
        if (limit) {
            limit = convert_number(limit)
            this._charge_limit = limit
        }
        return this._charge_limit
    }

    // Get contract_address param
    contract_address(): string | Address {
        return this._contract_address
    }

    // getter and setter
    counter(counter: NumericInput | null = null): BN {
        if (counter === null) return this._counter;
        counter = convert_number(counter)
        this._counter = counter
    }

    // Get chain_code param
    chain_code(): string {
        return this._chain_code
    }

    // Get and Set action param
    action(action: string | null = null): string {
        if (action !== null) {
            this._action = action
        }
        return this._action
    }

    // Get shard_mask param
    shard_mask(): BitVector {
        return this._shard_mask
    }

    // Get and Set data param. Note: data in bytes
    data(data: any = null): string {
        if (data !== null) {
            this._data = data
        }
        return this._data
    }

    add_transfer(address: AddressLike, amount: NumericInput): void {
        amount = convert_number(amount)
        assert(amount.gtn(new BN(0)));
        // if it is an identity we turn it into an address
        address = new Address(address);
        this._transfers.push({address: address.toHex(), amount: new BN(amount)})
    }

    target_contract(address: AddressLike, mask: BitVectorLike): void {
        this._contract_address = new Address(address);
        this._shard_mask = new BitVector(mask);
        this._chain_code = '';
        this._is_synergetic = false
    }

    target_synergetic_data(address: AddressLike, mask: BitVectorLike): void {
        this._contract_address = new Address(address);
        this._shard_mask = new BitVector(mask);
        this._chain_code = '';
        this._is_synergetic = false
    }

    target_chain_code(chain_code_id: string | number, mask: number | BitVector): void {
        this._contract_address = '';
        this._shard_mask = new BitVector(mask);
        this._chain_code = String(chain_code_id);
        this._is_synergetic = false
    }

    // Get and Set synergetic_data_submission param
    synergetic(syngergetic: boolean | null = null): boolean {
        if (syngergetic) {
            this._is_synergetic = syngergetic
        }
        return this._is_synergetic;
    }

    pending_signers(): Array<Identity> {
        return this._signatures.filter((el) => Buffer.byteLength(el.signature) === 0).map(el => el.identity)
    }

    present_signers(): Array<Identity> {
        return this._signatures.filter(el => Buffer.byteLength(el.signature) === 0).map(el => el.identity)
    }

    // Get signers param.
    signers(): Array<Identity> {
        return this._signatures.map(el => el.identity)
    }

    signatures(): Array<SignatureItem> {
        return this._signatures
    }

    is_incomplete(): boolean {
        return this._signatures.length > 0 && this.pending_signers().length > 0
    }

    hasSigner(signer: Identity): boolean {
        return this._signatures.some(el => el.identity.public_key_hex() === signer.public_key_hex())
    }

    is_valid(): boolean {
        const payload = this.encode_payload();
        let valid_flag = true;
        this._signatures.forEach(el => {
            if (!el.identity.verify(payload, el.signature)) {
                valid_flag = false
            }
        })
        return valid_flag
    }

    // left string to reduce size of refactor required
    add_signer(signer: string | Identity): void {
        // this is a difference with python where initially we were storing as different datastrcture
        if (typeof signer === 'string') {
            signer = Identity.from_hex(signer)
        }

        if (!this.hasSigner(signer as Identity)) {
            this._signatures.push({identity: signer, signature: Buffer.from('')})
        }
    }

    add_signature(identity: Identity, signature: Buffer) : void {
        if (!this.hasSigner(identity)) {
            throw new RunTimeError('Identity is not currently part')
        }

        this._signatures.forEach(el => {
            if (el.identity.public_key_hex() === identity.public_key_hex()) {
                el.signature = signature
            }
        })
    }

    sign(signer: Entity): void {
            const signature = signer.sign(this.encode_payload());
            this.add_signature(signer, signature)
    }

    compare(other: Transaction): boolean {
        const x = this.encode_payload().toString('hex');
        const y = other.encode_payload().toString('hex');
        return x === y
    }

    merge_signatures(tx2: Transaction): boolean {
        if (!this.compare(tx2)) {
            console.log('Attempting to combine transactions with different payloads');
            return false
        }

        let success = null;

        const payload = this.encode_payload();

        tx2.signatures().forEach(el => {
            if (!this.hasSigner(el.identity)) return;
            if (Buffer.byteLength(el.signature) === 0) return;
            if (!el.identity.verify(payload, el.signature)) {
                success = false;
                return
            }
            if (success === null) success = true;
            this.add_signature(el.identity, el.signature)
        });

        if (success === null) success = false;
        return success;
    }

    static merge(transactions: Array<Transaction>): MergeTuple {
        if (transactions.length === 0) {
            return [false, null]
        }
        const tx = transactions[0];

        for (let i = 1; i < transactions.length; i++) {
            tx.merge_signatures(transactions[i])
        }
        return [tx.is_valid(), tx]
    }




    encode(): Buffer | null {
        return (this.is_incomplete()) ? null : encode_transaction(this)
    }

}
