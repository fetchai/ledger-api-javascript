/* eslint-disable no-undef */

// create the APIs
var api = new result.LedgerApi('127.0.0.1', 8000)
// generate a random identity
const identity1 = new result.Entity()
api.tokens.balance(identity1)

var tx = api.tokens.wealth(identity1, 1000)
api.sync([tx])
api.tokens.balance(identity1)

const identity2 = new result.Entity()
api.tokens.balance(identity2)

var transfer = api.tokens.transfer(identity1, identity2, 480, 20)
api.sync([transfer])
api.tokens.balance(identity1)
api.tokens.balance(identity2)
