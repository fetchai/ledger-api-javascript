import {TokenApi} from '../fetchai/ledger/api'
import {RunTimeError} from "../fetchai/ledger/errors";

// see the bootstrap information for more information on obtaining a host and port to connect to our network.
const HOST = '127.0.0.1'
const PORT = 8000

async function main() {
    let balance;
    const api = new TokenApi(HOST, PORT)

    try {
        balance = await api.balance('dTSCNwHBPoDdESpxj6NQkPDvX3DN1DFKGsUPZNVWDVDrfur4z')
    } catch (e) {
        throw new RunTimeError('The following error occured checking the balance: ' + e)
    }
    console.log("Balance: " + balance)
}

main()
