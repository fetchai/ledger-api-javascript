"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.test_tx = test_tx;

var _assert = require("../utils/assert");

var _bn = require("bn.js");

var _api = require("../../../fetchai/ledger/api");

var _tx = require("../../../fetchai/ledger/api/tx");

var _helpers = require("../../utils/helpers");

async function test_tx() {
  const api = new _api.TokenApi(_helpers.LOCAL_HOST, _helpers.DEFAULT_PORT);
  const wealth = await api.wealth(_helpers.ENTITIES[0], 1000);
  const TApi = new _tx.TransactionApi(_helpers.LOCAL_HOST, _helpers.DEFAULT_PORT);
  const contents = await TApi.contents(wealth.txs[0]);
  const expected_contents = JSON.parse('{"signatories":["0x18c2a33af8bd2cba7fa714a840a308a217aa4483880b1ef14b4fdffe08ab956e3f4b921cec33be7c258cfd7025a2b9a942770e5b17758bcc4961bbdc75a0251c"],"data":"eyJhbW91bnQiOiAxMDAwLCAidGltZXN0YW1wIjogMTU3NDEwMDMxNzgwNH0=","chainCode":"fetch.token","chargeLimit":1,"from":"dcgBKQnx4i3ayLbqcqstt4kSHNfDC4Am9TgyhF4RimY1eNHTP","digest":"0xa8468fc44cbb53ec79b2b3ec386fcac62eae6e76b821d2b2d792ad2f1c9d159c","validUntil":2452,"action":"wealth","validFrom":0,"transfers":[],"charge":1}');
  assertEqualContent(expected_contents, contents);
  console.log('contents is :', contents);
  const status = await TApi.status(wealth.txs[0]);
  const expected_status = JSON.parse('{"digest_bytes":{"type":"Buffer","data":[73,163,180,235,140,156,22,86,235,246,248,17,25,13,168,240,46,56,7,127,184,161,145,140,108,3,66,104,50,194,171,123]},"digest_hex":"49a3b4eb8c9c1656ebf6f811190da8f02e38077fb8a1918c6c03426832c2ab7b","status":"Pending","exit_code":"49a3b4eb8c9c1656ebf6f811190da8f02e38077fb8a1918c6c03426832c2ab7b","charge":"00","charge_rate":"00","fee":"00"}');
  assertEqualStatus(status, expected_status);
  return true;
}

function assertEqualStatus(actual, expected_status) {
  _assert.Assert.assert(/Executed|Pending/.test(actual.status));

  _assert.Assert.assert(actual.charge.cmp(new _bn.BN(expected_status.charge)) === 0);

  _assert.Assert.assert(actual.fee.cmp(new _bn.BN(expected_status.fee)) === 0);

  _assert.Assert.assert(actual.charge.cmp(new _bn.BN(expected_status.charge)) === 0);

  _assert.Assert.assert(typeof actual.digest_hex === 'string' && actual.digest_hex.length !== 0);

  _assert.Assert.assert(typeof actual.exit_code === 'string' && actual.exit_code.length !== 0);

  _assert.Assert.assert(typeof actual.exit_code === 'string' && actual.exit_code.length !== 0);
}

function assertEqualContent(expected_contents, actual) {
  _assert.Assert.assert_equal(actual.action, expected_contents.action);

  _assert.Assert.assert_equal(actual.chainCode, expected_contents.chainCode);

  _assert.Assert.assert_equal(actual.charge, expected_contents.charge);

  _assert.Assert.assert_equal(actual.chargeLimit, expected_contents.chargeLimit); // Assert.assert_equal(contents.data, expected_contents.data)


  _assert.Assert.assert_objects_equal(actual.transfers, expected_contents.transfers);

  _assert.Assert.assert_equal(actual.validFrom, expected_contents.validFrom);

  _assert.Assert.assert(typeof actual.validUntil === 'number');

  _assert.Assert.assert_equal(actual.from, expected_contents.from);
}