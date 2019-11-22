import {test_transfer} from "../node/test_transfer";
import {test_server} from "../node/test_server";
import {Assert} from "../utils/assert";

const TIMEOUT = 60 * 1000

export async function main() {
// automatic fail if timeout exceeded without success
 setTimeout(Assert.fail(), TIMEOUT);
    await test_tx();
    await  test_transfer();
    await  test_server();
    console.log("success");
    Assert.success();
}

main()
console.log("cool");


