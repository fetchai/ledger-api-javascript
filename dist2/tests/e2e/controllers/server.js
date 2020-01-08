"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = main;

var _test_transfer = require("../node/test_transfer");

var _test_server = require("../node/test_server");

var _assert = require("../utils/assert");

var _test_tx = require("../node/test_tx");

var _test_contract = require("../node/test_contract");

var _utils = require("../../../fetchai/ledger/utils");

const TIMEOUT = 60 * 1000;

async function main() {
  setTimeout(_assert.Assert.fail, TIMEOUT);
  await (0, _test_tx.test_tx)();
  await (0, _test_transfer.test_transfer)();
  await (0, _test_server.test_server)();
  await (0, _test_contract.test_contract)();

  _utils.logger.info('SERVER 2e2 SUCCESS');

  _assert.Assert.success();
}

main();
console.log('cool');