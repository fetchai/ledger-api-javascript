import {Entity} from '../fetchai/ledger/crypto/entity'
import { LedgerApi } from '../fetchai/ledger/api/__init__'

const HOST = '127.0.0.1'
const PORT = 8000

async function main() {
	debugger
	// create the APIs
	const api = new LedgerApi(HOST, PORT)
	// generate a random identity
	const identity1 = new Entity()
	const identity2 = new Entity()
	const b = await api.tokens.balance(identity1)
	// create the balance
	console.log('WWWWWWSubmitting wealth creation...')
	const t  = await api.tokens.wealth(identity1, 1000)
	debugger
	const done = await api.sync([t])

	const d = await api.tokens.balance(identity1)
	// submit and wait for the transfer to be complete
	console.log('EEEESubmitting transfer...' + d)
	//  api.sync([api.tokens.transfer.bind(api.tokens, identity1, identity2, 250, 20)])
	//console.log('RRRRRBalance 1:', await api.tokens.balance(identity1))
	// console.log('TTTTTTBalance 2:', await api.tokens.balance(identity2))
}
main()


/*
from fetchai.ledger.api import LedgerApi
from fetchai.ledger.crypto import Entity

HOST = '127.0.0.1'
PORT = 8000


def main():
    # create the APIs
    api = LedgerApi(HOST, PORT)

    # generate a random identity
    identity1 = Entity()
    identity2 = Entity()
    print('Balance Before:', api.tokens.balance(identity1))

    # create the balance
    print('Submitting wealth creation...')
    api.sync(api.tokens.wealth(identity1, 1000))

    # submit and wait for the transfer to be complete
    print('Submitting transfer...')
    api.sync(api.tokens.transfer(identity1, identity2, 250, 20))

    print('Balance 1:', api.tokens.balance(identity1))
    print('Balance 2:', api.tokens.balance(identity2))


if __name__ == '__main__':
    main()


 */
