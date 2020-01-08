"use strict";

var api = new fetchai.LedgerApi('127.0.0.1', 8000);
const prom = api.tokens.balance("27L4TKQ9Q32HmGTzA32V25xwSjvKoHEPCZG5cMJ41scGTqaSdW");
prom.then(function (b) {
  console.log("TESTING 123", b.toString());
  window.BALANCE = b;
});