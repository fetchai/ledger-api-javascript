import {test_transfer} from '../node/test_transfer'
import {test_server} from '../node/test_server'
import {Assert} from '../utils/assert'
import {test_tx} from '../node/test_tx'
import {test_contract} from '../node/test_contract'
import {logger} from '../../../fetchai/ledger/utils'

const TIMEOUT = 60 * 1000

export async function main() {
    setTimeout(Assert.fail, TIMEOUT)
    await test_tx()
    await test_transfer()
    await test_server()
    await test_contract()
    logger.info('SERVER 2e2 SUCCESS')
    Assert.success()
}

main()
console.log('cool')


