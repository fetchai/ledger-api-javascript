import {Assert} from "../../utils/assert";
import {Bootstrap} from "../../../fetchai/ledger/api/bootstrap";


export async function test_server() {
    const [uri, port] = await Bootstrap.server_from_name('betanet')
    debugger;
    Assert.assert(uri.includes('.fetch-ai.com') && port === 443)
}

