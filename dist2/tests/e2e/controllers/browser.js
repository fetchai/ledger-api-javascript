"use strict";

var _seleniumWebdriver = _interopRequireDefault(require("selenium-webdriver"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _chrome = _interopRequireDefault(require("selenium-webdriver/chrome"));

var _assert = require("../utils/assert");

var _utils = require("../../../fetchai/ledger/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ROOT_FP = '/home/douglas/ledger-api-javascript';
const HTML_FP = '/src/tests/e2e/index.html';
const TEST = '/src/tests/e2e/vanilla.js';
const DEFAULT_TIMEOUT = 120000;

async function main() {
  // await test_password_encryption()
  await test_balance(); // await test_transfer()
  // await test_server()
  // await test_contract()

  console.log('Browser E2E All Succeeded');

  _utils.logger.info('Browser E2E All Succeeded');

  _assert.Assert.success();
}

main();

async function test_password_encryption() {
  const driver = get_driver();
  const script = get_script('password_encryption');
  await driver.get(`file://${_path.default.join(ROOT_FP + HTML_FP)}`);
  await driver.executeScript(script);
  const PASSWORD_ENCRYPTION = await poll(driver, 'PASSWORD_ENCRYPTION');

  _assert.Assert.assert_equal(PASSWORD_ENCRYPTION, true);

  _utils.logger.info('test_password_encryption passed');
}

async function test_contract() {
  const driver = get_driver();
  const script = get_script('contract');
  await driver.get(`file://${_path.default.join(ROOT_FP + HTML_FP)}`);
  await driver.executeScript(script);
  const BALANCE0 = await poll(driver, 'BALANCE0');

  _assert.Assert.assert_equal(BALANCE0, 8562);

  const BALANCE1 = await poll(driver, 'BALANCE1');

  _assert.Assert.assert_equal(BALANCE1, 0);

  const TOK0 = await poll(driver, 'TOK0');

  _assert.Assert.assert_equal(TOK0, 999800);

  const TOK1 = await poll(driver, 'TOK1');

  _assert.Assert.assert_equal(TOK1, 200);

  _utils.logger.info('test_contract passed');
}

async function test_balance() {
  const driver = get_driver_not_headless();
  debugger;
  const script = get_script('balance');
  await driver.get(`file://${_path.default.join(ROOT_FP + HTML_FP)}`);
  debugger;
  await driver.executeScript(script);
  debugger;
  const res = await poll(driver, 'BALANCE');

  _assert.Assert.assert_equal(res, 0);

  _utils.logger.info('test_balance passed');
}

async function test_server() {
  const driver = get_driver();
  const script = get_script('server');
  await driver.get(`file://${_path.default.join(ROOT_FP + HTML_FP)}`);
  await driver.executeScript(script);
  const [uri, port] = await poll(driver, 'SERVER');

  _assert.Assert.assert(uri.includes('.fetch-ai.com') && port === 443);

  _utils.logger.info('test_server passed');
}

async function test_transfer() {
  const driver = get_driver();
  const script = get_script('transfer');
  await driver.get(`file://${_path.default.join(ROOT_FP + HTML_FP)}`);
  await driver.executeScript(script);
  const res1 = await poll(driver, 'BALANCE1');

  _assert.Assert.assert_equal(res1, 749);

  const res2 = await poll(driver, 'BALANCE2');

  _assert.Assert.assert_equal(res2, 250);

  _utils.logger.info('test_transfer passed');
}

function get_script(name) {
  let bundle = _fs.default.readFileSync(_path.default.join(ROOT_FP + '/bundle/fetchai-ledger-api.js'), 'utf8');

  _fs.default.writeFileSync(_path.default.join(ROOT_FP + TEST), `${bundle}`);

  let test_server = _fs.default.readFileSync(_path.default.join(ROOT_FP + `/src/tests/e2e/browser/${name}.js`), 'utf8');

  _fs.default.appendFileSync(_path.default.join(ROOT_FP + TEST), test_server);

  return _fs.default.readFileSync(_path.default.join(ROOT_FP + TEST), 'utf8');
} // function get_driver() {
//     return new webdriver.Builder().forBrowser('chrome')
//         .setChromeOptions(new chrome.Options().headless().windowSize({width: 640, height: 480}
//         )).build()
// }
// For debugging swap get_driver() for this for easier debugging


function get_driver_not_headless() {
  return new _seleniumWebdriver.default.Builder().forBrowser('chrome').build();
}

async function poll(driver, property, timeout = false) {
  const asyncTimerPromise = new Promise(resolve => {
    const limit = timeout === false ? DEFAULT_TIMEOUT : timeout * 1000;
    const start = Date.now();
    const loop = setInterval(async () => {
      const value = await driver.executeScript(`return window.${property}`);

      if (typeof value !== 'undefined' && value !== null) {
        clearInterval(loop);
        return resolve(value);
      }

      let elapsed_time = Date.now() - start;

      if (elapsed_time > limit) {
        _assert.Assert.fail();
      }
    }, 100);
  });
  return asyncTimerPromise;
}