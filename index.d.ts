// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ This is the global-modifying module template file. You should rename it to index.d.ts
 *~ and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

/*~ Note: If your global-modifying module is callable or constructable, you'll
 *~ need to combine the patterns here with those in the module-class or module-function
 *~ template files
 */

import {Address, Identity} from "./src/fetchai/ledger/crypto";
import {BN} from 'bn.js'
import {BitVector} from "./src/fetchai/ledger";

declare global {

    // types which can be accepted by Address constructor
    type AddressLike = string | Address | Identity | Buffer;
    // valid types as per bitvector constructor
    type BitVectorLike = BitVector | number | null;

     type BinaryLike = string | Buffer;
// allowed numeric datatypes for public API of SDK, which are then converted into BN instances for sending to ledger.
type NumericInput = number | BN;

    enum PREFIX {
        CONTRACT = "fetch.contract",
        TOKEN = "fetch.token",
    }

    //Non-exhaustive list of common endpoints: additional custom endpoints may also exist
    enum ENDPOINT {
        NONE = "",
        BALANCE = "balance",
        STAKE = "stake",
        COOLDOWNSTAKE = "cooldownStake",
        ADDSTAKE = "addStake",
        COLLECTSTAKE = "collectStake",
        DESTAKE = "destake",
        DEED = "deed",
        CREATE = "create",
        TRANSFER = "transfer"
    }

    interface String {
        /**
         * Imported the type from es2020, and it seems to be wrong, different to actual, so i overwrote it here as it returns string not signatutre matchAll(regexp: RegExp): IterableIterator<RegExpMatchArray>
         */
        matchAll(regexp: RegExp): any
    }

// rename this. The datastructure required to work with our messagepack encode.
    interface JSONEncodable {
    [index: number]: Address | string | number | JSONEncodable;
}
interface MessagePackable {
       [index: number]: Address | string | number;
}

interface ContractionActionArgs {
       [index: number]: Address | string;
}

}

/*~ If your module exports types or values, write them as usual */
export interface StringFormatOptions {
    fancinessLevel: number;
}

/*~ For example, declaring a method on the module (in addition to its global side effects) */
export function doSomething(): void;

/*~ If your module exports nothing, you'll need this line. Otherwise, delete it */
export { };
