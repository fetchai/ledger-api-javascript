import { TokenApi, ApiEndpoint } from '../fetchai/ledger/api'
import { logger } from '../fetchai/ledger/utils'

async function main() {
    let host = '127.0.0.1'
    let port = 8000
    let api = new TokenApi(host, port)
    await api.balance('2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5')

}

main()