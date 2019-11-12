/* eslint-disable no-undef */

// create the APIs
var api = new result.LedgerApi('127.0.0.1', 8000)
// generate a random identity
const identity1 = new result.Entity()
api.tokens.balance(identity1)
