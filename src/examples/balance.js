import { TokenApi } from '../fetchai/ledger/api'

async function main() {
	const host = '127.0.0.1'
	const port = 8000
	const api = new TokenApi(host, port)
    debugger;
	await api.balance('2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5')
}

main()
