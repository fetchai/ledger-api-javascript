// import {DEFAULT_PORT, LOCAL_HOST} from "../../tests/utils/helpers";
// import {Assert} from "../utils/assert";
// import {Entity} from "../../fetchai/ledger/crypto/entity";
// import {LedgerApi} from "../../fetchai/ledger/api";
import {DEFAULT_PORT, LOCAL_HOST} from "../../../utils/helpers";
import {LedgerApi} from "../../../../fetchai/ledger/api";
import {Entity} from "../../../../fetchai/ledger/crypto/entity";


const FAILURE_STATUS_CODE = 1;
const SUCCESS_STATUS_CODE = 0;

export async function test_transfer() {
    const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
   const identity1 = new Entity()
    const identity2 = new Entity()

    const txs = await api.tokens.wealth(identity1, 1000)
    await api.sync([txs])

    const tx2 = await api.tokens.transfer(identity1, identity2, 250, 20)
    await api.sync([tx2])

    const balance1 = await api.tokens.balance(identity1)
    console.log('Balance 1:' + balance1)
    Assert.assert_equal(balance1, 749)
    const balance2 = await api.tokens.balance(identity2)
    Assert.assert_equal(balance2, 250)
    console.log('Balance 2:' + balance2)
}


