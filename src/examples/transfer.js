import {Entity} from '../fetchai/ledger/crypto/entity'
import { TokenApi } from '../fetchai/ledger/api'

const HOST = '127.0.0.1';
const PORT = 8000;

async function main() {
      // create the APIs
   const api = new TokenApi(HOST, PORT);

     // generate a random identity
    const identity1 = new Entity()
    const identity2 = new Entity()
    console.log('Balance Before:' + api.tokens.balance(identity1))

    // create the balance
    console.log('Submitting wealth creation...')
    api.sync(api.tokens.wealth(identity1, 1000))

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
