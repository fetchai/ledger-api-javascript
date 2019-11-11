import webdriver from 'selenium-webdriver'
import fs from 'fs'
import path from 'path'

const driver = new webdriver.Builder().forBrowser('chrome').build()

describe('Browser Testing', () => {
    beforeAll(async () => {
        await driver.get('http://localhost:3000')
    })

    test('test Balance example script', () => {
        let bundle = fs.readFileSync(path.join(__dirname + '../../../../../bundle/bundle.js'), 'utf8')
        let balance = fs.readFileSync(path.join(__dirname + '../../../e2e/balance.js'), 'utf8')
        fs.writeFileSync(path.join(__dirname + '../../../e2e/test.js'), `var result = ${bundle}`)
        fs.appendFileSync(path.join(__dirname + '../../../e2e/test.js'), balance)
        const script = fs.readFileSync(
            path.join(__dirname, '../../e2e/test.js'),
            'utf8'
        )
        driver.executeScript(script)
        fs.unlinkSync(path.join(__dirname + '../../../e2e/test.js'))
    })
})
