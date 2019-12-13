import {TokenApi} from '../fetchai/ledger/api'
import {Entity} from "../fetchai/ledger/crypto/entity";

async function main() {
    const host = '127.0.0.1'
    const port = 8000
    const api = new TokenApi(host, port)
    const balance = await api.balance('2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5')
    console.log('Balance : ' + balance)
}

main()
