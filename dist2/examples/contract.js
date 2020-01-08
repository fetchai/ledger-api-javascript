"use strict";

var _crypto = require("../fetchai/ledger/crypto");

var _contract = require("../fetchai/ledger/contract");

var _api = require("../fetchai/ledger/api");

var _contracts = require("../contracts");

function sync_error(errors) {
  errors.forEach(tx => console.log(`\nThe following transaction: "${tx.get_digest_hex()}" did not succeed. \nIt exited with status : "${tx.get_status()}" and exit code: "${tx.get_exit_code()}"`));
  throw new Error();
}

async function print_address_balances(api, contract, addresses) {
  let balance, query;

  for (let i = 0; i < addresses.length; i++) {
    // Querying a balance returns an instance of BigNumber (https://github.com/indutny/bn.js/)
    balance = await api.tokens.balance(addresses[i]);
    query = await contract.query(api, 'balance', {
      address: addresses[i]
    });
    console.log(`Address : ${addresses[i]}: ${balance.toString()} bFET ${query} TOK'.`);
  }
}

async function main() {
  const entity1 = _crypto.Entity.from_hex('6e8339a0c6d51fc58b4365bf2ce18ff2698d2b8c40bb13fcef7e1ba05df18e4b');

  const entity2 = _crypto.Entity.from_hex('e833c747ee0aeae29e6823e7c825d3001638bc30ffe50363f8adf2693c3286f8'); // create our first private key pair


  const address1 = new _crypto.Address(entity1); // create a second private key pair

  const address2 = new _crypto.Address(entity2);
  const api = new _api.LedgerApi('127.0.0.1', 8000); // create the smart contract

  const contract = new _contract.Contract(_contracts.TRANSFER_CONTRACT, entity1);
  const created = await contract.create(api, entity1, 4000).catch(errors => {
    console.log(errors);
    throw new Error();
  });
  await api.sync([created]).catch(errors => sync_error(errors));
  console.log('-- BEFORE --');
  await print_address_balances(api, contract, [address1, address2]);
  const tok_transfer_amount = 200;
  const fet_tx_fee = 160;
  const action = await contract.action(api, 'transfer', fet_tx_fee, [entity1], [address1, address2, tok_transfer_amount]);
  await api.sync([action]).catch(errors => sync_error(errors));
  console.log('-- AFTER --');
  await print_address_balances(api, contract, [address1, address2]);
}

main();