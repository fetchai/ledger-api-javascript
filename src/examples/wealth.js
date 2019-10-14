import { TokenApi } from '../fetchai/ledger/api'
import {Entity} from '../fetchai/ledger/crypto/entity'

async function main() {
	const host = '127.0.0.1'
	const port = 8000
	const api = new TokenApi(host, port)
	const entity = new Entity()
	await api.wealth(entity, 1)
}

main()
