"use strict";

let api = new fetchai.LedgerApi('127.0.0.1', 8000);
const identity1 = new fetchai.Entity();
const identity2 = new fetchai.Entity();
const tx = api.tokens.wealth(identity1, 1000);
tx.then(tx => {
  const sync = api.sync([tx]);
  sync.then(() => {
    const tx2 = api.tokens.transfer(identity1, identity2, 250, 20);
    tx2.then(res => {
      const sync2 = api.sync([res]);
      sync2.then(() => {
        const balance1 = api.tokens.balance(identity1);
        balance1.then(balance1 => window.BALANCE1 = balance1);
        const balance2 = api.tokens.balance(identity2);
        balance2.then(balance2 => window.BALANCE2 = balance2);
      });
    });
  });
});