"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.test_server = test_server;

var _assert = require("../utils/assert");

var _bootstrap = require("../../../fetchai/ledger/api/bootstrap");

async function test_server() {
  const [uri, port] = await _bootstrap.Bootstrap.server_from_name('betanet');

  _assert.Assert.assert(uri.includes('.fetch-ai.com') && port === 443);
}