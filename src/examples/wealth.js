import {TokenApi} from '../fetchai/ledger/api'
import {Entity} from '../fetchai/ledger/crypto/entity'
import {logger} from '../fetchai/ledger/utils'

async function main() {
    const host = '127.0.0.1'
    const port = 8000
    const api = new TokenApi(host, port)

    let balance = await api.balance('29nQnTssh1Fe6zJtYvLfmjHqcKx5VAd5e88QpAREPvgbKUQpYw')
    logger.info(`Balance before wealth: ${balance}`)

    const entity = new Entity(
        Buffer.from(
            '2ff324b9d3367b160069ec67260959b4955ab519426603b5e59d5990128163f3',
            'hex'
        )
    )

    const j = await api.wealth(entity, 1000)
    console.log('wealth after', j)
}

main()

// Note: use this for testing purpose
// const entity = new Entity(new Buffer('2ff324b9d3367b160069ec67260959b4955ab519426603b5e59d5990128163f3', 'hex'))
// hex of address: 97a389875d9ff2db65f464cd825bf8be59d3cc1e6b42cdc52e1c0476ae320c4d
