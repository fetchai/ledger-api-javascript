import {TokenApi} from '../fetchai/ledger/api'
import {RunTimeError} from '../fetchai/ledger/errors'

// see the bootstrap information for more information on obtaining a host and port to connect to our network.
const HOST = '127.0.0.1'
const PORT = 8000

async function main() {
    let balance
    const api = new TokenApi(HOST, PORT)

    try {
        balance = await api.balance('27L4TKQ9Q32HmGTzA32V25xwSjvKoHEPCZG5cMJ41scGTqaSdW')
    } catch (e) {
        throw new RunTimeError('The following error occurred checking the balance: ' + e)
    }


    // Querying a balance returns an instance of BigNumber (https://github.com/indutny/bn.js/)
    console.log('Balance: ' + balance.toString())
}

main()
