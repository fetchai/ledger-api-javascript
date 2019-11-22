import {equals} from "../../tests/utils/helpers";


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

