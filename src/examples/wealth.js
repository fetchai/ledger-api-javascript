import { TokenApi } from '../fetchai/ledger/api'
import {Entity} from '../fetchai/ledger/crypto/entity'

async function main() {
	const host = '127.0.0.1'
	const port = 8000
	const api = new TokenApi(host, port)
	const entity = new Entity()
	await api.wealth(entity, 1000)
}

main()

// Note: use this for testing purpose
// const entity = new Entity(new Buffer('2ff324b9d3367b160069ec67260959b4955ab519426603b5e59d5990128163f3', 'hex'))
// hex of address: 97a389875d9ff2db65f464cd825bf8be59d3cc1e6b42cdc52e1c0476ae320c4d
