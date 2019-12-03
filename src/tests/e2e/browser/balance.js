var api = new fetchai.LedgerApi('127.0.0.1', 8000)
const identity1 = new fetchai.Entity()
const prom = api.tokens.balance(identity1)
prom.then(function(b){
    window.BALANCE = b
})
