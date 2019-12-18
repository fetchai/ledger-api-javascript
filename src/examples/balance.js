import {TokenApi} from '../fetchai/ledger/api'
async function main() {
    const host = '127.0.0.1'
    const port = 8000
    const api = new TokenApi(host, port)
    const balance = await api.balance('dTSCNwHBPoDdESpxj6NQkPDvX3DN1DFKGsUPZNVWDVDrfur4z')
    console.log('Balance : ' + balance)
}

main()
