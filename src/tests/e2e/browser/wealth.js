const api = new fetchai.LedgerApi('127.0.0.1', 8000)
const identity1 = new fetchai.Entity()
const tx = api.tokens.wealth(identity1, 1000)

tx.then((tx) => {
    const sync = api.sync([tx])
    sync.then(() => {
        const balance = api.tokens.balance(identity1)
        balance.then(res => window.WEALTH = res)
    })
})




