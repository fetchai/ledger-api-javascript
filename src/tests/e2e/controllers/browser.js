import webdriver from 'selenium-webdriver'
import fs from 'fs'
import path from 'path'
import chrome from 'selenium-webdriver/chrome'
import {Assert} from '../utils/assert'
import {logger} from '../../../fetchai/ledger/utils'

const ROOT_FP = '/home/douglas/ledger-api-javascript'
const HTML_FP = '/src/tests/e2e/index.html'
const TEST = '/src/tests/e2e/bundle.js'

const DEFAULT_TIMEOUT = 120000

async function main() {
    await test_balance()
    await test_wealth()
    await test_transfer()
    await test_server()
    await test_contract()
    console.log('All Succeeded')
    Assert.success()
}

main()

async function test_contract(){
    const driver = new webdriver.Builder().forBrowser('chrome')
    // .setChromeOptions(new chrome.Options().headless().windowSize(screen))
        .build()
    const script = get_script('contract')
    await driver.get(`file://${path.join(ROOT_FP + HTML_FP)}`)
    await driver.executeScript(script)
    const BALANCE0 = await poll(driver, 'BALANCE0')
    Assert.assert_equal(BALANCE0, 8562)
    const BALANCE1 = await poll(driver, 'BALANCE1')
    Assert.assert_equal(BALANCE1, 0)
    const TOK0 = await poll(driver, 'TOK0')
    Assert.assert_equal(TOK0, 999800)
    const TOK1 = await poll(driver, 'TOK1')
    Assert.assert_equal(TOK1, 200)
    logger.info('test_contract passed')
}

async function test_balance(){
    const driver = get_driver()
    const script = get_script('balance')
    await driver.get(`file://${path.join(ROOT_FP + HTML_FP)}`)
    await driver.executeScript(script)
    const res = await poll(driver, 'BALANCE')
    Assert.assert_equal(res, 0)
    logger.info('test_balance passed')

}

async function test_server(){
    const driver = get_driver_not_headless()
    const script = get_script('server')
    await driver.get(`file://${path.join(ROOT_FP + HTML_FP)}`)
    await driver.executeScript(script)
    const [uri, port] = await poll(driver, 'SERVER')
    Assert.assert(uri.includes('.fetch-ai.com') && port === 443)
    logger.info('test_server passed')

}

async function test_transfer(){
    const driver = get_driver()
    const script = get_script('transfer')
    await driver.get(`file://${path.join(ROOT_FP + HTML_FP)}`)
    await driver.executeScript(script)
    const res1 = await poll(driver, 'BALANCE1')
    Assert.assert_equal(res1, 749)
    const res2 = await poll(driver, 'BALANCE2')
    Assert.assert_equal(res2, 250)
    logger.info('test_transfer passed')
}

async function test_wealth(){
    const driver = get_driver()
    const script = get_script('wealth')
    await driver.get(`file://${path.join(ROOT_FP + HTML_FP)}`)
    await driver.executeScript(script)
    const wealth = await poll(driver, 'WEALTH')
    Assert.assert_equal(wealth, 1000)
    logger.info('test_wealth passed')
}


function get_script(name){
    let bundle = fs.readFileSync(path.join(ROOT_FP + '/bundle/bundle.js'), 'utf8')
    fs.writeFileSync(path.join(ROOT_FP + TEST), `var result = ${bundle}`)
    let test_server = fs.readFileSync(path.join(ROOT_FP + `/src/tests/e2e/browser/${name}.js`), 'utf8')
    fs.appendFileSync(path.join(ROOT_FP + TEST), test_server)
    console.log('it is node ok ok ok ok :: ')
    return fs.readFileSync(path.join(ROOT_FP + TEST), 'utf8')
}
function get_driver(){
    return  new webdriver.Builder().forBrowser('chrome')
        .setChromeOptions(new chrome.Options().headless().windowSize({ width: 640,  height: 480 }
        )).build()
}

/**
 * For debugging swap get_driver() for this for easier debugging
 * @returns {!ThenableWebDriver}
 */
function get_driver_not_headless(){
    return new webdriver.Builder().forBrowser('chrome').build()
}

async function poll(driver, property, timeout = false) {
    const asyncTimerPromise = new Promise((resolve) => {
        const limit = (timeout === false) ? DEFAULT_TIMEOUT : timeout * 1000
        const start = Date.now()
        const loop = setInterval(async () => {
            const value = await driver.executeScript(`return window.${property}`)

            if (typeof value !== 'undefined' && value !== null) {
                clearInterval(loop)
                return resolve(value)
            }

            let elapsed_time = Date.now() - start
            if (elapsed_time > limit) {
                Assert.fail()
            }
        }, 100)
    })
    return asyncTimerPromise
}
