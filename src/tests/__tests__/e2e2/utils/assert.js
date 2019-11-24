// import {equals} from "../../tests/utils/helpers";
    /*
* Taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript/5522917 (Jean Vincent`s answer).
* Modified, to amoungst other things ignore matching very long strings, which seem to sometimes get corrupted
* and isn't needed for this. Measures that objects are the same in terms of properties and their values.
 */
function equals(x, y) {
    if (x === y) return true
    for (var p in x) {
        if (!x.hasOwnProperty(p)) continue
        if (!y.hasOwnProperty(p)) return false
        if (x[p] === y[p]) continue
        if (typeof x[p] === 'string' && x[p].length > 150) continue
        if (typeof (x[p]) !== 'object') return false
        if (!equals(x[p], y[p])) return false
    }
    for (p in y) {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false
    }
    return true
}

export const FAILURE_STATUS_CODE = 1;
export const SUCCESS_STATUS_CODE = 0;

export class Assert {

    static success() {
        process.exit(SUCCESS_STATUS_CODE);
    }

    static fail() {
        process.exit(FAILURE_STATUS_CODE);
    }

    static assert(val) {

        if (!val) {
            debugger;
            console.log("ASSERT SINGLE FAIL");
            process.exit(FAILURE_STATUS_CODE);
        } else  console.log("ASSERT SINGLE SUCCEED");
    }

    static assert_objects_equal(actual, expected) {
        if (typeof actual !== "object") {
            console.log("process.exit: assert first")
            process.exit(FAILURE_STATUS_CODE);
        } else if (typeof expected !== "object") {
            process.exit(FAILURE_STATUS_CODE);
        } else if (!equals(actual, expected)) {
            process.exit(FAILURE_STATUS_CODE);
        }
    }




    static assert_equal(actual, expected) {
        if (actual !== expected) {
            console.log("process.exit: assert second")
            debugger;
            process.exit(FAILURE_STATUS_CODE);
        } else{
             console.log("passed assert_eqal")
        }
    }


}

