var api = new result.LedgerApi('127.0.0.1', 8000)
const identity1 = new result.Entity()
const prom = api.tokens.balance(identity1)
prom.then(function(b){
    window.BALANCE = b
})
