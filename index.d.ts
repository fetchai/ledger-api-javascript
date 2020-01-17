import {Address, Identity} from './src/fetchai/ledger/crypto'
import {BN} from 'bn.js'
import {BitVector} from './src/fetchai/ledger'

declare global {
    // types which can be accepted by Address constructor
    type AddressLike = string | Address | Identity | Buffer;
    // valid types as per bitvector constructor
    type BitVectorLike = BitVector | number | null;

     type BinaryLike = string | Buffer;
// allowed numeric datatypes for public API of SDK, which are then converted into BN instances for sending to ledger.
type NumericInput = number | BN;

type JsonPrimitive = string | number | boolean | null

// todo Should this accept other primitives?? ask ed.
interface MessagePackable {
       [index: number]: Address | string | number;
}

// because of incorrect type info nofix bug https://github.com/microsoft/TypeScript/issues/17053
interface RegExpExecArrayOptionalItems extends Array<string|undefined> {
    index: number;
    input: string;
}

}

/*~ If your module exports nothing, you'll need this line. Otherwise, delete it */
export { }
