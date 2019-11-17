import {LedgerApi} from "../../fetchai/ledger/api";
import {DEFAULT_PORT, ENTITIES, LOCAL_HOST} from "../utils/helpers";

const FAILURE_STATUS_CODE = 8;

async function main() {
    const api = new LedgerApi(LOCAL_HOST, DEFAULT_PORT)
    const identity1 = ENTITIES[0]
    const identity2 = ENTITIES[1]

    const txs = await api.tokens.wealth(identity1, 1000)
    await api.sync([txs])

    const tx2 = await api.tokens.transfer(identity1, identity2, 250, 20)
    await api.sync([tx2])

    const balance1 = await api.tokens.balance(identity1)
    console.log('Balance 1:' + balance1)
    debugger;
    const balance2 = await api.tokens.balance(identity2)
    console.log('Balance 2:' + balance2)
}

main()
