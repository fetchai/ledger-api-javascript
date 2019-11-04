import { TokenApi } from '../fetchai/ledger/api'
import { Entity } from '../fetchai/ledger/crypto/entity'
import { logger } from '../fetchai/ledger/utils'

async function main() {
    const host = '127.0.0.1'
    const port = 8000
    // create the Token APIs
    const api = new TokenApi(host, port)

    // generate a random identity
    const identity1 = new Entity()
    let balance = await api.balance(identity1)
    logger.info(`Balance before wealth: ${balance}`)

    await api.wealth(identity1, 1000)

    balance = await api.balance(identity1)
    logger.info(`Balance after wealth: ${balance}`)
}

main()
