import {TokenApi, TransactionApi} from '../fetchai/ledger/api'
import {Entity} from '../fetchai/ledger/crypto/entity'
import {logger} from '../fetchai/ledger/utils'

async function main() {
    const host = '127.0.0.1'
    const port = 8000
    const api = new TokenApi(host, port)
    let balance = await api.balance('29nQnTssh1Fe6zJtYvLfmjHqcKx5VAd5e88QpAREPvgbKUQpYw')
    logger.info(`Balance before wealth: ${balance}`)
    const entity = new Entity(Buffer.from('2ff324b9d3367b160069ec67260959b4955ab519426603b5e59d5990128163f3', 'hex'))
    const wealth = await api.wealth(entity, 1000)
    console.log('wealth after : ', wealth)
    const TApi = new TransactionApi(host, port)
    const contents = await TApi.contents(wealth.txs[0])
    console.log('contents is :', contents)
    const status = await TApi.status(wealth.txs[0])
    console.log('status is :', status)
}

main()
