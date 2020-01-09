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

declare global {

    // types which can be accepted by Address constructor
type AddressLike = string | Address | Identity | Buffer;

enum PREFIX {
     CONTRACT = "fetch.contract",
    TOKEN = "fetch.token",
}

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

    /*~ Here, declare things that go in the global namespace, or augment
     *~ existing declarations in the global namespace
     */
    interface String {
        fancyFormat(opts: StringFormatOptions): string;
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
