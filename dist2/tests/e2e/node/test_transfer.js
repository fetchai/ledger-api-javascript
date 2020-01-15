"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.test_transfer = test_transfer;

var _helpers = require("../../utils/helpers");

var _api = require("../../../fetchai/ledger/api");

var _entity = require("../../../fetchai/ledger/crypto/entity");

var _assert = require("../utils/assert");

async function test_transfer() {
  const api = new _api.LedgerApi(_helpers.LOCAL_HOST, _helpers.DEFAULT_PORT);
  const identity1 = new _entity.Entity();
  const identity2 = new _entity.Entity();
  const txs = await api.tokens.wealth(identity1, 1000);
  await api.sync([txs]);
  const tx2 = await api.tokens.transfer(identity1, identity2, 250, 20);
  await api.sync([tx2]);
  const balance1 = await api.tokens.balance(identity1);
  console.log('Balance 1:' + balance1);

  _assert.Assert.assert_equal(balance1, 749);

  const balance2 = await api.tokens.balance(identity2);

  _assert.Assert.assert_equal(balance2, 250);

  console.log('Balance 2:' + balance2);
}