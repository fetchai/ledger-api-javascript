"use strict";

var _entity = require("../fetchai/ledger/crypto/entity");

var _address = require("../fetchai/ledger/crypto/address");

var _api = require("../fetchai/ledger/api");

var _bn = require("bn.js");

const HOST = '127.0.0.1';
const PORT = 8000;

function sync_error(errors) {
  errors.forEach(tx => console.log(`\nThe following transaction: "${tx.get_digest_hex()}" did not succeed. 
        \nIt exited with status : "${tx.get_status()}" and exit code: "${tx.get_exit_code()}"`));
  throw new Error();
}

async function main() {
  let txs, balance, stake, to_destake, cool_down;
  const private_key_hex = '6e8339a0c6d51fc58b4365bf2ce18ff2698d2b8c40bb13fcef7e1ba05df18e4b';

  const entity = _entity.Entity.from_hex(private_key_hex);

  const address = new _address.Address(entity);
  console.log('Address:', address); // create the APIs

  const api = new _api.LedgerApi(HOST, PORT);
  balance = await api.tokens.balance(entity);
  console.log('Balance:', balance.toString());
  stake = await api.tokens.stake(entity);
  console.log('Stake.. :', stake.toString()); // submit and wait for the transfer to be complete

  stake = await api.tokens.add_stake(entity, 1000, 50).catch(error => {
    console.log(error);
    throw new Error();
  });
  await api.sync([stake]).catch(errors => sync_error(errors));
  setInterval(async () => {
    balance = await api.tokens.balance(entity);
    console.log('Balance............:', balance.toString());
    stake = await api.tokens.stake(entity);
    console.log('Stake..............:', stake.toString());
    cool_down = await api.tokens.stake_cooldown(entity);
    console.log('Stake on cooldown..:', cool_down); // De-stake half of the staked balance

    stake = await api.tokens.stake(entity);
    to_destake = Math.round(stake / 2);
    txs = await api.tokens.de_stake(entity, to_destake, new _bn.BN(500));
    await api.sync([txs]);
    txs = await api.tokens.collect_stake(entity, new _bn.BN(500)); // Collect cooled down stakes

    await api.sync([txs]);
  }, 3000);
}

main();