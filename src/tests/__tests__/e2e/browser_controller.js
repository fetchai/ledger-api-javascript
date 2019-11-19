import webdriver from 'selenium-webdriver'
import fs from 'fs'
import path from 'path'

const ROOT_FP = "/home/douglas/ledger-api-javascript";

const driver = new webdriver.Builder().forBrowser('chrome').build()

async function main(){
    debugger;
        await driver.get(`file://${path.join(ROOT_FP + '/src/tests/e2e/index.html')}`)
        let bundle = fs.readFileSync(path.join(ROOT_FP + '/bundle/bundle.js'), 'utf8')
        fs.writeFileSync(path.join(ROOT_FP + '/src/tests/e2e/test.js'), `var result = ${bundle}`)
        let balance = fs.readFileSync(path.join(ROOT_FP + '/src/tests/e2e/balance.js'), 'utf8')
        fs.appendFileSync(path.join(ROOT_FP + '/src/tests/e2e/test.js'), balance)

         const script = fs.readFileSync(
            path.join(ROOT_FP + '/src/tests/e2e/test.js'),
            'utf8'
        )

       const r = await driver.executeScript(script);

     debugger;debugger;debugger;debugger;debugger;debugger;debugger;debugger;debugger;debugger;
       console.log("WE DID GET TO HERE WITH RESULT", r);
let balance2 = fs.readFileSync(path.join(ROOT_FP + '/src/tests/e2e/balance.js'), 'utf8')
        fs.appendFileSync(path.join(ROOT_FP + '/src/tests/e2e/test.js'), balance2)
        const script2 = fs.readFileSync(
            path.join(ROOT_FP + '/src/tests/e2e/test.js'),
            'utf8'
        )
        fs.unlinkSync(path.join(ROOT_FP + '/src/tests/e2e/test.js'))
    }
main()
