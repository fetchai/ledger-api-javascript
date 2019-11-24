import {Bootstrap} from "../../fetchai/ledger/api/bootstrap";
import {Assert} from "../utils/assert";

export async function test_server() {
    const [uri, port] = await Bootstrap.server_from_name('betanet')
    Assert.assert(uri.includes('.fetch-ai.com') && port === 443)
}
