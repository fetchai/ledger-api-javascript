import webdriver from 'selenium-webdriver'
import fs from 'fs'
import path from 'path'
import {Assert} from "../../utils/assert";
import chrome from 'selenium-webdriver/chrome'

const ROOT_FP = '/home/douglas/ledger-api-javascript'
const DEFAULT_TIMEOUT = 60000
const screen = { width: 640,  height: 480 }

 function get_script(name){
    let bundle = fs.readFileSync(path.join(ROOT_FP + '/bundle/bundle.js'), 'utf8')
    fs.writeFileSync(path.join(ROOT_FP + '/src/tests/e2e/test.js'), `var result = ${bundle}`)
    let test_server = fs.readFileSync(path.join(ROOT_FP + `/src/tests/e2e/${name}.js`), 'utf8')
    fs.appendFileSync(path.join(ROOT_FP + '/src/tests/e2e/test.js'), test_server)
    console.log("it is node ok ok ok ok :: ");
    return fs.readFileSync(path.join(ROOT_FP + '/src/tests/e2e/test.js'), 'utf8')
}

function get_driver(){
    return  new webdriver.Builder().forBrowser('chrome')
    .setChromeOptions(new chrome.Options().headless().windowSize(screen))
    .build()
}


function get_driver_full(){
    return new webdriver.Builder().forBrowser('chrome').build()
}


async function poll(driver, property, timeout = false) {
     const asyncTimerPromise = new Promise((resolve) => {
     const limit = (timeout === false) ? DEFAULT_TIMEOUT : timeout * 1000;
     const start = Date.now();
     const loop = setInterval(async () => {
        const value = await driver.executeScript(`return window.${property}`)

        if (typeof value !== "undefined" && value !== null) {
            clearInterval(loop)
            return resolve(value)
        }

        let elapsed_time = Date.now() - start
                if (elapsed_time >= limit) {
                    Assert.fail()
                }
    }, 100)
          })
        return asyncTimerPromise
}

describe.skip('Test Browser', () => {

    beforeAll(async () => {
         jest.setTimeout(120000);
    })

    //  afterEach(() => {
    //     fs.unlinkSync(path.join(process.env.PWD + '/src/tests/e2e/test.js'))
    // })
    // beforeEach(() => {
    //     let bundle = fs.readFileSync(path.join(process.env.PWD + '/bundle/bundle.js'), 'utf8')
    //     fs.writeFileSync(path.join(process.env.PWD + '/src/tests/e2e/test.js'), `var result = ${bundle}`)
    // })
    //
    // afterEach(() => {
    //     fs.unlinkSync(path.join(process.env.PWD + '/src/tests/e2e/test.js'))
    // })

    test.skip('test Balance', async () => {
        const driver = new webdriver.Builder().forBrowser('chrome').build()
        //  .setChromeOptions(new chrome.Options().headless().windowSize(screen))
          //  .build()
        const script = get_script('balance');
        await driver.get(`file://${path.join(ROOT_FP + '/src/tests/e2e/index.html')}`)
        await driver.executeScript(script)
        const res = await poll(driver, 'BALANCE');
        expect(res).toBe(0)
    })

  test.skip('test Wealth', async () => {
const driver = new webdriver.Builder().forBrowser('chrome').build()
const script = get_script('wealth');
await driver.get(`file://${path.join(ROOT_FP + '/src/tests/e2e/index.html')}`)
await driver.executeScript(script)
const wealth = await poll(driver, 'WEALTH');
expect(wealth).toBe(1000)
    })

    test.skip('test Transfer', async () => {
        const driver = new webdriver.Builder().forBrowser('chrome').build()
const script = get_script('transfer');
await driver.get(`file://${path.join(ROOT_FP + '/src/tests/e2e/index.html')}`)
await driver.executeScript(script)
const res1 = await poll(driver, 'BALANCE1');
expect(res1).toBe(749)
const res2 = await poll(driver, 'BALANCE2');
expect(res2).toBe(250)
    })

        test('test Server', async () => {
            debugger;
             console.log("___Server_1___Server___")
const driver = new webdriver.Builder().forBrowser('chrome').build()
const script = get_script('server');
await driver.get(`file://${path.join(ROOT_FP + '/src/tests/e2e/index.html')}`)
await driver.executeScript(script)
const [uri, port] = await poll(driver, 'SERVER');
expect(uri.includes('.fetch-ai.com') && port === 443).toBe(true)
console.log("___Server_1 PASSED___Server___")

    })

       test.skip('test Contract', async () => {
           console.log("____1______")
          const driver = new webdriver.Builder().forBrowser('chrome').build()
const script = get_script('contract');
await driver.get(`file://${path.join(ROOT_FP + '/src/tests/e2e/index.html')}`)
    console.log("____2______")
await driver.executeScript(script)
const BALANCE0 = await poll(driver, 'BALANCE0');
expect(BALANCE0).toBe(8562)
           console.log("____3______")
const BALANCE1 = await poll(driver, 'BALANCE1');
expect(BALANCE1).toBe(0)
           console.log("____4______")
const TOK0 = await poll(driver, 'TOK0');
expect(TOK0).toBe(999800)
           console.log("____5______")
const TOK1 = await poll(driver, 'TOK1');
expect(TOK1).toBe(200)

    })

})
